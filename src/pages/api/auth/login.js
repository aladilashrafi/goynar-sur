import { CustomerAuthError, loginCustomer } from "@/lib/customer-auth";
import { sendApiError } from "@/lib/api-error";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const email = req.body?.email?.trim();
    const password = req.body?.password;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const session = await loginCustomer(email, password);
    return res.status(200).json({ success: true, ...session });
  } catch (error) {
    return sendApiError(
      res,
      error instanceof CustomerAuthError ? error : { ...error, status: 401 },
      "Unable to sign in."
    );
  }
}
