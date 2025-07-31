// js/consulta.js

import { listarDocumentos, eliminarDocumento } from './api.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';
import { bindCodeButtons } from './main.js';

let currentDocs = [];

export async function cargarConsulta() {
  try {
    currentDocs = await listarDocumentos();
    renderDocs(currentDocs);
    const listEl = document.getElementById('results-list');
    if (listEl) bindCodeButtons(listEl);
  } catch (e) {
    console.error('Error al cargar documentos:', e);
    showToast('Error al cargar lista', 'error');
  }
}

function renderDocs(docs) {
  const container = document.getElementById('results-list');
  if (!container) return;
  container.innerHTML = docs.map(d => {
      const fecha = d.date ? new Date(d.date).toLocaleDateString('es-ES') : '';
      const codesArray = (d.codigos_extraidos || '').split(',').map(s => s.trim()).filter(Boolean);
      const codesId = d.id || Math.random().toString(36).slice(2);

      const codesListHtml = codesArray.length
        ? `<div id="codes-list-${codesId}" class="codes-list hidden">${codesArray
            .map(c => `<div class="code-item">${c}</div>`).join('')}</div>`
        : `<div id="codes-list-${codesId}" class="codes-list hidden"><span>Sin códigos.</span></div>`;

      const pdfButton = d.path
        ? `<a class="btn btn--primary btn-small" href="uploads/${d.path}" target="_blank">Ver PDF</a>`
        : '';

      return `
        <div class="doc-item">
          <div><strong>${d.name}</strong> (${fecha})</div>
          <div class="actions">
            ${pdfButton}
            <button class="btn btn-ver-codigos btn--secondary btn-small" data-codes-id="${codesId}">Ver Códigos</button>
            <button class="btn btn--secondary btn-small" onclick="dispatchEdit(${d.id})">Editar</button>
            <button class="btn btn--warning btn-small" onclick="eliminarDoc(${d.id})">Eliminar</button>
          </div>
          ${codesListHtml}
        </div>
      `;
    }).join('');
}

window.dispatchEdit = async id => {
  const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api/documentos/${id}`);
  const docData = await res.json();
  if (docData && !docData.error) {
    if (window.loadDocumentForEdit) {
      window.loadDocumentForEdit(docData);
    }
    window.showTab('tab-upload');
  } else {
    showToast('Error al cargar el documento', false);
  }
};

window.clearConsultFilter = () => {
  const input = document.getElementById('consultFilterInput');
  if (input) input.value = '';
  renderDocs(currentDocs);
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
  const listEl = document.getElementById('results-list');
  if (listEl) bindCodeButtons(listEl);
};

window.downloadCsv = () => window.open(`/api/documentos?format=csv`, '_blank');

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