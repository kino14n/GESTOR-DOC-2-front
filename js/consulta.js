// GESTOR-DOC/frontend/js/consulta.js

import { requireAuth } from './auth.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';
import { loadDocumentForEdit } from './upload.js'; 

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

// Función principal para cargar y mostrar los documentos en la pestaña 'Consultar'
// ¡Esta función ESTÁ exportada correctamente!
export async function cargarConsulta() { 
  const container = document.getElementById('results-list');
  const oldListenerId = container.dataset.listenerId;
  if (oldListenerId && window[oldListenerId]) {
      container.removeEventListener('click', window[oldListenerId]);
      delete window[oldListenerId]; 
  }

  try {
    const res = await fetch('https://gestor-doc-backend-production.up.railway.app/api/documentos', { method: 'GET' }); 
    const data = await res.json(); 
    console.log('cargarConsulta: Datos recibidos del Flask backend:', data); 

    if(!data || data.length === 0){ 
      container.innerHTML = '<p>No hay documentos.</p>';
      return;
    }

    container.innerHTML = data.map(doc => ` 
      <div class="border rounded p-4 mb-2">
        <h3 class="font-semibold">${doc.name}</h3>
        <p><b>Fecha:</b> ${doc.date || ''}</p>
        <p>PDF: ${doc.path ? `<a href="uploads/${doc.path}" target="_blank" class="text-blue-600 underline">${doc.path}</a>` : 'N/A'}</p>
        <div class="mt-2">
            <button class="btn btn--secondary btn--sm" data-action="toggleCodes">Mostrar Códigos</button>
            <p class="codes-container hidden mt-1 text-sm text-gray-700">${(doc.codigos_extraidos || '').split(',').join('<br>')}</p>
        </div>
        <div class="mt-4">
            <button class="btn btn--primary mr-2" data-action="edit" data-id="${doc.id}">Editar</button>
            <button class="btn btn--secondary" data-action="delete" data-id="${doc.id}">Eliminar</button>
        </div>
      </div>
    `).join('');

    const newListenerId = `consultContainerListener-${Date.now()}`;
    window[newListenerId] = (event) => {
        const target = event.target; 

        if (target.tagName === 'BUTTON' && target.dataset.action) {
            const action = target.dataset.action; 
            const docId = target.dataset.id;     

            if (action === 'edit') {
                editarDoc(docId); 
            } else if (action === 'delete') {
                eliminarDoc(docId); 
            } else if (action === 'toggleCodes') {
                if (typeof window.toggleCodes === 'function') {
                    window.toggleCodes(target); 
                } else {
                    console.warn('La función window.toggleCodes no está definida.');
                }
            }
        }
    };
    container.addEventListener('click', window[newListenerId]);
    container.dataset.listenerId = newListenerId; 

  } catch(e){
    container.innerHTML = '<p>Error cargando documentos.</p>';
    console.error('Error al cargar consulta:', e); 
  }
}

// Funciones para filtrar y descargar
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