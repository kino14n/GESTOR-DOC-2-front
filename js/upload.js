// js/upload.js — REEMPLAZA COMPLETO

import { subirDocumentoMultipart } from './api.js';
import { showToast } from './toasts.js';
import { tenantConfig } from './tenant_config.js';

// Helpers DOM
const $ = (sel, ctx = document) => ctx.querySelector(sel);

// Inicializa el formulario de subida
export function initUploadForm() {
  const form = $('#upload-form') || document; // soporta tanto <form id="upload-form"> como listeners en el doc
  const btnGuardar = $('#btn-guardar') || $('#guardar') || $('button[type="submit"]');

  if (!form || !btnGuardar) {
    console.warn('[upload] No se encontró el formulario o el botón Guardar');
    return;
  }

  // Evitar doble envío
  let busy = false;

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (busy) return;
    busy = true;

    try {
      const nombre = $('#nombre')?.value?.trim() || $('#input-nombre')?.value?.trim() || '';
      const fecha  = $('#fecha')?.value || $('#input-fecha')?.value || '';
      const fileEl = $('#file') || $('#pdf') || $('input[type="file"]');
      const codigos = $('#codigos')?.value || $('#input-codigos')?.value || '';

      if (!fileEl || !fileEl.files || fileEl.files.length === 0) {
        showToast('Selecciona un PDF para subir', false);
        busy = false;
        return;
      }
      const file = fileEl.files[0];

      // Construye FormData — no pongas Content-Type manualmente
      const fd = new FormData();
      fd.append('file', file);         // <- el backend espera "file"
      if (nombre) fd.append('name', nombre);
      if (fecha)  fd.append('date', fecha);
      if (codigos) fd.append('codigos', codigos);

      // DEBUG opcional: ver qué tenant se enviará (lo añade jfetch)
      console.log('Subiendo para tenant:', tenantConfig.id);

      // Llamada que SI agrega X-Tenant-ID
      await subirDocumentoMultipart(fd);

      showToast('Documento subido con éxito');
      // Limpia el formulario
      try { form.reset(); } catch(_) {}
    } catch (err) {
      console.error('Error al subir:', err);
      showToast(`Error al subir: ${err?.message || err}`, false);
    } finally {
      busy = false;
    }
  });
}

// Si quieres auto-inicializar al cargar la página:
document.addEventListener('DOMContentLoaded', () => {
  initUploadForm();
});
