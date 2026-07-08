import { CustomerAuthError, resetCustomerPassword } from "@/lib/customer-auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const email = req.body?.email;
    const token = req.body?.token;
    const password = req.body?.password;

    if (!email?.trim() || !token?.trim() || !password) {
      return res.status(400).json({ success: false, message: "Email, token, and password are required." });
    }

    const message = await resetCustomerPassword({
      email: email.trim(),
      token: token.trim(),
      password,
    });

    return res.status(200).json({ success: true, message });
  } catch (error) {
    return res.status(error instanceof CustomerAuthError ? error.status : 400).json({
      success: false,
      message: error.message || "Unable to reset password.",
    });
  }
}
