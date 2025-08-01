import { listarDocumentos, eliminarDocumento } from './api.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';
import { bindCodeButtons } from './main.js';
import { config } from './config.js';

// Contiene la lista actual de documentos para filtros o recargas
let currentDocs = [];

/**
 * Carga y muestra los documentos en #results-list.
 */
export async function cargarConsulta() {
  try {
    currentDocs = await listarDocumentos();
    renderDocs(currentDocs);
    // Vincular los eventos de los botones "Ver Códigos" después de renderizar
    const listEl = document.getElementById('results-list');
    if (listEl) bindCodeButtons(listEl);
  } catch (e) {
    console.error('Error al cargar documentos:', e);
    showToast('Error al cargar lista', 'error');
  }
}

/**
 * Renderiza documentos con la información a la izquierda y las acciones a la derecha.
 */
function renderDocs(docs) {
  const container = document.getElementById('results-list');
  if (!container) return;
  container.innerHTML = docs
    .map(d => {
      // Formatea la fecha o muestra un texto por defecto
      const fecha = d.date ? new Date(d.date).toISOString().split('T')[0] : 'Sin fecha';
      const codesArray = (d.codigos_extraidos || '').split(',').map(s => s.trim()).filter(Boolean);
      const codesId = `codes-list-${d.id || Math.random().toString(36).slice(2)}`;

      // Genera la lista de códigos (oculta inicialmente)
      const codesListHtml = `<div id="${codesId}" class="codes-list hidden">${
        codesArray.length > 0
          ? codesArray.map(c => `<div class="code-item">${c}</div>`).join('')
          : '<span>Sin códigos.</span>'
      }</div>`;

      // Genera el enlace para ver el PDF
      const pdfLink = d.path ? `<a href="uploads/${d.path}" target="_blank" class="text-blue-600 hover:underline">Ver PDF</a>` : 'Sin PDF';

      return `
        <div class="doc-item">
          <div class="doc-item-info">
            <p class="font-bold text-lg">${d.name}</p>
            <p class="text-sm text-gray-600 mt-1">${fecha}</p>
            <p class="text-xs text-gray-500 mt-1">Archivo PDF: ${d.path || 'No disponible'}</p>
            <p class="text-sm mt-2">${pdfLink}</p>
          </div>
          <div class="doc-item-actions">
            <button class="btn btn--secondary btn--full-width" onclick="dispatchEdit(${d.id})">Editar</button>
            <button class="btn btn--warning btn--full-width" onclick="eliminarDoc(${d.id})">Eliminar</button>
            <button class="btn btn--secondary btn--full-width btn-ver-codigos" data-codes-id="${codesId}">Ver Códigos</button>
          </div>
          ${codesListHtml}
        </div>
      `;
    })
    .join('');
}


// Editar documento y cambiar a pestaña “Subir”
window.dispatchEdit = async id => {
  const res = await fetch(
    `${config.API_BASE}/${id}`
  );
  const docData = await res.json();
  if (docData && !docData.error) {
    if (window.loadDocumentForEdit) {
      window.loadDocumentForEdit(docData);
    } else if (typeof loadDocumentForEdit === 'function') {
      loadDocumentForEdit(docData);
    } else {
      document.dispatchEvent(new CustomEvent('load-edit', { detail: docData }));
    }
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
  // Volver a vincular los eventos de los botones después de filtrar
  const listEl = document.getElementById('results-list');
  if (listEl) bindCodeButtons(listEl);
};

window.doConsultFilter = () => {
  const term = document.getElementById('consultFilterInput').value.toLowerCase().trim();
  renderDocs(
    currentDocs.filter(d =>
      d.name.toLowerCase().includes(term) ||
      (d.codigos_extraidos || '').toLowerCase().includes(term) ||
      (d.path || '').toLowerCase().includes(term)
    )
  );
  // Vincular eventos a los botones en el resultado filtrado
  const listEl = document.getElementById('results-list');
  if (listEl) bindCodeButtons(listEl);
};

window.downloadCsv = () => window.open(`/api/documentos?format=csv`, '_blank');
window.downloadPdfs = id => window.open(`/api/documentos?format=pdf&id=${id}`, '_blank');

// Confirma eliminación y recarga la lista
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