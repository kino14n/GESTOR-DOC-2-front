// GESTOR-DOC/frontend/js/upload.js

import { showToast } from './toasts.js'; 

// Esta función se EXPORTA ahora
export function loadDocumentForEdit(docData) {
    const form = document.getElementById('form-upload');
    const docIdInput = document.getElementById('docId');
    const nameInput = document.getElementById('name');
    const dateInput = document.getElementById('date');
    const codesTextarea = document.getElementById('codes');
    const fileInput = document.getElementById('file');
    const uploadWarning = document.getElementById('uploadWarning');
    const currentPdfInfo = document.getElementById('currentPdfInfo'); // Asumiendo que existe

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
    dateInput.value = docData.date ? new Date(docData.date).toISOString().split('T')[0] : ''; // Formato YYYY-MM-DD
    codesTextarea.value = docData.codigos_extraidos || '';
    
    // Mostrar un mensaje o el nombre del PDF actual si existe
    if (currentPdfInfo) {
      if (docData.path) {
        currentPdfInfo.innerHTML = `PDF actual: <a href="uploads/${docData.path}" target="_blank">${docData.path}</a> (sube uno nuevo para reemplazar)`;
      } else {
        currentPdfInfo.innerHTML = 'No hay PDF asociado.';
      }
    }
    
    // Asegurarse de que el input de archivo esté vacío al editar para no re-subir el mismo archivo
    fileInput.value = '';
}


export function initUploadForm() {
  const form = document.getElementById('form-upload');
  const docIdInput = document.getElementById('docId'); 
  const fileInput = document.getElementById('file');
  const uploadWarning = document.getElementById('uploadWarning');

  if(!form) return;

  // Función para resetear el formulario, incluyendo el ID oculto
  function resetUploadForm() {
    form.reset();
    docIdInput.value = ''; // Limpiar el ID del documento para asegurar que es una nueva subida
    uploadWarning.classList.add('hidden'); // Ocultar cualquier advertencia de subida
    if (fileInput) fileInput.value = ''; // Limpiar el input de tipo file
  }

  // Listener para el envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    const documentId = docIdInput.value; 
    let url = 'https://gestor-doc-backend-production.up.railway.app/api/documentos/upload';
    let method = 'POST';

    if (documentId) {
      url = `https://gestor-doc-backend-production.up.railway.app/api/documentos/${documentId}`;
      method = 'PUT'; 
      // Eliminar el archivo del formData si no se ha seleccionado uno nuevo (solo si es edición)
      if (fileInput.files.length === 0) {
        formData.delete('file'); 
      }
    }

    // Validar tamaño archivo solo si se sube/cambia un archivo
    if (fileInput.files.length > 0 && fileInput.files[0].size > 10 * 1024 * 1024){
      uploadWarning.classList.remove('hidden');
      showToast('El archivo excede los 10 MB.', false); 
      return;
    } else {
      uploadWarning.classList.add('hidden');
    }

    try {
      const res = await fetch(url, {
        method: method,
        body: formData 
      });
      const data = await res.json();

      if(data.ok){
        showToast(`Documento ${documentId ? 'actualizado' : 'subido'} correctamente`, true); 
        resetUploadForm(); 
      } else {
        showToast('Error: ' + (data.error || res.statusText), false); 
      }
    } catch(e){
      showToast('Error en la operación', false);
      console.error(e);
    }
  });

  // Asegurar que el formulario se resetee al cargar la página si no hay ID de documento
  // Esto es para el caso de nuevas subidas. Si es edición, loadDocumentForEdit lo llenará.
  if (!docIdInput.value) {
    resetUploadForm(); 
  }
}