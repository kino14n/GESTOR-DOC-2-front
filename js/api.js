// api.js — Punto único de acceso al backend (Railway)

import { config } from './config.js';

// Normaliza la base (sin / final)
const API_BASE = (config?.API_BASE || '').replace(/\/$/, '');

function buildUrl(path) {
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

/** Fetch con manejo de JSON, timeout y CORS “amigable” */
async function jfetch(
  path,
  { method = 'GET', headers, body, signal, timeoutMs = 30000 } = {}
) {
  const url = buildUrl(path);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new DOMException('Timeout', 'AbortError')), timeoutMs);

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const mergedHeaders = { ...(headers || {}) };
  let finalBody = body;

  // Si el body es objeto → lo mandamos como JSON y seteamos Content-Type
  if (body && !isFormData && typeof body !== 'string' && !(body instanceof Blob)) {
    mergedHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  // Importante: en GET/HEAD sin body NO agregamos Content-Type para evitar preflight
  const res = await fetch(url, {
    method,
    mode: 'cors',
    headers: mergedHeaders,
    body: finalBody,
    signal: signal || ctrl.signal,
  });

  clearTimeout(t);

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

  if (res.status === 204) return null;

  const ctype = res.headers.get('content-type') || '';
  if (ctype.includes('application/json')) return res.json();
  return res.text();
}

/** Fetch de blobs (CSV/ZIP/PDF) */
async function jfetchBlob(
  path,
  { method = 'GET', headers, body, signal, timeoutMs = 60000 } = {}
) {
  const url = buildUrl(path);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new DOMException('Timeout', 'AbortError')), timeoutMs);

  const res = await fetch(url, {
    method,
    mode: 'cors',
    headers,
    body,
    signal: signal || ctrl.signal,
  });

  clearTimeout(t);

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

/* ================== Salud / Diagnóstico ================== */
export async function ping()    { return jfetch('/api/ping'); }
export async function envInfo() { return jfetch('/api/env');  }
// Diagnóstico de backend (opcional si lo añadiste)
export async function diagDoc() { return jfetch('/api/documentos/_diag'); }

/* ================== Documentos ================== */

// Listar
export async function listarDocumentos() {
  return jfetch('/api/documentos', { method: 'GET' });
}

// Búsqueda óptima/avanzada
export async function buscarOptima(texto) {
  return jfetch('/api/documentos/search', {
    method: 'POST',
    body: { texto },
  });
}
export const buscarOptimaAvanzada = buscarOptima;

// Búsqueda por código
export async function buscarPorCodigo(codigo, modo = 'exacto') {
  return jfetch('/api/documentos/search_by_code', {
    method: 'POST',
    body: { codigo, modo },
  });
}

// Sugerencias (prefijo)
export async function sugerirCodigos(prefix, { signal } = {}) {
  return jfetch('/api/documentos/search_by_code', {
    method: 'POST',
    body: { codigo: prefix, modo: 'prefijo' },
    signal,
  });
}

/* ================== CRUD ================== */

// Subir documento con FormData (recomendado: el backend espera 'file')
export async function subirDocumentoMultipart(formData) {
  // No seteamos Content-Type: el navegador pone el boundary correcto
  return jfetch('/api/documentos/upload', {
    method: 'POST',
    body: formData,
  });
}

// Wrapper JSON (solo si tu backend lo soporta; el actual requiere FormData)
export async function subirDocumento(payload) {
  return jfetch('/api/documentos/upload', {
    method: 'POST',
    body: payload,
  });
}

// Editar documento (PUT /api/documentos/:id)
export async function editarDocumento(id, payload) {
  return jfetch(`/api/documentos/${id}`, {
    method: 'PUT',
    body: payload, // puede ser JSON; el backend lo acepta como form o json
  });
}

// Eliminar documento (DELETE /api/documentos/:id)
export async function eliminarDocumento(id /*, clave opcional */) {
  return jfetch(`/api/documentos/${id}`, { method: 'DELETE' });
}

/* ================== Export (si el backend lo expone) ================== */
// Nota: Tu backend actual no tiene estos endpoints; déjalos deshabilitados
// o impleméntalos en el backend antes de usarlos.
export async function descargarCSV({ q } = {}) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  const blob = await jfetchBlob(`/api/documentos/export/csv${qs}`, { method: 'GET' });
  return blob;
}

export async function descargarZIP(payload) {
  const blob = await jfetchBlob('/api/documentos/export/zip', {
    method: 'POST',
    headers:
