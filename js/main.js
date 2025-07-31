// js/main.js

import { buscarOptimaAvanzada, listarDocumentos } from './api.js';
import { cargarConsulta } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

/**
 * Adjunta listeners a los botones "Ver Códigos" para que muestren/oculten la lista.
 * Se exporta para que consulta.js también pueda usarla.
 * @param {HTMLElement} container - El elemento que contiene los resultados.
 */
export function bindCodeButtons(container) {
  if (!container) return;
  const buttons = container.querySelectorAll('.btn-ver-codigos');
  buttons.forEach(btn => {
    const codesId = btn.dataset.codesId;
    const oldHandler = btn.__codeToggleHandler;
    if (oldHandler) {
      btn.removeEventListener('click', oldHandler);
    }
    const newHandler = e => {
      e.preventDefault();
      const el = document.getElementById('codes-list-' + codesId);
      if (el) {
        el.classList.toggle('hidden');
      }
    };
    btn.addEventListener('click', newHandler);
    btn.__codeToggleHandler = newHandler;
  });
}

/**
 * Función de renderizado dedicada para la pestaña "Buscar por Código".
 * @param {Array} docs - Lista de documentos a mostrar.
 * @returns {string} El HTML de los resultados.
 */
function renderBuscarCodigoResults(docs) {
    function getCodesArray(doc) {
        const possibleFields = ['codigos_extraidos', 'codigos', 'codes', 'codigo', 'codigos_cubre', 'codigosAsignados'];
        let value;
        for (const field of possibleFields) {
            if (doc && Object.prototype.hasOwnProperty.call(doc, field)) {
                value = doc[field];
                break;
            }
        }
        if (!value) return [];
        if (Array.isArray(value)) {
            return value.map(v => String(v).trim()).filter(Boolean);
        }
        if (typeof value === 'string') {
            return value.split(/[;,\s]+/).map(s => s.trim()).filter(Boolean);
        }
        return [];
    }

    return docs.map(doc => {
        const fecha = doc.date ? new Date(doc.date).toLocaleDateString('es-ES') : '';
        const codesArr = getCodesArray(doc);
        const codesId = doc.id || Math.random().toString(36).slice(2);
        
        const codesListHtml = codesArr.length
            ? `<div id="codes-list-${codesId}" class="codes-list hidden">${codesArr
                .map(code => `<div class="code-item">${code}</div>`).join('')}</div>`
            : `<div id="codes-list-${codesId}" class="codes-list hidden"><span>Sin códigos.</span></div>`;
        
        const pdfButton = doc.path
            ? `<a class="btn btn--primary btn-small" href="uploads/${doc.path}" target="_blank">Ver PDF</a>`
            : '<span>Sin PDF</span>';

        return `
            <div class="doc-item">
                <div><strong>${doc.name}</strong> (${fecha})</div>
                <div class="actions">
                    ${pdfButton}
                    <button class="btn btn-ver-codigos btn--secondary btn-small" data-codes-id="${codesId}">Ver Códigos</button>
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

    // === BÚSQUEDA ÓPTIMA ===
    const optimaInput = document.getElementById('optimaSearchInput');
    const optimaButton = document.getElementById('doOptimaSearchButton');
    const optimaClear = document.getElementById('clearOptimaSearchButton');
    const optimaResults = document.getElementById('results-optima-search');

    optimaButton.addEventListener('click', async () => {
      // (Esta sección no se modifica)
    });

    optimaClear.addEventListener('click', () => {
      // (Esta sección no se modifica)
    });

    // === BÚSQUEDA POR CÓDIGO ===
    const codeInput = document.getElementById('codeInput');
    const codeSearchButton = document.getElementById('doCodeSearchButton');
    const codeResults = document.getElementById('results-code');

    function extractCodes(doc) {
        const possibleFields = ['codigos_extraidos', 'codigos', 'codes', 'codigo', 'codigos_cubre', 'codigosAsignados'];
        let value;
        for (const field of possibleFields) {
            if (doc && Object.prototype.hasOwnProperty.call(doc, field)) {
                value = doc[field];
                break;
            }
        }
        if (!value) return [];
        if (Array.isArray(value)) { return value.map(v => String(v).trim()).filter(Boolean); }
        if (typeof value === 'string') { return value.split(/[;,\s]+/).map(s => s.trim()).filter(Boolean); }
        return [];
    }

    codeSearchButton.addEventListener('click', async () => {
      const c = codeInput.value.trim();
      if (!c) return showToast('Ingrese código', 'warning');
      try {
        const allDocsRaw = await listarDocumentos();
        const allDocs = Array.isArray(allDocsRaw) ? allDocsRaw : (allDocsRaw?.documentos || []);
        
        const searchCode = c.toUpperCase();
        const matchedDocs = allDocs.filter(doc => {
          const codes = extractCodes(doc).map(str => str.toUpperCase());
          return codes.some(code => code === searchCode || code.includes(searchCode));
        });

        if (matchedDocs.length) {
          codeResults.innerHTML = renderBuscarCodigoResults(matchedDocs);
          bindCodeButtons(codeResults); // Llamada clave para activar los botones
        } else {
          codeResults.innerHTML = 'No encontrado.';
        }
      } catch (err) {
        console.error(err);
        showToast('Error en la búsqueda por código', 'error');
      }
    });
  });

  initUploadForm();
  initAutocompleteCodigo();
});