// js/main.js

import { buscarOptimaAvanzada, listarDocumentos } from './api.js';
import { cargarConsulta } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

/**
 * Función de renderizado para la pestaña "Buscar por Código".
 * @param {Array} docs - Lista de documentos a mostrar.
 * @returns {string} El HTML de los resultados.
 */
function renderBuscarCodigoResults(docs) {
    return docs.map(doc => {
        const fecha = doc.date ? new Date(doc.date).toLocaleDateString('es-ES') : '';
        const codesArray = (doc.codigos_extraidos || '').split(',').map(s => s.trim()).filter(Boolean);
        // Se usa el ID del documento para crear un identificador único.
        const codesId = doc.id; 
        
        const codesListHtml = codesArray.length
            ? `<div id="codes-list-${codesId}" class="codes-list hidden">${codesArray.map(code => `<div class="code-item">${code}</div>`).join('')}</div>`
            : `<div id="codes-list-${codesId}" class="codes-list hidden"><span>Sin códigos.</span></div>`;
        
        const pdfButton = doc.path ? `<a class="btn btn--primary btn-small" href="uploads/${doc.path}" target="_blank">Ver PDF</a>` : '<span>Sin PDF</span>';

        // CORRECCIÓN: Se pasa el ID único del documento a la función.
        return `
            <div class="doc-item">
                <div><strong>${doc.name}</strong> (${fecha})</div>
                <div class="actions">
                    ${pdfButton}
                    <button class="btn btn--secondary btn-small" onclick="window.toggleCodeVisibility('${codesId}')">Ver Códigos</button>
                </div>
                ${codesListHtml}
            </div>
        `;
    }).join('');
}

// --- LÓGICA PRINCIPAL DE LA APLICACIÓN ---

window.showTab = tabId => {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  document.getElementById(tabId)?.classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(btn =>
    btn.dataset.tab === tabId ? btn.classList.add('active') : btn.classList.remove('active')
  );
};

/**
 * Función global para mostrar/ocultar la lista de códigos.
 * @param {string} codesId - El ID único de la lista de códigos.
 */
window.toggleCodeVisibility = (codesId) => {
    if (!codesId) return;
    const codesList = document.getElementById(`codes-list-${codesId}`);
    if (codesList) {
        codesList.classList.toggle('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('mainContent');
  main?.classList.add('hidden');

  document.querySelectorAll('.tab').forEach(btn =>
    btn.addEventListener('click', () => window.showTab(btn.dataset.tab))
  );

  requireAuth(() => {
    document.getElementById('loginOverlay')?.classList.add('hidden');
    main?.classList.remove('hidden');
    window.showTab('tab-search');
    cargarConsulta();

    // === BÚSQUEDA POR CÓDIGO ===
    const codeInput = document.getElementById('codeInput');
    const codeSearchButton = document.getElementById('doCodeSearchButton');
    const codeResults = document.getElementById('results-code');

    codeSearchButton.addEventListener('click', async () => {
      const c = codeInput.value.trim();
      if (!c) return showToast('Ingrese un código', 'warning');
      try {
        const allDocsRaw = await listarDocumentos();
        const allDocs = Array.isArray(allDocsRaw) ? allDocsRaw : (allDocsRaw?.documentos || []);
        const searchCode = c.toUpperCase();
        const matchedDocs = allDocs.filter(doc => {
          const codes = (doc.codigos_extraidos || '').split(',').map(str => str.trim().toUpperCase());
          return codes.some(code => code.includes(searchCode));
        });

        if (matchedDocs.length) {
          codeResults.innerHTML = renderBuscarCodigoResults(matchedDocs);
        } else {
          codeResults.innerHTML = 'No encontrado.';
        }
      } catch (err) {
        showToast('Error en la búsqueda por código', 'error');
      }
    });
  });

  initUploadForm();
  initAutocompleteCodigo();
});