// GESTOR-DOC/frontend/js/consulta.js

import { requireAuth } from './auth.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';
import { loadDocumentForEdit } from './upload.js'; 

export async function editarDoc(id) { 
  await requireAuth(async () => {
    try {
      // Nota: Esta URL para obtener un solo documento podría necesitar un cambio si tu PHP no tiene acción 'get_single' o similar
      const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api.php?action=get_documento&id=${id}`, { method: 'GET' });
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
  console.log('eliminarDoc: Iniciando para ID:', id); 
  requireAuth(() => {
    console.log('eliminarDoc: requireAuth callback ejecutado.'); 
    showModalConfirm('¿Seguro que desea eliminar?', async () => {
      console.log('eliminarDoc: Confirmación de modal aceptada. Procediendo a eliminar...'); 
      try {
        // *** CAMBIO CRÍTICO AQUÍ: Nueva URL para el backend PHP ***
        const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api.php?action=delete&id=${id}`, { method: 'GET' }); // El PHP usa GET para delete
        console.log('eliminarDoc: Fetch para DELETE completado, respuesta:', res); 
        
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await res.json();
            console.log('eliminarDoc: Respuesta JSON del backend:', data); 
            if(data.message && data.message === 'Documento eliminado'){ // PHP devuelve 'message', no 'ok'
              console.log('eliminarDoc: Documento eliminado con éxito (backend respondió mensaje).'); 
              cargarConsulta(); 
              showToast('Documento eliminado correctamente', true); 
            } else {
              console.error('eliminarDoc: El backend respondió con error o mensaje inesperado:', data.error || data.message || 'Mensaje de error desconocido'); 
              showToast('Error eliminando documento: ' + (data.error || data.message || res.statusText || 'Error desconocido del servidor'), false);
            }
        } else {
            const textResponse = await res.text();
            console.error('eliminarDoc: Respuesta no es JSON. Status:', res.status, 'Respuesta:', textResponse); 
            showToast('Error: El servidor no devolvió una respuesta JSON válida.', false);
        }
      } catch(e){
        console.error('eliminarDoc: Error crítico en el bloque try-catch (problema de red o JS):', e); 
        showToast('Error grave en la eliminación', false);
      }
    });
  });
}

export async function cargarConsulta() {
  const container = document.getElementById('results-list');
  const oldListenerId = container.dataset.listenerId;
  if (oldListenerId && window[oldListenerId]) {
      container.removeEventListener('click', window[oldListenerId]);
      delete window[oldListenerId]; 
  }

  try {
    // *** CAMBIO CRÍTICO AQUÍ: Nueva URL para el backend PHP - Acción LIST ***
    const res = await fetch('https://gestor-doc-backend-production.up.railway.app/api.php?action=list&per_page=0', { method: 'GET' }); // Usar per_page=0 para listar todos
    const data = await res.json();
    console.log('cargarConsulta: Datos recibidos del PHP backend:', data); // Log para ver la estructura

    if(!data.data || data.data.length === 0){ // PHP devuelve 'data' dentro del objeto principal
      container.innerHTML = '<p>No hay documentos.</p>';
      return;
    }

    container.innerHTML = data.data.map(doc => ` <div class="border rounded p-4 mb-2">
        <h3 class="font-semibold">${doc.name}</h3>
        <p><b>Fecha:</b> ${doc.date || ''}</p>
        <p>PDF: ${doc.path ? `<a href="uploads/${doc.path}" target="_blank" class="text-blue-600 underline">${doc.path}</a>` : 'N/A'}</p>
        <div class="mt-2">
            <button class="btn btn--secondary btn--sm" data-action="toggleCodes">Mostrar Códigos</button>
            <p class="codes-container hidden mt-1 text-sm text-gray-700">${(Array.isArray(doc.codes) ? doc.codes.join('<br>') : doc.codes || '')}</p>
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
                    console.warn('La función window.toggleCodes no está definida. Asegúrate de que main.js la exponga globalmente.');
                }
            }
        }
    };
    container.addEventListener('click', window[newListenerId]);
    container.dataset.listenerId = newListenerId; 

  } catch(e){
    container.innerHTML = '<p>Error cargando documentos.</p>';
    console.error('Error al cargar consulta:', e); // Log más descriptivo
  }
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
  // Ajustar si la descarga CSV también se maneja por action en api.php
  window.open('https://gestor-doc-backend-production.up.railway.app/api.php?action=export_csv', '_blank'); // Suponiendo una acción 'export_csv'
}

export function downloadPdfs() {
  // Ajustar si la descarga de PDFs también se maneja por action en api.php
  alert('Función para descargar PDFs pendiente en PHP backend. Usaría api.php?action=download_pdfs');
}