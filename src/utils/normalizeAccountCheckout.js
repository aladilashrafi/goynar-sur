const clean = (value) => String(value || "").trim();

export function normalizeAccountCheckout(user) {
  const customer = user?.customer || {};
  const shipping = customer.shipping || {};
  const billing = customer.billing || {};
  const delivery = shipping.address_1 || shipping.city || shipping.state ? shipping : billing;
  const fields = {
    firstName: clean(delivery.first_name || billing.first_name || customer.first_name),
    lastName: clean(delivery.last_name || billing.last_name || customer.last_name),
    phone: clean(shipping.phone || billing.phone || user?.phone),
    email: clean(billing.email || user?.email),
    address: clean(delivery.address_1),
    district: clean(delivery.city || delivery.state),
    upazila: clean(delivery.address_2),
    postcode: clean(delivery.postcode),
  };
  const required = [fields.firstName, fields.phone, fields.address, fields.district, fields.upazila];
  const completed = required.filter(Boolean).length;

  return {
    ...fields,
    source: delivery === shipping ? "shipping" : delivery === billing ? "billing" : "none",
    completeness: completed === required.length ? "complete" : completed > 0 ? "partial" : "missing",
  };
}
