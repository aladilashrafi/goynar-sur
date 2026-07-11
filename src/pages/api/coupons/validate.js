import { validateCouponForCart } from "@/lib/coupon-validation";
import { sendApiError } from "@/lib/api-error";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const coupon = await validateCouponForCart({
      code: req.body?.code,
      cart: req.body?.cart,
      email: req.body?.email,
      customerId: req.body?.customerId,
      appliedCouponCodes: req.body?.appliedCouponCodes,
    });
    return res.status(200).json({ success: true, coupon });
  } catch (error) {
    return sendApiError(res, error, "Coupon could not be validated right now.");
  }
}
