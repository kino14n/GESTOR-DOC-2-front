// GESTOR-DOC/frontend/js/consulta.js

import { requireAuth } from './auth.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';
import { loadDocumentForEdit } from './upload.js';

export async function cargarConsulta() {
  try {
    const res = await fetch('https://gestor-doc-backend-production.up.railway.app/api/documentos');
    const data = await res.json();

    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';

    data.forEach(doc => {
      const item = document.createElement('div');
      item.className = 'border rounded p-4 mb-2 bg-white shadow-sm';

      const fecha = new Date(doc.date);
      const fechaLocal = fecha.toLocaleDateString('es-ES', {
        weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
      });

      item.innerHTML = `
        <h3 class="font-semibold">${doc.name}</h3>
        <p><b>Fecha:</b> ${fechaLocal}</p>
        <p><b>PDF:</b> ${doc.path ? `<a href="uploads/${doc.path}" target="_blank" class="text-blue-600 underline">${doc.path}</a>` : ''}</p>
        <div class="mt-2">
          <button class="btn btn--secondary btn--sm" onclick="toggleCodes(this)">Mostrar Códigos</button>
          <p class="codes-container hidden mt-1 text-sm text-gray-700">${(doc.codigos_extraidos || '').split(',').join('<br>')}</p>
        </div>
        <div class="mt-2">
          <button class="btn btn--secondary btn--sm" onclick="editarDoc('${doc.id}')">Editar</button>
          <button class="btn btn--danger btn--sm" onclick="eliminarDoc('${doc.id}')">Eliminar</button>
        </div>
      `;
      resultsList.appendChild(item);
    });

  } catch (e) {
    console.error('Error al cargar documentos:', e);
    showToast('Error al cargar la lista de documentos', false);
  }
}

window.toggleCodes = function(button) {
  const container = button.nextElementSibling;
  if (container) {
    const isVisible = !container.classList.contains('hidden');
    container.classList.toggle('hidden');
    button.textContent = isVisible ? 'Mostrar Códigos' : 'Ocultar Códigos';
  }
};

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
        if (data.ok) {
          cargarConsulta();
          showToast('Documento eliminado');
        } else {
          showToast('Error eliminando documento', false);
        }
      } catch (e) {
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

// Exponer funciones globalmente para botones generados dinámicamente
window.editarDoc = editarDoc;
window.eliminarDoc = eliminarDoc;
