import {
  CustomerAuthError,
  getCustomerFromToken,
  updateCustomerProfile,
} from "@/lib/customer-auth";

function bearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
}

function splitName(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

function profilePayload(body = {}) {
  const { firstName, lastName } = splitName(body.name || body.displayName);
  const payload = {};
  const billing = body.billing && typeof body.billing === "object" ? body.billing : null;
  const shipping = body.shipping && typeof body.shipping === "object" ? body.shipping : null;

  if (body.email) payload.email = body.email;
  if (body.phone) payload.phone = body.phone;
  if (body.password) payload.password = body.password;
  if (body.currentPassword || body.current_password) {
    payload.current_password = body.currentPassword || body.current_password;
  }

  if (firstName) payload.first_name = firstName;
  if (lastName) payload.last_name = lastName;
  if (body.displayName || body.name) payload.display_name = body.displayName || body.name;

  if (billing) {
    payload.billing = {
      first_name: billing.first_name || firstName,
      last_name: billing.last_name || lastName,
      email: billing.email || body.email || "",
      phone: billing.phone || body.phone || "",
      address_1: billing.address_1 || "",
      address_2: billing.address_2 || "",
      city: billing.city || "",
      state: billing.state || billing.city || "",
      postcode: billing.postcode || "",
      country: "BD",
    };
  }

  if (shipping) {
    payload.shipping = {
      first_name: shipping.first_name || firstName,
      last_name: shipping.last_name || lastName,
      address_1: shipping.address_1 || "",
      address_2: shipping.address_2 || "",
      city: shipping.city || "",
      state: shipping.state || shipping.city || "",
      postcode: shipping.postcode || "",
      country: "BD",
    };
  }

  if (!billing && !shipping && (body.address || body.city || body.district || body.upazila || body.phone || body.email)) {
    payload.billing = {
      first_name: firstName,
      last_name: lastName,
      email: body.email || "",
      phone: body.phone || "",
      address_1: body.address || "",
      address_2: body.upazila || body.address_2 || "",
      city: body.district || body.city || "",
      state: body.district || body.city || "",
      postcode: body.zipCode || body.postcode || "",
      country: "BD",
    };
    payload.shipping = {
      first_name: firstName,
      last_name: lastName,
      address_1: body.address || "",
      address_2: body.upazila || body.address_2 || "",
      city: body.district || body.city || "",
      state: body.district || body.city || "",
      postcode: body.zipCode || body.postcode || "",
      country: "BD",
    };
  }

  return payload;
}

export default async function handler(req, res) {
  if (!["GET", "PATCH", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, PATCH, POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const token = bearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication is required." });
    }

    if (req.method === "GET") {
      const user = await getCustomerFromToken(token);
      return res.status(200).json({ success: true, user });
    }

    const user = await updateCustomerProfile(token, profilePayload(req.body));
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    return res.status(error instanceof CustomerAuthError ? error.status : 400).json({
      success: false,
      message: error.message || "Unable to update profile.",
    });
  }
}
