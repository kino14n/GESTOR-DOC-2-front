// js/consulta.js

import { listarDocumentos, eliminarDocumento } from './api.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';

let currentDocs = [];

/** Carga y renderiza todos los documentos. */
export async function cargarConsulta() {
  try {
    currentDocs = await listarDocumentos();
    renderDocs(currentDocs);
  } catch (e) {
    console.error('Error al cargar documentos:', e);
    showToast('Error al cargar lista', 'error');
  }
}

/** Renderiza en #results-list usando name, date y codigos_extraidos */
function renderDocs(docs) {
  const container = document.getElementById('results-list');
  if (!container) return;
  container.innerHTML = docs
    .map(d => {
      const fecha = new Date(d.date).toLocaleDateString('es-ES');
      return `
      <div class="border rounded p-4 mb-2 bg-white shadow-sm">
        <h3 class="font-semibold">${d.name}</h3>
        <p><b>Fecha:</b> ${fecha}</p>
        <p><b>Códigos:</b> ${d.codigos_extraidos || '—'}</p>
        <div class="mt-2 flex gap-2">
          <button onclick="downloadCsv(${d.id})">CSV</button>
          <button onclick="downloadPdfs(${d.id})">PDF</button>
          <button onclick="editarDoc('${d.id}')">Editar</button>
          <button onclick="eliminarDoc('${d.id}')">Eliminar</button>
        </div>
      </div>`;
    })
    .join('');
}

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
      (d.codigos_extraidos || '').toLowerCase().includes(term)
    )
  );
};

// Descargas, edición y eliminación (expuestas globalmente)
window.downloadCsv = id => window.open(`/api/documentos?format=csv&id=${id}`, '_blank');
window.downloadPdfs = id => window.open(`/api/documentos?format=pdf&id=${id}`, '_blank');

window.editarDoc = id => {
  // Lanza evento que upload.js escucha para cargar edición
  document.dispatchEvent(new CustomEvent('load-edit', { detail: { id } }));
};

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
