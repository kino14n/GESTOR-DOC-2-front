import { requireAuth } from './auth.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';

export async function cargarConsulta() {
  const container = document.getElementById('results-list');
  try {
    const res = await fetch('https://gestor-doc-backend-production.up.railway.app/api/documentos');
    const data = await res.json();

    if(data.length === 0){
      container.innerHTML = '<p>No hay documentos.</p>';
      return;
    }

    container.innerHTML = data.map(doc => `
      <div class="border rounded p-4 mb-2">
        <h3 class="font-semibold">${doc.name}</h3>
        <p><b>Fecha:</b> ${doc.date || ''}</p>
        <p>PDF: ${doc.path ? `<a href="uploads/${doc.path}" target="_blank" class="text-blue-600 underline">${doc.path}</a>` : 'N/A'}</p>
        <div class="mt-2">
            <button class="btn btn--secondary btn--sm" onclick="toggleCodes(this)">Mostrar Códigos</button>
            <p class="codes-container hidden mt-1 text-sm text-gray-700">${(doc.codigos_extraidos || '').split(',').join('<br>')}</p>
        </div>
        <div class="mt-4">
            <button class="btn btn--primary mr-2" onclick="editarDoc(${doc.id})">Editar</button>
            <button class="btn btn--secondary" onclick="eliminarDoc(${doc.id})">Eliminar</button>
        </div>
      </div>
    `).join('');

  } catch(e){
    container.innerHTML = '<p>Error cargando documentos.</p>';
    console.error(e);
  }
}

export function editarDoc(id) {
  requireAuth(() => {
    alert('Función editar documento ID: ' + id);
  });
}

export function eliminarDoc(id) {
  requireAuth(() => {
    showModalConfirm('¿Seguro que desea eliminar?', async () => {
      try {
        const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api/documentos?id=${id}`, { method: 'DELETE' });
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

// Nueva función para alternar la visibilidad de los códigos
window.toggleCodes = function(button) {
    const codesContainer = button.nextElementSibling; // El div de códigos es el siguiente hermano del botón
    if (codesContainer.classList.contains('hidden')) {
        codesContainer.classList.remove('hidden');
        button.textContent = 'Ocultar Códigos';
    } else {
        codesContainer.classList.add('hidden');
        button.textContent = 'Mostrar Códigos';
    }
}