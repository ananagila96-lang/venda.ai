// Venda.AI - Storage Service
// Persistência local isolada por tenant para a demo/piloto.
// Em produção, o tenant deverá vir da sessão autenticada no backend.

const TENANT_KEY = 'venda_active_tenant';
const DEFAULT_TENANT = 'demo';

function safeTenant(value) {
  return String(value || DEFAULT_TENANT).trim().replace(/[^a-zA-Z0-9_-]/g, '_') || DEFAULT_TENANT;
}

export function getActiveTenant() {
  try {
    return safeTenant(localStorage.getItem(TENANT_KEY) || DEFAULT_TENANT);
  } catch {
    return DEFAULT_TENANT;
  }
}

export function setActiveTenant(tenantId) {
  const tenant = safeTenant(tenantId);
  localStorage.setItem(TENANT_KEY, tenant);
  return tenant;
}

function tenantKey(key) {
  return `venda.ai:${getActiveTenant()}:${key}`;
}

export function loadStorage(key, fallback = []) {
  try {
    const scopedKey = tenantKey(key);
    const data = localStorage.getItem(scopedKey);
    if (data) return JSON.parse(data);

    // Migração compatível da V1.7: dados legados entram apenas no tenant demo.
    if (getActiveTenant() === DEFAULT_TENANT) {
      const legacy = localStorage.getItem(key);
      if (legacy) {
        localStorage.setItem(scopedKey, legacy);
        localStorage.removeItem(key);
        return JSON.parse(legacy);
      }
    }
    return fallback;
  } catch (error) {
    console.error('Erro ao carregar dados:', key, error);
    return fallback;
  }
}

export function saveStorage(key, value) {
  try {
    localStorage.setItem(tenantKey(key), JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados:', key, error);
    return false;
  }
}

export function removeStorage(key) {
  localStorage.removeItem(tenantKey(key));
}
