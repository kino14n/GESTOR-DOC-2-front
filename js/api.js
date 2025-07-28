// js/api.js

const API_BASE = 'https://gestor-doc-backend-production.up.railway.app/api/documentos';

/** Lista todos los documentos (GET /api/documentos) */
export async function listarDocumentos() {
  const res = await fetch(`${API_BASE}`, { method: 'GET' });
  return res.json();
}

/** Elimina un documento por ID (DELETE /api/documentos/{id}) */
export async function eliminarDocumento(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  return res.json();
}

/**
 * Búsqueda óptima (voraz) por texto libre.
 * POST /api/documentos/search { texto }
 */
export async function buscarOptima(texto) {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto })
  });
  return res.json();
}

/**
 * Autocompletado de códigos (POST /api/documentos/search_by_code { codigo })
 * Devuelve array de strings
 */
export async function sugerirCodigos(prefijo) {
  const res = await fetch(`${API_BASE}/search_by_code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo: prefijo })
  });
  return res.json();
}
