// GESTOR-DOC/frontend/js/upload.js

import { showToast } from './toasts.js'; 

export function initUploadForm() {
  const form = document.getElementById('form-upload');
  const docIdInput = document.getElementById('docId'); // Campo oculto para el ID del documento
  const nameInput = document.getElementById('name');
  const dateInput = document.getElementById('date');
  const codesTextarea = document.getElementById('codes');
  const fileInput = document.getElementById('file');
  const uploadWarning = document.getElementById('uploadWarning');

  if(!form) return;

  // Función para resetear el formulario, incluyendo el ID oculto
  function resetUploadForm() {
    form.reset();
    docIdInput.value = ''; // Limpiar el ID del documento para asegurar que es una nueva subida
    uploadWarning.classList.add('hidden'); // Ocultar cualquier advertencia de subida
    // Opcional: limpiar el input de tipo file si no se reinicia con form.reset()
    if (fileInput) fileInput.value = '';
  }

  // Listener para el envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    // Si hay un docId, significa que estamos editando
    const documentId = docIdInput.value; 
    let url = 'https://gestor-doc-backend-production.up.railway.app/api/documentos/upload';
    let method = 'POST';

    if (documentId) {
      url = `https://gestor-doc-backend-production.up.railway.app/api/documentos/${documentId}`;
      method = 'PUT'; // Cambiar a método PUT para edición
      // Eliminar el archivo del formData si no se ha seleccionado uno nuevo
      // Esto es crucial para que el backend no espere un archivo PUT si no se cambia
      if (fileInput.files.length === 0) {
        formData.delete('file'); 
      }
    }

    // Validar tamaño archivo solo si se sube un nuevo archivo o se cambia el existente
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
        body: formData // FormData se usa directamente para POST y PUT con archivos
      });
      const data = await res.json();

      if(data.ok){
        showToast(`Documento ${documentId ? 'actualizado' : 'subido'} correctamente`, true); 
        resetUploadForm(); // Reiniciar el formulario después del éxito
      } else {
        showToast('Error: ' + (data.error || res.statusText), false); 
      }
    } catch(e){
      showToast('Error en la operación', false);
      console.error(e);
    }
  });

  // Exportar esta función para que consulta.js pueda llamarla
  window.loadDocumentForEdit = function(docData) {
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
    // El input de tipo file no puede ser prellenado por seguridad, así que se asume que
    // el usuario subirá un nuevo PDF si desea cambiarlo.
    const currentPdfInfo = document.getElementById('currentPdfInfo'); // Podrías añadir un <div> con este ID en tu HTML
    if (currentPdfInfo) {
      if (docData.path) {
        currentPdfInfo.innerHTML = `PDF actual: <a href="uploads/${docData.path}" target="_blank">${docData.path}</a> (sube uno nuevo para reemplazar)`;
      } else {
        currentPdfInfo.innerHTML = 'No hay PDF asociado.';
      }
    }
    
    // Asegurarse de que el input de archivo esté vacío al editar para no re-subir el mismo archivo
    fileInput.value = '';
  };
}