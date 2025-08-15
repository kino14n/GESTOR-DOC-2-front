// GESTOR-DOC/frontend/js/upload.js

import { showToast } from './toasts.js';
import { config } from './config.js'; // Importar la configuración

// Carga datos para editar un documento, presentando los códigos en columna
export function loadDocumentForEdit(docData) {
  const form = document.getElementById('form-upload');
  const docIdInput = document.getElementById('docId');
  const nameInput = document.getElementById('name');
  const dateInput = document.getElementById('date');
  const codesTextarea = document.getElementById('codes');
  const fileInput = document.getElementById('file');
  const uploadWarning = document.getElementById('uploadWarning');
  const currentPdfInfo = document.getElementById('currentPdfInfo');

  if (!form || !docIdInput || !nameInput || !dateInput || !codesTextarea || !fileInput || !uploadWarning) {
    console.error('Elementos del formulario de carga/edición no encontrados.');
    return;
  }
  if (!docData) {
    console.error('No se proporcionaron datos para cargar el documento.');
    return;
  }

  // Rellenar campos
  docIdInput.value = docData.id || '';
  nameInput.value = docData.name || '';
  dateInput.value = docData.date ? new Date(docData.date).toISOString().split('T')[0] : '';
  // Convertir lista de códigos a columna
  const codigos = docData.codigos_extraidos || '';
  codesTextarea.value = codigos.split(',').map(c => c.trim()).join('\n');

  // Mostrar info del PDF actual
  if (currentPdfInfo) {
    if (docData.path) {
      // Asumiendo que los archivos están en una carpeta 'uploads' accesible o se sirven desde una ruta específica
      currentPdfInfo.innerHTML = `PDF actual: <a href="${config.API_BASE}/uploads/${docData.path}" target="_blank">${docData.path}</a> (sube uno nuevo para reemplazar)`;
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
    // Usamos la URL completa y correcta para evitar ambigüedades.
    const endpoint = isEdit
      ? `${config.API_BASE}/documentos/${docId}` // Para editar: /api/documentos/{id}
      : `${config.API_BASE}/documentos/upload`;  // Para crear: /api/documentos/upload
      
    const method = isEdit ? 'PUT' : 'POST';

    try {
      // IMPORTANTE: No añadir 'Content-Type' en los headers, el navegador lo hace por ti con FormData.
      const res = await fetch(endpoint, { method, body: formData });
      const data = await res.json();

      if (res.ok && data.ok) {
        showToast(isEdit ? 'Documento editado correctamente' : 'Documento subido correctamente', true);
        form.reset();
        form.querySelector('#docId').value = '';
        const currentPdfInfo = document.getElementById('currentPdfInfo');
        if (currentPdfInfo) currentPdfInfo.innerHTML = '';
        
        // Opcional: Recargar la lista de documentos si existe una función para ello
        // if (typeof refreshDocumentList === 'function') {
        //   refreshDocumentList();
        // }

      } else {
        showToast('Error: ' + (data.error || 'Error desconocido del servidor'), false);
      }
    } catch (e) {
      showToast('Error de conexión con el servidor. Revisa la consola.', false);
      console.error('Error en fetch:', e);
    }
  });
}

// Haz global la función de edición para que otros scripts puedan llamarla
window.loadDocumentForEdit = loadDocumentForEdit;