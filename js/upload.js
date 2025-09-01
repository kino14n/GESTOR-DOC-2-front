// js/upload.js

import { showToast } from './toasts.js';
import { config } from './config.js';
import { tenantConfig } from './tenant_config.js';

export function loadDocumentForEdit(docData) {
  const form = document.getElementById('form-upload');
  const docIdInput = document.getElementById('docId');
  const nameInput = document.getElementById('name');
  const dateInput = document.getElementById('date');
  const codesTextarea = document.getElementById('codes');
  const fileInput = document.getElementById('file');
  if (!form || !docIdInput || !nameInput || !dateInput || !codesTextarea || !fileInput) return;

  docIdInput.value = docData.id || '';
  nameInput.value = docData.name || '';
  dateInput.value = docData.date ? new Date(docData.date).toISOString().split('T')[0] : '';
  codesTextarea.value = (docData.codigos_extraidos || '').split(',').map(c => c.trim()).join('\n');
  const currentPdfInfo = document.getElementById('currentPdfInfo');

  if (currentPdfInfo) {
    if (docData.path) {
      // Muestra el enlace al PDF actual usando la URL de R2
      currentPdfInfo.innerHTML = `PDF actual: <a href="${tenantConfig.r2PublicUrl}/${docData.path}" target="_blank">${docData.path}</a>`;
    } else {
      currentPdfInfo.innerHTML = 'No hay PDF asociado.';
    }
  }
  fileInput.value = '';
}

// Inicializa el formulario para subir o editar
export function initUploadForm() {
  const form = document.getElementById('form-upload');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const docId = form.querySelector('#docId').value.trim();

    const isEdit = docId !== '';
    
    const API_BASE_URL = config.API_BASE.replace(/\/$/, '');
    const endpoint = isEdit
      ? `${API_BASE_URL}/api/documentos/${docId}`
      : `${API_BASE_URL}/api/documentos/upload`;
      
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, { 
          method, 
          body: formData 
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`El servidor respondió con error ${res.status}: ${errorText}`);
      }

      const data = await res.json();

      if (data.ok) {
        showToast(isEdit ? 'Documento editado' : 'Documento subido', true);
        form.reset();
        form.querySelector('#docId').value = '';
        const currentPdfInfo = document.getElementById('currentPdfInfo');
        if (currentPdfInfo) currentPdfInfo.innerHTML = '';
      } else {
        showToast('Error: ' + (data.error || 'Desconocido'), false);
      }
    } catch (e) {
      showToast(`Error de conexión: ${e.message}`, false);
      console.error('Error en fetch:', e);
    }
  });
}

// Hacemos la función global
window.loadDocumentForEdit = loadDocumentForEdit;