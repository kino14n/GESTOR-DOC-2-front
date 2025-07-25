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
    // *** Flask devuelve 'codigos_extraidos' como string, no 'codes' como array ***
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
  const docIdInput = document.getElementById('docId'); 
  const fileInput = document.getElementById('file');
  const uploadWarning = document.getElementById('uploadWarning');

  if(!form) return;

  function resetUploadForm() {
    form.reset();
    docIdInput.value = ''; 
    uploadWarning.classList.add('hidden'); 
    if (fileInput) fileInput.value = ''; 
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form); 

    const documentId = docIdInput.value; 
    // *** VUELTA A FLASK: URLs y métodos adecuados ***
    let url = 'https://gestor-doc-backend-production.up.railway.app/api/documentos/upload'; // Para subir
    let method = 'POST';

    if (documentId) {
      url = `https://gestor-doc-backend-production.up.railway.app/api/documentos/${documentId}`; // Para editar
      method = 'PUT'; // Flask espera PUT para edición
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
        body: formData // FormData se usa para POST/PUT con archivos, Flask lo parsea
      });
      const data = await res.json(); 

      // *** VUELTA A FLASK: Flask devuelve {ok: true} ***
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

  if (!docIdInput.value) {
    resetUploadForm(); 
  }
}