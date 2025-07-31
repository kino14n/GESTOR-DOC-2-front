// js/consulta.js

import { listarDocumentos, eliminarDocumento } from './api.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';
import { bindCodeButtons, renderDocItem } from './main.js'; // Importamos la nueva función

let currentDocs = [];

/**
 * Carga y muestra los documentos en la lista de consulta.
 */
export async function cargarConsulta() {
  try {
    const docsRaw = await listarDocumentos();
    currentDocs = Array.isArray(docsRaw) ? docsRaw : (docsRaw?.documentos || docsRaw?.docs || []);

    renderDocs(currentDocs);
    const listEl = document.getElementById('results-list');
    if (listEl) bindCodeButtons(listEl);
  } catch (e) {
    console.error('Error al cargar documentos:', e);
    showToast('Error al cargar lista', 'error');
  }
}

/**
 * Renderiza la lista de documentos usando la función compartida.
 * @param {Array} docs - El array de documentos a mostrar.
 */
function renderDocs(docs) {
  const container = document.getElementById('results-list');
  if (!container) return;
  // Usamos la función importada, activando los botones de administrador
  container.innerHTML = docs.map(d => renderDocItem(d, { showAdminButtons: true })).join('');
}

// Editar documento y cambiar a pestaña “Subir”
window.dispatchEdit = async id => {
  try {
    const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api/documentos/${id}`);
    const docData = await res.json();
    if (docData && !docData.error) {
      if (window.loadDocumentForEdit) {
        window.loadDocumentForEdit(docData);
      }
      window.showTab('tab-upload');
    } else {
      showToast('Error al cargar el documento para editar', false);
    }
  } catch (e) {
    showToast('Error de conexión al editar', false);
  }
};

// Filtros y acciones de la pestaña de consulta
window.clearConsultFilter = () => {
  const input = document.getElementById('consultFilterInput');
  if (input) input.value = '';
  renderDocs(currentDocs);
  const listEl = document.getElementById('results-list');
  if (listEl) bindCodeButtons(listEl);
};

window.doConsultFilter = () => {
  const term = document.getElementById('consultFilterInput').value.toLowerCase().trim();
  const getCodes = (doc) => (doc.codigos_extraidos || '').toLowerCase();
  
  const filteredDocs = currentDocs.filter(d =>
    d.name.toLowerCase().includes(term) ||
    getCodes(d).includes(term) ||
    (d.path || '').toLowerCase().includes(term)
  );
  renderDocs(filteredDocs);
  const listEl = document.getElementById('results-list');
  if (listEl) bindCodeButtons(listEl);
};

window.downloadCsv = () => {
  // Idealmente, esta URL debería ser la del backend
  window.open(`https://gestor-doc-backend-production.up.railway.app/api/documentos?format=csv`, '_blank');
};

// Confirma eliminación y recarga la lista
window.eliminarDoc = id => {
  showModalConfirm('¿Está seguro de que desea eliminar este documento?', async () => {
    try {
      await eliminarDocumento(id);
      showToast('Documento eliminado correctamente', 'success');
      cargarConsulta(); // Recarga la lista para reflejar el cambio
    } catch {
      showToast('No se pudo eliminar el documento', 'error');
    }
  });
};