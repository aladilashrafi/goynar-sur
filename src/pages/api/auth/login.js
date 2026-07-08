import { CustomerAuthError, loginCustomer } from "@/lib/customer-auth";

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
    return res.status(error instanceof CustomerAuthError ? error.status : 401).json({
      success: false,
      message: error.message || "Unable to sign in.",
    });
  }
}
