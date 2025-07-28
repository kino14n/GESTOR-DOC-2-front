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
 * Renderiza documentos con PDF como enlace y lista oculta de códigos.
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

    // PDF como enlace, muestra el nombre
    const pdfLink = d.path
      ? `<a href="uploads/${d.path}" target="_blank" class="btn btn-small btn-pdf">${d.path}</a>`
      : '<span class="italic text-gray-400">Sin PDF</span>';

    return `
      <div class="border rounded p-4 mb-4 bg-white shadow-sm" id="doc-${d.id}">
        <h3 class="text-lg font-semibold text-green-600">${d.name}</h3>
        <p class="text-sm text-gray-600">${fecha}</p>
        <div class="flex gap-2 mt-1 mb-1 items-center">
          ${pdfLink}
        </div>
        ${codesList}
        <div class="mt-3 flex gap-2">
          <button onclick="dispatchEdit(${d.id})" class="btn btn-small btn-primary">Editar</button>
          <button onclick="eliminarDoc(${d.id})" class="btn btn-small btn-danger">Eliminar</button>
          <button onclick="toggleCodes(${d.id})" class="btn btn-small btn-secondary">Ver Códigos</button>
        </div>
      </div>
    `;
  }).join('');
}

// Toggle lista de códigos
window.toggleCodes = id => {
  const list = document.getElementById(`codes-${id}`);
  if (list) list.classList.toggle('hidden');
};

// Editar documento y cambiar a pestaña “Subir”
window.dispatchEdit = async id => {
  // 1. Obtener los datos del documento
  const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api/documentos/${id}`);
  const docData = await res.json();
  if (docData && !docData.error) {
    // 2. Llamar función de upload.js
    if (window.loadDocumentForEdit) {
      window.loadDocumentForEdit(docData);
    } else if (typeof loadDocumentForEdit === 'function') {
      loadDocumentForEdit(docData);
    } else {
      document.dispatchEvent(new CustomEvent('load-edit', { detail: docData }));
    }
    // 3. Cambiar pestaña
    window.showTab('tab-upload');
  } else {
    showToast('Error al cargar el documento', false);
  }
};

// Filtros cliente-side
window.clearConsultFilter = () => {
  const input = document.getElementById('consultFilterInput');
  if (input) input.value = '';
  renderDocs(currentDocs);
};

window.doConsultFilter = () => {
  const term = document.getElementById('consultFilterInput').value.toLowerCase().trim();
  renderDocs(
    currentDocs.filter(d =>
      d.name.toLowerCase().includes(term) ||
      (d.codigos_extraidos || '').toLowerCase().includes(term) ||
      (d.path || '').toLowerCase().includes(term) // también por nombre del PDF
    )
  );
};

// Descarga global de CSV (botón arriba de la lista o donde desees)
window.downloadCsv = () => window.open(`/api/documentos?format=csv`, '_blank');
window.downloadPdfs = id => window.open(`/api/documentos?format=pdf&id=${id}`, '_blank');

// Eliminar documento
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

