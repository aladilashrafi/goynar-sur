import { CustomerAuthError, getCustomerFromToken } from "@/lib/customer-auth";

function bearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const token = bearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication is required." });
    }

    const user = await getCustomerFromToken(token);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(error instanceof CustomerAuthError ? error.status : 401).json({
      success: false,
      message: error.message || "Unable to restore your session.",
    });
  }
}
