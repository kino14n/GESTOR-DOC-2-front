import { listarDocumentos, eliminarDocumento } from './api.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';

// Contiene la lista actual de documentos para filtros o recargas
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
 * Renderiza documentos con un enlace al PDF y una lista oculta de códigos.
 * Cada fila incluye un botón con la clase `.btn-ver-codigos` y un atributo
 * `data-codes-id` para permitir el toggle mediante delegación de eventos.
 */
function renderDocs(docs) {
  const container = document.getElementById('results-list');
  if (!container) return;
  container.innerHTML = docs
    .map(d => {
      const fecha = d.date ? new Date(d.date).toLocaleDateString('es-ES') : '';
      const codesArray = (d.codigos_extraidos || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const codesId = d.id || Math.random().toString(36).slice(2);
      const codesListHtml = codesArray.length
        ? `<div id="codes-list-${codesId}" class="codes-list hidden">${codesArray
            .map(c => `<span class="code-item">${c}</span>`)
            .join(' ')}</div>`
        : `<div id="codes-list-${codesId}" class="codes-list hidden"><span>Sin códigos.</span></div>`;
      const pdfLink = d.path
        ? `<a href="${d.path}" target="_blank">Ver PDF</a>`
        : 'Sin PDF';
      return `
        <div class="doc-item">
          <p><strong>${d.name}</strong></p>
          <p>${fecha}</p>
          <p>${pdfLink}</p>
          <button class="btn-ver-codigos" data-codes-id="${codesId}">Ver Códigos</button>
          ${codesListHtml}
          <div class="actions">
            <button class="btn btn-secondary" onclick="dispatchEdit(${d.id})">Editar</button>
            <button class="btn btn-danger" onclick="eliminarDoc(${d.id})">Eliminar</button>
          </div>
        </div>
      `;
    })
    .join('');
}

// Editar documento y cambiar a pestaña “Subir”
window.dispatchEdit = async id => {
  const res = await fetch(
    `https://gestor-doc-backend-production.up.railway.app/api/documentos/${id}`
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