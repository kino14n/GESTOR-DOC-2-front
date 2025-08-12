// api.js — Punto único de acceso al backend (Railway)
// Importa la base del backend desde config.js
import { config } from './config.js';

// Normaliza la base (sin / final)
const API_BASE = (config?.API_BASE || '').replace(/\/$/, '');

// ===== Helpers =====
function buildUrl(path) {
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

/** fetch JSON/Texto con headers correctos (auto-JSON si body es objeto) */
async function jfetch(path, { method = 'GET', headers, body, signal, timeoutMs = 30000 } = {}) {
  const url = buildUrl(path);

  // Soporte timeout
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new DOMException('Timeout', 'AbortError')), timeoutMs);

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const mergedHeaders = { ...(headers || {}) };
  let finalBody = body;

  // Si el body es objeto/array → JSON
  if (body && !isFormData && typeof body !== 'string' && !(body instanceof Blob)) {
    mergedHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, {
      method,
      mode: 'cors',
      headers: mergedHeaders,
      body: finalBody,
      signal: signal || ctrl.signal,
    });

    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try {
        const j = await res.json();
        msg = j?.message || j?.error || msg;
      } catch (_) {}
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }

    // 204 No Content
    if (res.status === 204) return null;

    const ctype = res.headers.get('content-type') || '';
    if (ctype.includes('application/json')) return res.json();
    return res.text(); // fallback
  } finally {
    clearTimeout(t);
  }
}

/** fetch Blob (para CSV/ZIP/PDF) */
async function jfetchBlob(path, { method = 'GET', headers, body, signal, timeoutMs = 60000 } = {}) {
  const url = buildUrl(path);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new DOMException('Timeout', 'AbortError')), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      mode: 'cors',
      headers,
      body,
      signal: signal || ctrl.signal,
    });
    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try {
        const j = await res.json();
        msg = j?.message || j?.error || msg;
      } catch (_) {}
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return res.blob();
  } finally {
    clearTimeout(t);
  }
}

/** Descarga un blob con nombre sugerido */
export function descargarBlob(nombre, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ===== Endpoints Salud/Diagnóstico =====
export async function ping() { return jfetch('/api/ping'); }
export async function envInfo() { return jfetch('/api/env'); }

// ===== Documentos (lista/búsqueda) =====

/** Lista todos los documentos (puedes ampliar con querystring si lo necesitas) */
export async function listarDocumentos() {
  return jfetch('/api/documentos', { method: 'GET' });
}

/** Búsqueda óptima (texto libre o lista de códigos) */
export async function buscarOptima(texto) {
  return jfetch('/api/documentos/search', {
    method: 'POST',
    body: { texto },
  });
}

// Alias para compatibilidad con tu código previo
export const buscarOptimaAvanzada = buscarOptima;

/** Búsqueda por código (exacto por defecto; usa modo: 'prefijo' para sugerencias) */
export async function buscarPorCodigo(codigo, modo = 'exacto') {
  return jfetch('/api/documentos/search_by_code', {
    method: 'POST',
    body: { codigo, modo },
  });
}

/** Sugerencias de códigos por prefijo (para autocompletado) */
export async function sugerirCodigos(prefix, { signal } = {}) {
  return jfetch('/api/documentos/search_by_code', {
    method: 'POST',
    body: { codigo: prefix, modo: 'prefijo' },
    signal,
  });
}

// ===== CRUD =====

/** Subida JSON (si tu backend espera JSON). Para multipart usa subirDocumentoMultipart. */
export async function subirDocumento(payload) {
  return jfetch('/api/documentos/upload', {
    method: 'POST',
    body: payload,
  });
}

/** Subida/edición con FormData (PDFs). Úsalo desde upload.js si manejas archivos. */
export async function subirDocumentoMultipart(formData, { method = 'POST' } = {}) {
  // NO pongas Content-Type aquí; el navegador agrega el boundary.
  return jfetch('/api/documentos/upload', {
    method,
    body: formData,
  });
}

/** Edición (mismo endpoint con PUT según tu backend) */
export async function editarDocumento(id, payload) {
  return jfetch('/api/documentos/upload', {
    method: 'PUT',
    body: { id, ...payload },
  });
}

/** Eliminar documento (requiere clave de confirmación) */
export async function eliminarDocumento(id, clave) {
  return jfetch('/api/documentos', {
    method: 'DELETE',
    body: { id, clave },
  });
}

// ===== Exportaciones (CSV / ZIP) =====

/** Descargar CSV del estado/ filtro actual (si tu backend expone GET /export/csv?q=...) */
export async function descargarCSV({ q } = {}) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  const blob = await jfetchBlob(`/api/documentos/export/csv${qs}`, { method: 'GET' });
  return blob; // el caller decide si llama a descargarBlob(nombre, blob)
}

/** Descargar ZIP. Acepta { ids } o { filtro } según tu backend. */
export async function descargarZIP(payload) {
  const blob = await jfetchBlob('/api/documentos/export/zip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  return blob;
}

// ===== Exports por defecto (opcional) =====
export default {
  ping,
  envInfo,
  listarDocumentos,
  buscarOptima,
  buscarOptimaAvanzada,
  buscarPorCodigo,
  sugerirCodigos,
  subirDocumento,
  subirDocumentoMultipart,
  editarDocumento,
  eliminarDocumento,
  descargarCSV,
  descargarZIP,
  descargarBlob,
};
