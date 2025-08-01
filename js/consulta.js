import { listarDocumentos, eliminarDocumento } from './api.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';
import { bindCodeButtons } from './main.js';
import { config } from './config.js'; // Importar la configuración

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
 * Renderiza documentos mostrando el enlace al PDF como un botón y la lista
 * de códigos asociada en una columna. Ya no se utiliza un botón "Ver Códigos",
 * por lo que los códigos se muestran directamente. Cada fila incluye botones
 * para editar o eliminar según corresponda.
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
      // Generar un id para los códigos (se usa para asociar el botón y la lista)
      const codesId = d.id || Math.random().toString(36).slice(2);
      // Construir la lista de códigos como columna (una línea por código)
      const codesListHtml = codesArray.length
        ? `<div id="codes-list-${codesId}" class="codes-list hidden">${codesArray
            .map(c => `<div class="code-item">${c}</div>`)
            .join('')}</div>`
        : `<div id="codes-list-${codesId}" class="codes-list hidden"><span>Sin códigos.</span></div>`;
      // Resaltar Ver PDF como botón
      const pdfButton = d.path
        ? `<a class="btn btn--primary" href="uploads/${d.path}" target="_blank">Ver PDF</a>`
        : 'Sin PDF';
      return `
        <div class="doc-item">
          <p><strong>${d.name}</strong></p>
          <p>${fecha}</p>
          <p>${pdfButton}</p>
          <button class="btn-ver-codigos" data-codes-id="${codesId}">Ver Códigos</button>
          ${codesListHtml}
          <div class="actions">
            <button class="btn btn--secondary" onclick="dispatchEdit(${d.id})">Editar</button>
            <button class="btn btn--warning" onclick="eliminarDoc(${d.id})">Eliminar</button>
          </div>
        </div>
      `;
    })
    .join('');

}

// Editar documento y cambiar a pestaña “Subir”
window.dispatchEdit = async id => {
  const res = await fetch(
    `${config.API_BASE}/${id}` // Usar config
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