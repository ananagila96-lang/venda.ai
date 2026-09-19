// Venda.AI - Storage Service
// Camada isolada de persistência local.
// Futuramente pode ser substituída por API/banco sem alterar componentes.

export function loadStorage(key, fallback = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error('Erro ao carregar dados:', key, error);
    return fallback;
  }
}

export function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados:', key, error);
    return false;
  }
}

export function removeStorage(key) {
  localStorage.removeItem(key);
}
