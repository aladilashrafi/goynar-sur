import { wcFetch } from "@/lib/woocommerce";
import { sendApiError } from "@/lib/api-error";
import { getStateCodeByName } from "@/lib/bd-states";

function normalizeLineItems(cart = []) {
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
        ...(metaData.length ? { meta_data: metaData } : {}),
      };
    })
    .filter((item) => item.product_id && item.quantity > 0);
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
    const lineItems = normalizeLineItems(body.cart);

    if (!lineItems.length) {
      return res.status(400).json({ success: false, message: "Cart does not contain valid WooCommerce products" });
    }

    const firstName = body.firstName.trim();
    const lastName = body.lastName?.trim() || "-";
    const state = getStateCodeByName(district) || district;
    const shippingCost = Number(body.shippingCost || 0);
    const discountAmount = Number(body.discount || body.coupon?.discountAmount || 0);
    const couponCode = String(body.coupon?.code || "").trim();
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
          total: shippingCost.toFixed(2),
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
