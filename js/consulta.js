// GESTOR-DOC/frontend/js/consulta.js

import { requireAuth } from './auth.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';
import { loadDocumentForEdit } from './upload.js'; // Importar la nueva función de upload.js

// Estas funciones se exportan para ser usadas dentro de este módulo o por otros módulos que las importen.
// No necesitan ser globales (window.xxx) porque se llamarán a través de event listeners.

export async function editarDoc(id) { // Función ahora asíncrona
  await requireAuth(async () => { // Esperamos a que la autenticación termine
    try {
      const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api/documentos/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        showToast(`Error al cargar documento: ${errorData.error || res.statusText}`, false);
        return;
      }
      const docData = await res.json();

      // Asegúrate de que showTab sea global o esté importada de main.js
      if (typeof window.showTab === 'function') {
        window.showTab('tab-upload'); // Cambiar a la pestaña de subir/editar
        loadDocumentForEdit(docData); // Cargar los datos en el formulario de edición
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
        const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api/documentos?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if(data.ok){
          cargarConsulta(); // Recargar la lista de documentos después de eliminar
          showToast('Documento eliminado correctamente', true); 
        } else {
          showToast('Error eliminando documento: ' + (data.error || res.statusText), false);
        }
      } catch(e){
        showToast('Error en la eliminación', false);
        console.error(e);
      }
    });
  });
}

// Función principal para cargar y mostrar los documentos
export async function cargarConsulta() {
  const container = document.getElementById('results-list');
  // Eliminar el event listener antiguo antes de añadir uno nuevo para evitar duplicados
  const oldListener = container.dataset.listener;
  if (oldListener) {
      container.removeEventListener('click', window[oldListener]);
  }

  try {
    const res = await fetch('https://gestor-doc-backend-production.up.railway.app/api/documentos');
    const data = await res.json();

    if(data.length === 0){
      container.innerHTML = '<p>No hay documentos.</p>';
      return;
    }

    // Generar el HTML para cada documento
    // Importante: Los botones ya NO tienen 'onclick="..."'
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

    // *** DELEGACIÓN DE EVENTOS ***
    // Adjunta un único event listener al contenedor principal (#results-list)
    // Se asegura de que el listener sea único y no se duplique con cada llamada a cargarConsulta
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
    container.dataset.listener = newListenerId; // Guarda el ID del listener para removerlo después

  } catch(e){
    container.innerHTML = '<p>Error cargando documentos.</p>';
    console.error(e);
  }
}

// Las siguientes funciones se exportan para ser usadas por `main.js` u otros scripts.
// Sus `onclick` en index.html se gestionan directamente o a través de `main.js`.
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