// js/consulta.js

import { listarDocumentos, eliminarDocumento } from './api.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';

let currentDocs = [];

/** Carga y renderiza la lista completa */
export async function cargarConsulta() {
  try {
    currentDocs = await listarDocumentos();
    renderDocs(currentDocs);
  } catch (e) {
    console.error(e);
    showToast('Error al cargar documentos', 'error');
  }
}

/** Renderiza dentro de #results-list */
function renderDocs(docs) {
  const container = document.getElementById('results-list');
  if (!container) return;
  container.innerHTML = docs.map(d => {
    const fecha = new Date(d.date).toLocaleDateString('es-ES');
    return `
      <div class="border rounded p-4 mb-3 bg-white shadow-sm">
        <h3 class="text-lg font-semibold text-green-600">${d.name}</h3>
        <p><small>${fecha}</small></p>
        <p><em>${d.codigos_extraidos || '—'}</em></p>
        <div class="mt-2 flex gap-2">
          <button onclick="downloadCsv(${d.id})">CSV</button>
          <button onclick="downloadPdfs(${d.id})">PDF</button>
          <button onclick="editarDoc('${d.id}')">Editar</button>
          <button onclick="eliminarDoc('${d.id}')">Eliminar</button>
        </div>
      </div>`;
  }).join('');
}

// filtros
window.clearConsultFilter = () => {
  document.getElementById('consultFilterInput').value = '';
  renderDocs(currentDocs);
};
window.doConsultFilter = () => {
  const t = document.getElementById('consultFilterInput').value.toLowerCase().trim();
  renderDocs(currentDocs.filter(d =>
    d.name.toLowerCase().includes(t) ||
    (d.codigos_extraidos||'').toLowerCase().includes(t)
  ));
};

// descargas y acciones
window.downloadCsv = id => window.open(`/api/documentos?format=csv&id=${id}`, '_blank');
window.downloadPdfs = id => window.open(`/api/documentos?format=pdf&id=${id}`, '_blank');
window.editarDoc = id => document.dispatchEvent(new CustomEvent('load-edit', { detail:{id} }));
window.eliminarDoc = id => {
  showModalConfirm('¿Eliminar documento?', async () => {
    await eliminarDocumento(id);
    showToast('Eliminado', 'success');
    cargarConsulta();
  });
};
