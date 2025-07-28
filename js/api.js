// js/api.js

const API_BASE = 'https://gestor-doc-backend-production.up.railway.app/api/documentos';

/**
 * Búsqueda óptima (inteligente) por texto libre.
 * POST /search { query }
 */
export async function buscarOptima(texto) {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: texto })
  });
  return res.json();
}

/**
 * Busca un documento por código exacto.
 * POST /search_by_code { codigo }
 */
export async function buscarPorCodigo(codigo) {
  const res = await fetch(`${API_BASE}/search_by_code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo })
  });
  return res.json();
}

/** Lista todos los documentos (GET /api/documentos) */
export async function listarDocumentos() {
  const res = await fetch(`${API_BASE}`, { method: 'GET' });
  return res.json();
}

/** Elimina un documento por ID (DELETE /api/documentos?id=ID) */
export async function eliminarDocumento(id) {
  const res = await fetch(`${API_BASE}?id=${id}`, { method: 'DELETE' });
  return res.json();
}
