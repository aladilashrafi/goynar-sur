import { CustomerAuthError, requestCustomerPasswordReset } from "@/lib/customer-auth";
import { sendApiError } from "@/lib/api-error";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const email = req.body?.email || req.body?.verifyEmail;
    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const message = await requestCustomerPasswordReset(email.trim());
    return res.status(200).json({ success: true, message });
  } catch (error) {
    return sendApiError(
      res,
      error instanceof CustomerAuthError ? error : { ...error, status: 400 },
      "Unable to start password reset."
    );
  }
}
