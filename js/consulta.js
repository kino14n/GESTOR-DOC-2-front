// GESTOR-DOC/frontend/js/consulta.js

import { requireAuth } from './auth.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';
import { loadDocumentForEdit } from './upload.js';

// Carga y muestra la lista de documentos en la pestaña "Consultar"
export async function cargarConsulta() {
  try {
    const res = await fetch('https://gestor-doc-backend-production.up.railway.app/api/documentos');
    const data = await res.json();

    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';

    data.forEach(doc => {
      const fecha = new Date(doc.date);
      const fechaLocal = fecha.toLocaleDateString('es-ES', {
        weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
      });

      const item = document.createElement('div');
      item.className = 'border rounded p-4 mb-2 bg-white shadow-sm';
      item.innerHTML = `
        <h3 class="font-semibold">${doc.name}</h3>
        <p><b>Fecha:</b> ${fechaLocal}</p>
        <p><b>PDF:</b> ${doc.path ? `<a href="uploads/${doc.path}" target="_blank" class="text-blue-600 underline">${doc.path}</a>` : ''}</p>
        <div class="mt-2">
          <button class="btn btn--secondary btn--sm" onclick="toggleCodes(this)">Mostrar Códigos</button>
          <p class="codes-container hidden mt-1 text-sm text-gray-700">${(doc.codigos_extraidos||'').split(',').join('<br>')}</p>
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

// Mostrar u ocultar códigos en cada tarjeta
window.toggleCodes = function(button) {
  const container = button.nextElementSibling;
  if (!container) return;
  const isVisible = !container.classList.contains('hidden');
  container.classList.toggle('hidden');
  button.textContent = isVisible ? 'Mostrar Códigos' : 'Ocultar Códigos';
};

// Editar documento: abrir formulario de subir en modo edición
export async function editarDoc(id) {
  await requireAuth(async () => {
    try {
      const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api/documentos/${id}`);
      if (!res.ok) throw new Error('Error al obtener documento');
      const docData = await res.json();
      window.showTab('tab-upload');
      loadDocumentForEdit(docData);
      showToast('Documento listo para editar', true);
    } catch (e) {
      console.error(e);
      showToast('Error al preparar edición', false);
    }
  });
}

// Eliminar documento con confirmación
export function eliminarDoc(id) {
  requireAuth(() => {
    showModalConfirm('¿Seguro que desea eliminar?', async () => {
      try {
        const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api/documentos/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.ok) {
          cargarConsulta();
          showToast('Documento eliminado', true);
        } else {
          showToast('Error eliminando documento', false);
        }
      } catch (e) {
        console.error(e);
        showToast('Error en la eliminación', false);
      }
    });
  });
}

// Limpiar filtro y recargar lista
export function clearConsultFilter() {
  document.getElementById('consultFilterInput').value = '';
  cargarConsulta();
}

// Filtrar por primera columna de texto multilínea
export function doConsultFilter() {
  const raw = document.getElementById('consultFilterInput').value;
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  const codes = lines.map(l => l.split(/\s+/)[0]);
  
  const container = document.getElementById('results-list');
  const items = Array.from(container.querySelectorAll('div.border'));

  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    const match = codes.some(code => text.includes(code.toLowerCase()));
    item.style.display = match ? '' : 'none';
  });
}

// Exportar CSV
export function downloadCsv() {
  window.open('https://gestor-doc-backend-production.up.railway.app/api/documentos?exportar=csv', '_blank');
}

// Placeholder descarga de PDFs
export function downloadPdfs() {
  alert('Función de descarga de PDFs pendiente');
}

// Exponer funciones globales para botones dinámicos
window.editarDoc = editarDoc;
window.eliminarDoc = eliminarDoc;
window.doConsultFilter = doConsultFilter;
window.clearConsultFilter = clearConsultFilter;
