// GESTOR-DOC/frontend/js/upload.js

import { showToast } from './toasts.js'; 

// Esta función ahora se EXPORTA para ser importada por otros módulos
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
  
  // Rellenar los campos del formulario con los datos del documento
  docIdInput.value = docData.id || '';
  nameInput.value = docData.name || '';
  dateInput.value = docData.date ? new Date(docData.date).toISOString().split('T')[0] : ''; 
  codesTextarea.value = docData.codigos_extraidos || ''; 
  
  if (currentPdfInfo) {
    if (docData.path) {
      currentPdfInfo.innerHTML = `PDF actual: <a href="uploads/${docData.path}" target="_blank">${docData.path}</a> (sube uno nuevo para reemplazar)`;
    } else {
      currentPdfInfo.innerHTML = 'No hay PDF asociado.';
    }
  }
  
  fileInput.value = '';
}

export function initUploadForm() {
  const form = document.getElementById('form-upload');
  if(!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const res = await fetch('https://gestor-doc-backend-production.up.railway.app/api/documentos/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if(data.ok){
        showToast('Documento subido correctamente');
        form.reset();
      } else {
        showToast('Error subiendo documento: ' + data.error, false);
      }
    } catch(e) {
      showToast('Error en la subida', false);
      console.error(e);
    }
  });
}