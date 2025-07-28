// js/api.js

const API_BASE = 'https://gestor-doc-backend-production.up.railway.app/api/documentos';

/** Lista todos los documentos */
export async function listarDocumentos() {
  const res = await fetch(`${API_BASE}`, { method: 'GET' });
  return res.json();
}

/** Elimina un documento */
export async function eliminarDocumento(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  return res.json();
}

/** Búsqueda Óptima (agrupa por texto libre) */
export async function buscarOptima(texto) {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto })
  });
  return res.json();
}

/** Búsqueda por Código (documentos) */
export async function buscarPorCodigo(code) {
  // reutilizamos el mismo endpoint /search para traer documentos que contengan ese código
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto: code })
  });
  return res.json();
}

/** Sugerir códigos (autocomplete) */
export async function sugerirCodigos(prefijo) {
  const res = await fetch(`${API_BASE}/search_by_code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo: prefijo })
  });
  return res.json();
}
