// GESTOR-DOC/frontend/js/consulta.js

import { requireAuth } from './auth.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';
import { loadDocumentForEdit } from './upload.js'; // <-- Esta importación es la que debe funcionar ahora.


// Funciones de acción para los botones de la lista (Editar, Eliminar)
export async function editarDoc(id) { 
  await requireAuth(async () => {
    try {
      const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api/documentos/${id}`, { method: 'GET' });
      if (!res.ok) {
        const errorData = await res.json();
        showToast(`Error al cargar documento: ${errorData.error || res.statusText}`, false);
        return;
      }
      const docData = await res.json(); 

      if (typeof window.showTab === 'function') {
        window.showTab('tab-upload'); 
        loadDocumentForEdit(docData); 
        showToast('Documento listo para editar', true);
      } else {
        console.error('window.showTab no está definida. No se puede cambiar de pestaña.');
        showToast('Error interno al preparar edición.', false);
      }

    } catch (e) {
      showToast('Error de red al cargar documento para editar', false);
      console.error(e);
    }
  });
}

export function eliminarDoc(id) {
  requireAuth(() => {
    showModalConfirm('¿Seguro que desea eliminar?', async () => {
      try {
        const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api/documentos/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if(data.ok){
          cargarConsulta();
          showToast('Documento eliminado');
        } else {
          showToast('Error eliminando documento', false);
        }
      } catch(e){
        showToast('Error eliminando documento', false);
        console.error(e);
      }
    });
  });
}

export function clearConsultFilter() {
  document.getElementById('consultFilterInput').value = '';
  cargarConsulta();
}

export function doConsultFilter() {
  const filter = document.getElementById('consultFilterInput').value.toLowerCase();
  const container = document.getElementById('results-list');
  const items = container.querySelectorAll('div.border');
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(filter) ? '' : 'none';
  });
}

export function downloadCsv() {
  window.open('https://gestor-doc-backend-production.up.railway.app/api/documentos?exportar=csv', '_blank');
}

export function downloadPdfs() {
  alert('Función para descargar PDFs pendiente');
}