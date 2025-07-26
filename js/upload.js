// GESTOR-DOC/frontend/js/upload.js

import { showToast } from './toasts.js'; 

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