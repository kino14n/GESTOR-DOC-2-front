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
 * Búsqueda Óptima Avanzada (set cover) por lista de códigos.
 * POST /api/documentos/search_optima { codigos }
 * Devuelve { documentos: [{ documento, codigos_cubre }], codigos_faltantes: [] }
 */
export async function buscarOptimaAvanzada(codigosTexto) {
  const res = await fetch(`${API_BASE}/search_optima`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigos: codigosTexto })
  });
  return res.json();
}

/**
 * Búsqueda por código (usa /search para 1 solo código si lo necesitas).
 */
export async function buscarPorCodigo(code) {
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
