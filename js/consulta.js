// js/consulta.js

import { listarDocumentos, eliminarDocumento } from './api.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';

let currentDocs = [];

/**
 * Carga y muestra los documentos en #results-list.
 */
export async function cargarConsulta() {
  try {
    currentDocs = await listarDocumentos();
    renderDocs(currentDocs);
  } catch (e) {
    console.error('Error al cargar documentos:', e);
    showToast('Error al cargar lista', 'error');
  }
}

/**
 * Renderiza documentos con botones estilizados y lista oculta de códigos.
 */
function renderDocs(docs) {
  const container = document.getElementById('results-list');
  if (!container) return;

  container.innerHTML = docs.map(d => {
    const fecha = new Date(d.date).toLocaleDateString('es-ES');
    const codesArray = (d.codigos_extraidos || '').split(',').map(s => s.trim()).filter(Boolean);
    const codesList = codesArray.length
      ? `<ul class="codes-list hidden mt-2 ml-4 list-disc list-inside" id="codes-${d.id}">${codesArray
          .map(c => `<li>${c}</li>`).join('')}</ul>`
      : '<p class="mt-2 italic">Sin códigos.</p>';

    return `
      <div class="border rounded p-4 mb-4 bg-white shadow-sm" id="doc-${d.id}">
        <h3 class="text-lg font-semibold text-green-600">${d.name}</h3>
        <p class="text-sm text-gray-600">${fecha}</p>
        ${codesList}
        <div class="mt-3 flex gap-2">
          <button onclick="downloadCsv(${d.id})" class="btn btn-small btn-outline">CSV</button>
          <button onclick="downloadPdfs(${d.id})" class="btn btn-small btn-outline">PDF</button>
          <button onclick="dispatchEdit(${d.id})" class="btn btn-small btn-primary">Editar</button>
          <button onclick="eliminarDoc(${d.id})" class="btn btn-small btn-danger">Eliminar</button>
          <button onclick="toggleCodes(${d.id})" class="btn btn-small btn-secondary">Ver Códigos</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Muestra/oculta la lista de códigos para un documento.
 */
window.toggleCodes = id => {
  const list = document.getElementById(`codes-${id}`);
  if (list) list.classList.toggle('hidden');
};

/**
 * Dispara evento para cargar el documento en el formulario de subida y cambia la pestaña.
 */
window.dispatchEdit = id => {
  // Evento custom que escucha upload.js para cargar el formulario con ese ID
  document.dispatchEvent(new CustomEvent('load-edit', { detail: { id } }));
  // Cambiar pestaña a subir
  window.showTab('tab-upload');
};

/**
 * Limpiar filtro y recargar lista original.
 */
window.clearConsultFilter = () => {
  const input = document.getElementById('consultFilterInput');
  if (input) input.value = '';
  renderDocs(currentDocs);
};

/**
 * Filtrar documentos por nombre o códigos.
 */
window.doConsultFilter = () => {
  const term = document.getElementById('consultFilterInput').value.toLowerCase().trim();
  renderDocs(
    currentDocs.filter(d =>
      d.name.toLowerCase().includes(term) ||
      (d.codigos_extraidos || '').toLowerCase().includes(term)
    )
  );
};

/**
 * Descarga CSV.
 */
window.downloadCsv = id => window.open(`/api/documentos?format=csv&id=${id}`, '_blank');

/**
 * Descarga PDF.
 */
window.downloadPdfs = id => window.open(`/api/documentos?format=pdf&id=${id}`, '_blank');

/**
 * Eliminar documento con confirmación.
 */
window.eliminarDoc = id => {
  showModalConfirm('¿Eliminar documento?', async () => {
    try {
      await eliminarDocumento(id);
      showToast('Documento eliminado', 'success');
      cargarConsulta();
    } catch {
      showToast('No se pudo eliminar', 'error');
    }
  });
};
