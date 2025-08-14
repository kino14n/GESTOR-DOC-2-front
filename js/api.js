// api.js — Punto único de acceso al backend (Railway)

import { config } from './config.js';

// Normaliza la base (sin / final)
const API_BASE = (config?.API_BASE || '').replace(/\/$/, '');
const ABS = (p) => (p.startsWith('http') ? p : `${API_BASE}${p}`);

/** Fetch con manejo de JSON, timeout y CORS “amigable” */
async function jfetch(path, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = undefined,
    signal,
    timeoutMs = 30000,
  } = options;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new DOMException('Timeout', 'AbortError')), timeoutMs);

  let finalHeaders = { ...headers };
  let finalBody = body;

  // Si el body es objeto → lo mandamos como JSON y seteamos Content-Type
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !isForm && typeof body !== 'string' && !(body instanceof Blob)) {
    if (!finalHeaders['Content-Type']) finalHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  // Importante: en GET/HEAD sin body NO agregamos Content-Type para evitar preflight
  const res = await fetch(ABS(path), {
    method,
    mode: 'cors',
    headers: finalHeaders,
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

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  if (res.status === 204) return null;
  return res.text();
}

/** Fetch de blobs (CSV/ZIP/PDF) */
async function jfetchBlob(path, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = undefined,
    signal,
    timeoutMs = 60000,
  } = options;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new DOMException('Timeout', 'AbortError')), timeoutMs);

  const res = await fetch(ABS(path), {
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
export const ping    = () => jfetch('/api/ping');
export const envInfo = () => jfetch('/api/env');
// (Opcional, si existe en tu backend)
export const diagDoc = () => jfetch('/api/documentos/_diag');

/* ================== Documentos ================== */

// Listado general
export const listarDocumentos = () =>
  jfetch('/api/documentos', { method: 'GET' });

// Búsqueda óptima / avanzada
export const buscarOptimaAvanzada = (texto) =>
  jfetch('/api/documentos/search', {
    method: 'POST',
    body: { texto },
  });

// Búsqueda por código (exacto/like/prefijo)
export const buscarPorCodigo = (codigo, modo = 'exacto') =>
  jfetch('/api/documentos/search_by_code', {
    method: 'POST',
    body: { codigo, modo },
  });

// Sugerencias (prefijo)
export const sugerirCodigos = (prefix, { signal } = {}) =>
  jfetch('/api/documentos/search_by_code', {
    method: 'POST',
    body: { codigo: prefix, modo: 'prefijo' },
    signal,
  });

/* ================== CRUD ================== */

// Subir documento con FormData (el backend espera 'file')
export const subirDocumentoMultipart = (formData) =>
  jfetch('/api/documentos/upload', {
    method: 'POST',
    body: formData, // no seteamos Content-Type: el navegador pone el boundary
  });

// (Compatibilidad) Subida vía JSON si tu backend lo soporta
export const subirDocumento = (payload) =>
  jfetch('/api/documentos/upload', {
    method: 'POST',
    body: payload,
  });

// Editar documento (PUT /api/documentos/:id)
export const editarDocumento = (id, payload) =>
  jfetch(`/api/documentos/${id}`, {
    method: 'PUT',
    body: payload, // puede ser JSON o FormData
  });

// Eliminar documento (DELETE /api/documentos/:id)
export const eliminarDocumento = (id) =>
  jfetch(`/api/documentos/${id}`, { method: 'DELETE' });

/* ================== Export (si tu backend lo expone) ================== */

export const descargarCSV = ({ q } = {}) => {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return jfetchBlob(`/api/documentos/export/csv${qs}`, { method: 'GET' });
};

export const descargarZIP = (payload = {}) =>
  jfetchBlob('/api/documentos/export/zip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

/* ================== Export por defecto (opcional) ================== */
export default {
  ping,
  envInfo,
  diagDoc,
  listarDocumentos,
  buscarOptimaAvanzada,
  buscarPorCodigo,
  sugerirCodigos,
  subirDocumentoMultipart,
  subirDocumento,
  editarDocumento,
  eliminarDocumento,
  descargarCSV,
  descargarZIP,
  descargarBlob,
};