import { buscarOptimaAvanzada, buscarPorCodigo, sugerirCodigos, listarDocumentos } from './api.js';
import { cargarConsulta } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

// Switch visible tab. Takes an id and toggles classes accordingly.
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

  // Wire up tab buttons to switch tabs
  document.querySelectorAll('.tab').forEach(btn =>
    btn.addEventListener('click', () => window.showTab(btn.dataset.tab))
  );

  // Once authenticated, reveal the main UI and set up handlers
  requireAuth(() => {
    document.getElementById('loginOverlay')?.classList.add('hidden');
    main?.classList.remove('hidden');

    // Show default tab and load consultation list
    window.showTab('tab-search');
    cargarConsulta();

    // === BÚSQUEDA ÓPTIMA ===
    const optimaInput = document.getElementById('optimaSearchInput');
    const optimaButton = document.getElementById('doOptimaSearchButton');
    const optimaClear = document.getElementById('clearOptimaSearchButton');
    const optimaResults = document.getElementById('results-optima-search');

    optimaButton.addEventListener('click', async () => {
      const txt = optimaInput.value.trim();
      if (!txt) return showToast('Ingrese uno o varios códigos separados por coma', 'warning');
      try {
        const resultado = await buscarOptimaAvanzada(txt);
        if (resultado.documentos?.length) {
          optimaResults.innerHTML =
            resultado.documentos
              .map(d => {
                const documento = d.documento;
                const codigos = d.codigos_cubre;
                const pdf = documento.path
                  ? `<a href="${documento.path}" target="_blank">${documento.path}</a>`
                  : 'Sin PDF';
                return `
                  <div class="doc-item">
                    <p><strong>Documento:</strong> ${documento.name}</p>
                    <p><strong>Códigos cubiertos:</strong> ${codigos.join(', ')}</p>
                    <p><strong>PDF:</strong> ${pdf}</p>
                  </div>
                `;
              })
              .join('') +
            (resultado.codigos_faltantes?.length
              ? `<p>Códigos no encontrados: ${resultado.codigos_faltantes.join(', ')}</p>`
              : '');
        } else {
          optimaResults.innerHTML = 'No halló resultados.';
        }
      } catch {
        showToast('Error búsqueda', 'error');
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
      if (!c) return showToast('Ingrese código', 'warning');
      try {
        const resp = await buscarPorCodigo(c);
        // Determinar dónde está el array de documentos en la respuesta
        let docsArray;
        if (Array.isArray(resp)) {
          docsArray = resp;
        } else if (resp && Array.isArray(resp.documentos)) {
          docsArray = resp.documentos;
        } else if (resp && Array.isArray(resp.docs)) {
          docsArray = resp.docs;
        } else if (resp && Array.isArray(resp.results)) {
          docsArray = resp.results;
        } else {
          docsArray = [];
        }
        if (Array.isArray(docsArray) && docsArray.length) {
          /**
           * Extrae un array de códigos desde el objeto documento. Maneja múltiples
           * posibles nombres de campos y distintos tipos (cadena, array) para una
           * mayor robustez.
           * @param {any} doc
           * @returns {string[]}
           */
          function getCodesArray(doc) {
            const possibleFields = [
              'codigos_extraidos',
              'codigos',
              'codes',
              'codigo',
              'codigos_cubre',
              'codigosAsignados',
            ];
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
              return value
                .split(/[;,\s]+/)
                .map(s => s.trim())
                .filter(Boolean);
            }
            return [];
          }
          codeResults.innerHTML = docsArray
            .map(doc => {
              const fecha = doc.date ? new Date(doc.date).toLocaleDateString('es-ES') : '';
              const codesArr = getCodesArray(doc);
              const codesId = doc.id || Math.random().toString(36).slice(2);
              const codesListHtml = codesArr.length
                ? `<div id="codes-list-${codesId}" class="codes-list hidden">${codesArr
                    .map(code => `<span class="code-item">${code}</span>`)
                    .join(' ')}</div>`
                : `<div id="codes-list-${codesId}" class="codes-list hidden"><span>Sin códigos.</span></div>`;
              const pdfLink = doc.path
                ? `<a class="btn btn--primary" href="${doc.path}" target="_blank">Ver PDF</a>`
                : 'Sin PDF';
              return `
                <div class="doc-item">
                  <p><strong>${doc.name}</strong></p>
                  <p>${fecha}</p>
                  <p>${pdfLink}</p>
                  <button class="btn-ver-codigos" data-codes-id="${codesId}">Ver Códigos</button>
                  ${codesListHtml}
                </div>
              `;
            })
            .join('');
          bindCodeButtons(codeResults);
        } else {
          codeResults.innerHTML = 'No encontrado.';
        }
      } catch {
        showToast('Error búsqueda por código', 'error');
      }
    });

    // Delegación de eventos para mostrar/ocultar lista de códigos
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-ver-codigos');
      if (btn && btn.dataset.codesId) {
        const el = document.getElementById('codes-list-' + btn.dataset.codesId);
        if (el) {
          el.classList.remove('hidden');
          el.style.display = el.style.display === 'block' ? 'none' : 'block';
        }
      }
    });
  });

  // Inicializa formulario de subida y autocompletado
  initUploadForm();
  initAutocompleteCodigo();
});

/**
 * Adjunta listeners individuales a todos los botones "Ver Códigos" dentro de un contenedor.
 * Esta función se invoca después de renderizar los resultados de búsqueda para asegurar
 * que cada botón togglee correctamente su lista asociada.
 * @param {HTMLElement} container - El contenedor que contiene los resultados y los botones.
 */
function bindCodeButtons(container) {
  if (!container) return;
  const buttons = container.querySelectorAll('.btn-ver-codigos');
  buttons.forEach(btn => {
    const codesId = btn.dataset.codesId;
    btn.addEventListener('click', e => {
      e.preventDefault();
      const el = document.getElementById('codes-list-' + codesId);
      if (el) {
        el.classList.remove('hidden');
        el.style.display = el.style.display === 'block' ? 'none' : 'block';
      }
    });
  });
}