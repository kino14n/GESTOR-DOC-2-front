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
    function getCodesArray(doc) {
        const fields = ['codigos_extraidos', 'codigos', 'codes', 'codigo', 'codigos_cubre', 'codigosAsignados'];
        let value;
        for (const field of fields) {
            if (doc && Object.prototype.hasOwnProperty.call(doc, field)) {
                value = doc[field];
                break;
            }
        }
        if (!value) return [];
        if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
        if (typeof value === 'string') return value.split(/[;,\s]+/).map(s => s.trim()).filter(Boolean);
        return [];
    }

    return docs.map(doc => {
        const fecha = doc.date ? new Date(doc.date).toLocaleDateString('es-ES') : '';
        const codesArr = getCodesArray(doc);
        const codesId = doc.id || Math.random().toString(36).slice(2);
        
        const codesListHtml = codesArr.length
            ? `<div id="codes-list-${codesId}" class="codes-list hidden">${codesArr.map(code => `<div class="code-item">${code}</div>`).join('')}</div>`
            : `<div id="codes-list-${codesId}" class="codes-list hidden"><span>Sin códigos.</span></div>`;
        
        const pdfButton = doc.path ? `<a class="btn btn--primary btn-small" href="uploads/${doc.path}" target="_blank">Ver PDF</a>` : '<span>Sin PDF</span>';

        // Se usa onclick para una llamada directa y robusta.
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

    // === BÚSQUEDA ÓPTIMA (Lógica existente y funcional) ===
    const optimaButton = document.getElementById('doOptimaSearchButton');
    const optimaClear = document.getElementById('clearOptimaSearchButton');
    const optimaInput = document.getElementById('optimaSearchInput');
    const optimaResults = document.getElementById('results-optima-search');
    optimaButton.addEventListener('click', async () => {
        const txt = optimaInput.value.trim();
        if (!txt) return showToast('Ingrese texto para buscar', 'warning');
        try {
            const resultado = await buscarOptimaAvanzada(txt);
            if (resultado.documentos?.length) {
                optimaResults.innerHTML = resultado.documentos.map(d => {
                    const doc = d.documento;
                    const pdf = doc.path ? `<a class="btn btn--primary" href="uploads/${doc.path}" target="_blank">Ver PDF</a>` : 'Sin PDF';
                    return `<div class="doc-item"><p><strong>Documento:</strong> ${doc.name}</p><p><strong>Códigos cubiertos:</strong> ${d.codigos_cubre.join(', ')}</p><p><strong>PDF:</strong> ${pdf}</p></div>`;
                }).join('') + (resultado.codigos_faltantes?.length ? `<p>Códigos no encontrados: ${resultado.codigos_faltantes.join(', ')}</p>` : '');
            } else {
                optimaResults.innerHTML = 'No se encontraron resultados.';
            }
        } catch (e) {
            showToast('Error en la búsqueda', 'error');
        }
    });
    optimaClear.addEventListener('click', () => {
        optimaInput.value = '';
        optimaResults.innerHTML = '';
    });

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
          return codes.some(code => code === searchCode || code.includes(searchCode));
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