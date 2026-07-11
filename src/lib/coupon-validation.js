import { wcFetch } from "./woocommerce";
import { apiError } from "./api-error";

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Number(amount.toFixed(2)) : 0;
}

function normalizeCart(cart = []) {
  return cart
    .map((item) => ({
      productId: Number(item.product_id || item.id || item._id),
      variationId: Number(item.variation_id || 0),
      quantity: Math.max(1, Number(item.orderQuantity || item.quantity || 1)),
    }))
    .filter((item) => item.productId);
}

function matchesEmailRestriction(email = "", restriction = "") {
  const escaped = String(restriction)
    .trim()
    .toLowerCase()
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i").test(String(email).trim());
}

async function getVerifiedCartLines(cart = []) {
  return Promise.all(normalizeCart(cart).map(async (item) => {
    const { data: product } = await wcFetch(`/products/${item.productId}`);
    let pricedItem = product;

    if (item.variationId) {
      const { data: variation } = await wcFetch(
        `/products/${item.productId}/variations/${item.variationId}`
      );
      if (!variation || Number(variation.parent_id) !== item.productId) {
        throw apiError("A selected product option is no longer valid.", 409, "variation_unavailable");
      }
      pricedItem = variation;
    }

    const price = money(pricedItem.price || pricedItem.sale_price || pricedItem.regular_price);
    return {
      ...item,
      price,
      subtotal: money(price * item.quantity),
      categoryIds: (product.categories || []).map((category) => Number(category.id)).filter(Boolean),
      onSale: Boolean(pricedItem.on_sale ?? product.on_sale),
    };
  }));
}

function isEligibleLine(line, coupon) {
  const includedProducts = (coupon.product_ids || []).map(Number);
  const excludedProducts = (coupon.excluded_product_ids || []).map(Number);
  const includedCategories = (coupon.product_categories || []).map(Number);
  const excludedCategories = (coupon.excluded_product_categories || []).map(Number);
  const lineIds = [line.productId, line.variationId].filter(Boolean);

  if (includedProducts.length && !lineIds.some((id) => includedProducts.includes(id))) return false;
  if (excludedProducts.length && lineIds.some((id) => excludedProducts.includes(id))) return false;
  if (includedCategories.length && !line.categoryIds.some((id) => includedCategories.includes(id))) return false;
  if (excludedCategories.length && line.categoryIds.some((id) => excludedCategories.includes(id))) return false;
  if (coupon.exclude_sale_items && line.onSale) return false;
  return true;
}

function applyItemLimit(coupon, lines) {
  let remaining = Number(coupon.limit_usage_to_x_items || 0);
  if (!remaining) return lines;

  return lines.flatMap((line) => {
    if (remaining <= 0) return [];
    const quantity = Math.min(line.quantity, remaining);
    remaining -= quantity;
    return [{ ...line, quantity, subtotal: money(line.price * quantity) }];
  });
}

function calculateDiscount(coupon, lines) {
  const amount = money(coupon.amount);
  const eligibleSubtotal = money(lines.reduce((sum, line) => sum + line.subtotal, 0));

  if (coupon.discount_type === "percent") {
    return money(Math.min(eligibleSubtotal, eligibleSubtotal * amount / 100));
  }
  if (coupon.discount_type === "fixed_product") {
    return money(lines.reduce(
      (sum, line) => sum + Math.min(line.subtotal, amount * line.quantity),
      0
    ));
  }
  if (coupon.discount_type === "fixed_cart") {
    return money(Math.min(eligibleSubtotal, amount));
  }
  return 0;
}

export async function validateCouponForCart({
  code,
  cart,
  email = "",
  customerId,
  appliedCouponCodes = [],
}) {
  const normalizedCode = String(code || "").trim();
  if (!normalizedCode) throw apiError("Coupon code is required.", 400, "coupon_required");
  if (!Array.isArray(cart) || !cart.length) {
    throw apiError("Add products before applying a coupon.", 400, "empty_cart");
  }

  const [{ data }, lines] = await Promise.all([
    wcFetch("/coupons", { params: { code: normalizedCode, per_page: 1 } }),
    getVerifiedCartLines(cart),
  ]);
  const coupon = Array.isArray(data) ? data[0] : null;

  if (!coupon || coupon.code?.toLowerCase() !== normalizedCode.toLowerCase()) {
    throw apiError("Coupon code was not found.", 404, "coupon_not_found");
  }
  if (coupon.status !== "publish") throw apiError("This coupon is not active.", 400, "coupon_inactive");
  if (coupon.date_expires || coupon.date_expires_gmt) {
    const expiresAt = new Date(coupon.date_expires || coupon.date_expires_gmt).getTime();
    if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
      throw apiError("This coupon has expired.", 400, "coupon_expired");
    }
  }

  const usageLimit = Number(coupon.usage_limit || 0);
  if (usageLimit && Number(coupon.usage_count || 0) >= usageLimit) {
    throw apiError("This coupon has reached its usage limit.", 400, "coupon_usage_limit");
  }

  const restrictions = coupon.email_restrictions || [];
  if (restrictions.length) {
    if (!email) {
      throw apiError("Enter your checkout email before applying this coupon.", 400, "coupon_email_required");
    }
    if (!restrictions.some((restriction) => matchesEmailRestriction(email, restriction))) {
      throw apiError("This coupon is not available for this email address.", 400, "coupon_email_restricted");
    }
  }

  const perUserLimit = Number(coupon.usage_limit_per_user || 0);
  if (perUserLimit) {
    const identityValues = [String(customerId || ""), String(email || "").toLowerCase()].filter(Boolean);
    if (!identityValues.length) {
      throw apiError("Enter your checkout email before applying this coupon.", 400, "coupon_identity_required");
    }
    const uses = (coupon.used_by || []).filter((value) =>
      identityValues.includes(String(value).toLowerCase())
    ).length;
    if (uses >= perUserLimit) {
      throw apiError("You have already used this coupon the maximum number of times.", 400, "coupon_user_limit");
    }
  }

  const otherCodes = appliedCouponCodes
    .map((item) => String(item).toLowerCase())
    .filter((item) => item && item !== coupon.code.toLowerCase());
  if (coupon.individual_use && otherCodes.length) {
    throw apiError("This coupon cannot be combined with another coupon.", 400, "coupon_individual_use");
  }

  const subtotal = money(lines.reduce((sum, line) => sum + line.subtotal, 0));
  const minimum = money(coupon.minimum_amount);
  const maximum = money(coupon.maximum_amount);
  if (minimum && subtotal < minimum) {
    throw apiError(`This coupon requires a minimum order of \u09F3${minimum.toLocaleString("en-BD")}.`, 400, "coupon_minimum");
  }
  if (maximum && subtotal > maximum) {
    throw apiError(`This coupon applies only up to \u09F3${maximum.toLocaleString("en-BD")}.`, 400, "coupon_maximum");
  }

  const eligibleLines = applyItemLimit(
    coupon,
    lines.filter((line) => isEligibleLine(line, coupon))
  );
  const discountAmount = calculateDiscount(coupon, eligibleLines);
  if (!eligibleLines.length || (discountAmount <= 0 && !coupon.free_shipping)) {
    throw apiError("This coupon does not apply to the current cart.", 400, "coupon_not_applicable");
  }

  return {
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.discount_type,
    amount: coupon.amount,
    discountAmount,
    description: coupon.description || "",
    freeShipping: Boolean(coupon.free_shipping),
    individualUse: Boolean(coupon.individual_use),
    eligibleProductIds: eligibleLines.map((line) => line.variationId || line.productId),
  };
}
