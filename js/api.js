// Punto único de acceso al backend (Railway). Incluye todas las funciones usadas
// por main.js y otros módulos: buscarOptimaAvanzada, buscarPorCodigo,
// sugerirCodigos, listarDocumentos, etc.

import { config } from './config.js';

const API_BASE = config.API_BASE.replace(/\/$/, '');

async function jfetch(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try { const j = await res.json(); msg = j?.message || j?.error || msg; } catch (_) {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch (_) { return { ok: true }; }
}

// Salud
export async function ping() { return jfetch('/api/ping'); }
export async function envInfo() { return jfetch('/api/env'); }

// Listado general de documentos
export async function listarDocumentos() {
  return jfetch('/api/documentos');
}

// Búsqueda óptima avanzada (texto puede ser lista de códigos separada por comas)
export async function buscarOptimaAvanzada(texto) {
  return jfetch('/api/documentos/search', {
    method: 'POST',
    body: JSON.stringify({ texto }),
  });
}

// Búsqueda por código (exacto)
export async function buscarPorCodigo(codigo) {
  return jfetch('/api/documentos/search_by_code', {
    method: 'POST',
    body: JSON.stringify({ codigo, modo: 'exacto' }),
  });
}

// Sugerencias de códigos por prefijo (para autocompletado)
export async function sugerirCodigos(prefix, { signal } = {}) {
  return jfetch('/api/documentos/search_by_code', {
    method: 'POST',
    body: JSON.stringify({ codigo: prefix, modo: 'prefijo' }),
    signal,
  });
}

// Subida/edición (si tu endpoint usa multipart, maneja eso en upload.js)
export async function subirDocumento(payload) {
  return jfetch('/api/documentos/upload', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Eliminar documento
export async function eliminarDocumento(id, clave) {
  return jfetch('/api/documentos', {
    method: 'DELETE',
    body: JSON.stringify({ id, clave }),
  });
}
