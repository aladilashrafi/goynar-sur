import { wcFetch } from "@/lib/woocommerce";
import { apiError, sendApiError } from "@/lib/api-error";
import { getStateCodeByName } from "@/lib/bd-states";
import { validateCouponForCart } from "@/lib/coupon-validation";

function toMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Number(amount.toFixed(2)) : 0;
}

function hasManagedStock(item = {}) {
  return Boolean(item.manage_stock) && Number.isFinite(Number(item.stock_quantity));
}

function hasBackorders(item = {}) {
  return Boolean(item.backorders_allowed) || item.backorders === "yes" || item.backorders === "notify";
}

function itemTitle(cartItem = {}, wcItem = {}) {
  return wcItem.name || cartItem.title || "This product";
}

function normalizeCartItems(cart = []) {
  return cart
    .map((item) => {
      const metaData = Array.isArray(item.selectedAttributes)
        ? item.selectedAttributes.map((attribute) => ({
            key: attribute.name,
            value: attribute.value,
          }))
        : [];

      return {
        product_id: Number(item.product_id || item.id || item._id),
        variation_id: item.variation_id ? Number(item.variation_id) : undefined,
        quantity: Number(item.orderQuantity || item.quantity || 1),
        client_price: item.price,
        title: item.title,
        ...(metaData.length ? { meta_data: metaData } : {}),
      };
    })
    .filter((item) => item.product_id && item.quantity > 0);
}

async function getCurrentPurchasableItem(item) {
  const { data: product } = await wcFetch(`/products/${item.product_id}`);

  if (!product || product.status !== "publish") {
    throw apiError(`${itemTitle(item, product)} is no longer available.`, 409, "product_unavailable");
  }

  if (product.type === "variable" && !item.variation_id) {
    throw apiError(`Please select product options again for ${itemTitle(item, product)}.`, 409, "variation_required");
  }

  if (!item.variation_id) {
    return { product, purchasableItem: product };
  }

  const { data: variation } = await wcFetch(`/products/${item.product_id}/variations/${item.variation_id}`);

  if (!variation || Number(variation.parent_id) !== Number(item.product_id)) {
    throw apiError(`Selected options for ${itemTitle(item, product)} are no longer valid.`, 409, "variation_unavailable");
  }

  return { product, purchasableItem: variation };
}

async function verifyLineItem(item) {
  const { product, purchasableItem } = await getCurrentPurchasableItem(item);
  const title = itemTitle(item, purchasableItem.name ? purchasableItem : product);

  if (purchasableItem.purchasable === false) {
    throw apiError(`${title} is not purchasable right now.`, 409, "product_not_purchasable");
  }

  if (purchasableItem.stock_status === "outofstock") {
    throw apiError(`${title} is out of stock. Please remove it from your cart.`, 409, "product_out_of_stock");
  }

  if (hasManagedStock(purchasableItem) && !hasBackorders(purchasableItem)) {
    const availableQuantity = Number(purchasableItem.stock_quantity);
    if (item.quantity > availableQuantity) {
      throw apiError(
        `Only ${availableQuantity} of ${title} is available. Please update your cart quantity.`,
        409,
        "insufficient_stock"
      );
    }
  }

  if (item.client_price !== undefined && item.client_price !== null && item.client_price !== "") {
    const clientPrice = toMoney(item.client_price);
    const currentPrice = toMoney(purchasableItem.price || purchasableItem.sale_price || purchasableItem.regular_price);
    if (clientPrice !== currentPrice) {
      throw apiError(
        `Price changed for ${title}. Please remove and add it to your cart again.`,
        409,
        "price_changed"
      );
    }
  }

  return {
    product_id: item.product_id,
    ...(item.variation_id ? { variation_id: item.variation_id } : {}),
    quantity: item.quantity,
    ...(item.meta_data ? { meta_data: item.meta_data } : {}),
  };
}

async function verifyLineItems(cart = []) {
  const normalizedItems = normalizeCartItems(cart);

  if (!normalizedItems.length) {
    throw apiError("Cart does not contain valid WooCommerce products", 400, "invalid_cart");
  }

  return Promise.all(normalizedItems.map(verifyLineItem));
}

function validate(body) {
  if (!Array.isArray(body.cart) || body.cart.length === 0) return "Cart is empty";
  if (!body.firstName?.trim()) return "First name is required";
  if (!body.phone?.trim() && !body.contactNo?.trim()) return "Phone is required";
  if (!body.address?.trim()) return "Address is required";
  if (!body.district?.trim() && !body.city?.trim()) return "District is required";
  if (!body.upazila?.trim() && !body.address_2?.trim()) return "Upazila or area is required";
  const phone = String(body.phone || body.contactNo || "").trim();
  if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone)) return "A valid Bangladesh phone number is required";
  const email = String(body.email || "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "A valid email address is required";
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const error = validate(req.body || {});
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const body = req.body;
    const district = body.district || body.city;
    const phone = body.phone || body.contactNo;
    const lineItems = await verifyLineItems(body.cart);

    const firstName = body.firstName.trim();
    const lastName = body.lastName?.trim() || "-";
    const state = getStateCodeByName(district) || district;
    const shippingCost = Number(body.shippingCost || 0);
    const couponCode = String(body.coupon?.code || "").trim();
    const validatedCoupon = couponCode
      ? await validateCouponForCart({
          code: couponCode,
          cart: body.cart,
          email: body.email,
          customerId: body.customerId,
        })
      : null;
    const discountAmount = Number(validatedCoupon?.discountAmount || 0);
    const finalShippingCost = validatedCoupon?.freeShipping ? 0 : shippingCost;
    const fullAddress = [body.address, body.upazila || body.address_2].filter(Boolean).join(", ");

    const orderPayload = {
      payment_method: "cod",
      payment_method_title: "Cash on Delivery",
      set_paid: false,
      status: "processing",
      ...(body.customerId ? { customer_id: Number(body.customerId) } : {}),
      billing: {
        first_name: firstName,
        last_name: lastName,
        address_1: body.address,
        address_2: body.upazila || body.address_2 || "",
        city: district,
        state,
        postcode: body.zipCode || "",
        country: "BD",
        email: body.email || "",
        phone,
      },
      shipping: {
        first_name: firstName,
        last_name: lastName,
        address_1: body.address,
        address_2: body.upazila || body.address_2 || "",
        city: district,
        state,
        postcode: body.zipCode || "",
        country: "BD",
      },
      line_items: lineItems,
      shipping_lines: [
        {
          method_id: "flat_rate",
          method_title: body.shippingOption || "Cash on Delivery Shipping",
          total: finalShippingCost.toFixed(2),
        },
      ],
      ...(couponCode
        ? {
            coupon_lines: [
              {
                code: couponCode,
                discount: discountAmount.toFixed(2),
              },
            ],
          }
        : {}),
      customer_note: body.orderNote || "",
      meta_data: [
        { key: "_goynar_sur_payment_method", value: "cod" },
        { key: "_goynar_sur_delivery_address", value: fullAddress },
        ...(couponCode
          ? [
              { key: "_goynar_sur_coupon_code", value: couponCode },
              { key: "_goynar_sur_coupon_discount", value: discountAmount.toFixed(2) },
            ]
          : []),
      ],
    };

    const { data } = await wcFetch("/orders", {
      method: "POST",
      body: orderPayload,
    });

    return res.status(200).json({ success: true, order: data });
  } catch (error) {
    return sendApiError(res, error, "We could not place the order right now. Please try again or contact us.");
  }
}
