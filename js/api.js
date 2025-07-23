
const API_BASE = 'https://gestor-doc-backend-production.up.railway.app/api/documentos';

export async function buscarPorCodigo(codigo) {
  const res = await fetch(`${API_BASE}/search_by_code`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ codigo })
  });
  return res.json();
}

export async function listarDocumentos() {
  const res = await fetch(`${API_BASE}`, { method: 'GET' });
  return res.json();
}

export async function eliminarDocumento(id) {
  const res = await fetch(`${API_BASE}?id=${id}`, { method: 'DELETE' });
  return res.json();
}
