import { getStateCodeByName } from "@/lib/bd-states";
import { createStoreCartSession, storeFetch } from "@/lib/store-api";

function moneyToNumber(value, minorUnit = 2) {
  const amount = Number(value || 0) / 10 ** minorUnit;
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeCartItem(item = {}) {
  return {
    id: Number(item.id || item.product_id || item.parent_id || item._id),
    quantity: Number(item.orderQuantity || item.quantity || 1),
    variation: Array.isArray(item.store_api_variation) ? item.store_api_variation : undefined,
  };
}

function mapRate(rate = {}, totals = {}, shippingPackage = {}) {
  const minorUnit = Number(totals.currency_minor_unit ?? 2);
  return {
    rateId: rate.rate_id,
    packageId: shippingPackage.package_id,
    name: rate.name || rate.label || "Shipping",
    description: rate.description || "",
    deliveryTime: rate.delivery_time || "",
    methodId: rate.method_id || "",
    instanceId: rate.instance_id || null,
    selected: Boolean(rate.selected),
    price: moneyToNumber(rate.price, minorUnit),
  };
}

async function addItemsToStoreCart(cart, session) {
  let currentSession = session;
  let cartData = cart;

  for (const rawItem of cart) {
    const item = normalizeCartItem(rawItem);
    if (!item.id || item.quantity <= 0) continue;

    const result = await storeFetch("/cart/add-item", {
      method: "POST",
      session: currentSession,
      body: item,
    });
    currentSession = result.session;
    cartData = result.data;
  }

  return { cartData, session: currentSession };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    if (!Array.isArray(body.cart) || body.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const district = body.district || body.city;
    const state = getStateCodeByName(district) || district;
    if (!district || !state) {
      return res.status(400).json({ success: false, message: "District is required to calculate shipping" });
    }

    const initial = await createStoreCartSession();
    const seeded = await addItemsToStoreCart(body.cart, initial.session);
    const address = {
      country: "BD",
      state,
      city: district,
      postcode: body.zipCode || "",
      address_1: body.address || "",
      address_2: body.upazila || body.address_2 || "",
    };

    const updated = await storeFetch("/cart/update-customer", {
      method: "POST",
      session: seeded.session,
      body: {
        billing_address: address,
        shipping_address: address,
      },
    });

    const cart = updated.data;
    const rates = (cart.shipping_rates || []).flatMap((shippingPackage) =>
      (shippingPackage.shipping_rates || []).map((rate) => mapRate(rate, cart.totals, shippingPackage))
    );
    const selectedRate = rates.find((rate) => rate.selected) || rates[0] || null;

    return res.status(200).json({
      success: true,
      rates,
      selectedRate,
      totalShipping: moneyToNumber(cart.totals?.total_shipping, cart.totals?.currency_minor_unit),
      raw: {
        needsShipping: cart.needs_shipping,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to calculate shipping",
    });
  }
}
