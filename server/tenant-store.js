// P0 interface: keeps tenant resolution outside the WhatsApp transport.
// Replace this adapter with Postgres/managed DB before multi-instance production.
const tenants = new Map();

export function registerTenant(tenant) {
  if (!tenant?.id || !tenant?.phoneNumberId) throw new Error("tenant.id and tenant.phoneNumberId are required");
  tenants.set(String(tenant.phoneNumberId), Object.freeze({ ...tenant }));
}

export function resolveTenantByPhoneNumberId(phoneNumberId) {
  return tenants.get(String(phoneNumberId)) || null;
}

export function clearTenantsForTests() { tenants.clear(); }
