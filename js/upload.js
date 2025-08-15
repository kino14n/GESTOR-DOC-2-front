// GESTOR-DOC/frontend/js/upload.js

import { showToast } from './toasts.js';
import { config } from './config.js'; // Importar la configuración

// (La función loadDocumentForEdit no cambia, se omite por brevedad)
export function loadDocumentForEdit(docData) {
  // ... tu código existente va aquí ...
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
      currentPdfInfo.innerHTML = `PDF actual: <a href="${config.API_BASE}/uploads/${docData.path}" target="_blank">${docData.path}</a>`;
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
    
    // --- LÓGICA DE ENDPOINT CORREGIDA ---
    // Aseguramos que la URL base termine sin / y construimos la ruta completa y correcta.
    const API_BASE_URL = config.API_BASE.replace(/\/$/, '');
    const endpoint = isEdit
      ? `${API_BASE_URL}/api/documentos/${docId}`      // Editar: /api/documentos/{id}
      : `${API_BASE_URL}/api/documentos/upload`;     // Crear:  /api/documentos/upload
      
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, { 
          method, 
          body: formData 
          // NO pongas 'Content-Type', el navegador lo hace por ti con FormData
      });
      
      // Manejo de error mejorado para respuestas que no son JSON (como un 404)
      if (!res.ok) {
        const errorText = await res.text(); // Leemos la respuesta como texto
        throw new Error(`El servidor respondió con error ${res.status}: ${errorText}`);
      }

      const data = await res.json(); // Ahora sí, procesamos como JSON

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