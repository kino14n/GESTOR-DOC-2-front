import { listarDocumentos, eliminarDocumento } from './api.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';

let currentDocs = [];

export async function cargarConsulta() {
  try {
    currentDocs = await listarDocumentos();
    renderDocs(currentDocs);
  } catch (e) {
    console.error('Error al cargar documentos:', e);
    showToast('Error al cargar lista', 'error');
  }
}

function renderDocs(docs) {
  const container = document.getElementById('results-list');
  if (!container) return;

  container.innerHTML = docs.map(d => {
    const fecha = new Date(d.date).toLocaleDateString('es-ES');
    const codesArray = (d.codigos_extraidos || '').split(',').map(s => s.trim()).filter(Boolean);
    const codesList = codesArray.length
      ? `<ul class="codes-list mt-2 ml-4 list-disc list-inside" id="codes-list-${d.id}" style="display:none;">
            ${codesArray.map(c => `<li>${c}</li>`).join('')}
         </ul>`
      : `<p class="mt-2 italic" id="codes-list-${d.id}" style="display:none;">Sin códigos.</p>`;

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
        <button class="btn btn-small btn-secondary mb-1 btn-ver-codigos" data-codes-id="${d.id}">Ver Códigos</button>
        ${codesList}
        <div class="mt-3 flex gap-2">
          <button onclick="dispatchEdit(${d.id})" class="btn btn-small btn-primary">Editar</button>
          <button onclick="eliminarDoc(${d.id})" class="btn btn-small btn-danger">Eliminar</button>
        </div>
      </div>
    `;
  }).join('');
}

// ...el resto igual (sin ningún window.toggleCodes)
