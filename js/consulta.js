// js/consulta.js

import { listarDocumentos, eliminarDocumento } from './api.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';

let currentDocs = [];

function renderDocs(docs) {
  const container = document.getElementById('results-list');
  if (!container) return;

  container.innerHTML = docs.map(d => {
      if (!d || !d.id) return '';
      const fecha = d.date ? new Date(d.date).toLocaleDateString('es-ES') : '';
      const codesArray = (d.codigos_extraidos || '').split(',').map(s => s.trim()).filter(Boolean);
      const codesId = d.id;

      const codesListHtml = codesArray.length
        ? `<div id="codes-list-${codesId}" class="codes-list" style="display: none;">${codesArray.map(c => `<div class="code-item">${c}</div>`).join('')}</div>`
        : `<div id="codes-list-${codesId}" class="codes-list" style="display: none;"><span>Sin códigos asignados.</span></div>`;

      const pdfButton = d.path ? `<a class="btn btn--primary btn-small" href="uploads/${d.path}" target="_blank">Ver PDF</a>` : '';
      const adminButtons = `<button class="btn btn--secondary btn-small" onclick="dispatchEdit(${d.id})">Editar</button>
                            <button class="btn btn--warning btn-small" onclick="eliminarDoc(${d.id})">Eliminar</button>`;
      
      return `
          <div class="doc-item">
              <div><strong>${d.name}</strong> (${fecha})</div>
              <div class="actions">
                  ${pdfButton}
                  <button class="btn btn--secondary btn-small" onclick="window.toggleCodeVisibility('${codesId}')">Ver Códigos</button>
                  ${adminButtons}
              </div>
              ${codesListHtml}
          </div>
      `;
    }).join('');
}

export async function cargarConsulta() {
  try {
    const docsRaw = await listarDocumentos();
    currentDocs = Array.isArray(docsRaw) ? docsRaw : [];
    renderDocs(currentDocs);
  } catch (e) {
    showToast('Error al cargar la lista de documentos', 'error');
  }
}

// --- FUNCIONES GLOBALES ---

window.dispatchEdit = async id => {
  try {
    const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api/documentos/${id}`);
    const docData = await res.json();
    if (docData && !docData.error) {
      if (window.loadDocumentForEdit) window.loadDocumentForEdit(docData);
      window.showTab('tab-upload');
    } else {
      showToast('Error al cargar datos del documento', false);
    }
  } catch (e) {
    showToast('Error de conexión al intentar editar', false);
  }
};

window.clearConsultFilter = () => {
  const input = document.getElementById('consultFilterInput');
  if (input) input.value = '';
  renderDocs(currentDocs);
};

window.doConsultFilter = () => {
  const term = document.getElementById('consultFilterInput').value.toLowerCase().trim();
  const filteredDocs = currentDocs.filter(d =>
    d.name.toLowerCase().includes(term) ||
    (d.codigos_extraidos || '').toLowerCase().includes(term) ||
    (d.path || '').toLowerCase().includes(term)
  );
  renderDocs(filteredDocs);
};

window.eliminarDoc = id => {
  showModalConfirm('¿Está seguro de que desea eliminar este documento?', async () => {
    try {
      await eliminarDocumento(id);
      showToast('Documento eliminado correctamente', 'success');
      cargarConsulta();
    } catch {
      showToast('No se pudo eliminar el documento', 'error');
    }
  });
};