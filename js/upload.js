// GESTOR-DOC/frontend/js/upload.js

import { showToast } from './toasts.js'; // ¡Esta línea es la nueva importación necesaria!

export function initUploadForm() {
  const form = document.getElementById('form-upload');
  if(!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const alertWarning = document.getElementById('uploadWarning'); // Necesario para el mensaje de advertencia

    // Validar tamaño archivo (re-incluido de tu main.js original)
    const fileInput = document.getElementById('file');
    if(fileInput.files.length > 0 && fileInput.files[0].size > 10 * 1024 * 1024){
      alertWarning.classList.remove('hidden');
      showToast('El archivo excede los 10 MB.', false); // Mostrar toast de advertencia
      return;
    } else {
      alertWarning.classList.add('hidden');
    }

    try {
      const res = await fetch('https://gestor-doc-backend-production.up.railway.app/api/documentos/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if(data.ok){
        showToast('Documento subido correctamente', true); // Añadido 'true' para éxito
        form.reset();
      } else {
        showToast('Error: ' + data.error, false); // Añadido 'false' para error
      }
    } catch(e){
      showToast('Error en la subida', false);
      console.error(e);
    }
  });
}