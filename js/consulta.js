// GESTOR-DOC/frontend/js/consulta.js

import { requireAuth } from './auth.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';

// Estas funciones se exportan para ser usadas dentro de este módulo o por otros módulos que las importen.
// No necesitan ser globales (window.xxx) porque se llamarán a través de event listeners.

export function editarDoc(id) {
  requireAuth(() => {
    alert('Función editar documento ID: ' + id);
    // Aquí iría la lógica para cargar el formulario de edición con los datos del documento
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
          showToast('Documento eliminado', true); // Mostrar mensaje de éxito
        } else {
          showToast('Error eliminando documento: ' + data.error, false);
        }
      } catch(e){
        showToast('Error eliminando documento', false);
        console.error(e);
      }
    });
  });
}

// Función principal para cargar y mostrar los documentos
export async function cargarConsulta() {
  const container = document.getElementById('results-list');
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
    // Esto es mucho más eficiente para elementos generados dinámicamente
    container.addEventListener('click', (event) => {
        const target = event.target; // El elemento en el que se hizo clic

        // Asegúrate de que el clic fue en un botón y que tiene un atributo data-action
        if (target.tagName === 'BUTTON' && target.dataset.action) {
            const action = target.dataset.action; // Obtiene la acción del atributo data-action
            const docId = target.dataset.id;     // Obtiene el ID del documento del atributo data-id

            // Llama a la función correspondiente según la acción
            if (action === 'edit') {
                editarDoc(docId); // Llama a la función editarDoc definida en este mismo módulo
            } else if (action === 'delete') {
                eliminarDoc(docId); // Llama a la función eliminarDoc definida en este mismo módulo
            } else if (action === 'toggleCodes') {
                // toggleCodes es una función global (window.toggleCodes) que se define en main.js
                // La llamamos aquí ya que está expuesta globalmente.
                if (typeof window.toggleCodes === 'function') {
                    window.toggleCodes(target); 
                } else {
                    console.warn('La función window.toggleCodes no está definida. Asegúrate de que main.js la exponga globalmente.');
                }
            }
        }
    });

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