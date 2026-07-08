import { CustomerAuthError, registerCustomer } from "@/lib/customer-auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const session = await registerCustomer({
      fullName: req.body?.fullName || req.body?.name,
      email: req.body?.email,
      phone: req.body?.phone,
      password: req.body?.password,
    });

    return res.status(200).json({
      success: true,
      message: "Account created successfully.",
      ...session,
    });
  } catch (error) {
    return res.status(error instanceof CustomerAuthError ? error.status : 400).json({
      success: false,
      message: error.message || "Unable to create account.",
    });
  }
}
