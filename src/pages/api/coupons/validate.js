import { wcFetch } from "@/lib/woocommerce";
import { sendApiError } from "@/lib/api-error";

function cartSubtotal(cart = []) {
  return cart.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.orderQuantity || item.quantity || 1);
  }, 0);
}

function isExpired(coupon = {}) {
  if (!coupon.date_expires && !coupon.date_expires_gmt) return false;
  return new Date(coupon.date_expires || coupon.date_expires_gmt).getTime() < Date.now();
}

function calcDiscount(coupon = {}, subtotal = 0) {
  const amount = Number(coupon.amount || 0);
  if (coupon.discount_type === "percent") {
    return Math.min(subtotal, (subtotal * amount) / 100);
  }
  if (coupon.discount_type === "fixed_product" || coupon.discount_type === "fixed_cart") {
    return Math.min(subtotal, amount);
  }
  return 0;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const code = String(req.body?.code || "").trim();
    const cart = Array.isArray(req.body?.cart) ? req.body.cart : [];

    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required." });
    }

    if (!cart.length) {
      return res.status(400).json({ success: false, message: "Add products before applying a coupon." });
    }

    const { data } = await wcFetch("/coupons", {
      params: {
        code,
        per_page: 1,
      },
    });

    const coupon = Array.isArray(data) ? data[0] : null;

    if (!coupon || coupon.code?.toLowerCase() !== code.toLowerCase()) {
      return res.status(404).json({ success: false, message: "Coupon code was not found." });
    }

    if (!coupon.status || coupon.status !== "publish") {
      return res.status(400).json({ success: false, message: "This coupon is not active." });
    }

    if (isExpired(coupon)) {
      return res.status(400).json({ success: false, message: "This coupon has expired." });
    }

    const subtotal = cartSubtotal(cart);
    const minimum = Number(coupon.minimum_amount || 0);
    const maximum = Number(coupon.maximum_amount || 0);

    if (minimum && subtotal < minimum) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order of ৳${minimum.toLocaleString("en-BD")}.`,
      });
    }

    if (maximum && subtotal > maximum) {
      return res.status(400).json({
        success: false,
        message: `This coupon applies only up to ৳${maximum.toLocaleString("en-BD")}.`,
      });
    }

    const discountAmount = calcDiscount(coupon, subtotal);
    if (discountAmount <= 0) {
      return res.status(400).json({ success: false, message: "This coupon does not apply to the current cart." });
    }

    return res.status(200).json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        amount: coupon.amount,
        discountAmount: Number(discountAmount.toFixed(2)),
        description: coupon.description || "",
        freeShipping: Boolean(coupon.free_shipping),
      },
    });
  } catch (error) {
    return sendApiError(res, error, "Coupon could not be validated right now.");
  }
}
