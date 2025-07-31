// js/main.js

import { buscarOptimaAvanzada, listarDocumentos } from './api.js';
import { cargarConsulta } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

// --- FUNCIONES COMPARTIDAS ---

/**
 * Extrae un array de códigos de un objeto de documento.
 * Es robusto y busca en diferentes posibles campos de datos.
 * @param {object} doc - El objeto del documento.
 * @returns {string[]} Un array de códigos.
 */
function getCodesArray(doc) {
  const possibleFields = [
    'codigos_extraidos', 'codigos', 'codes', 'codigo', 'codigos_cubre', 'codigosAsignados',
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
    return value.split(/[;,\s]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Renderiza el HTML para un único item de documento.
 * Esta función se exporta para ser usada en toda la aplicación.
 * @param {object} doc - El objeto del documento.
 * @param {object} options - Opciones de visualización.
 * @param {boolean} options.showAdminButtons - Define si se muestran los botones de Editar/Eliminar.
 * @returns {string} El HTML del item del documento.
 */
export function renderDocItem(doc, options = { showAdminButtons: false }) {
  const fecha = doc.date ? new Date(doc.date).toLocaleDateString('es-ES') : '';
  const codesArray = getCodesArray(doc);
  const codesId = doc.id || Math.random().toString(36).slice(2);

  const codesListHtml = codesArray.length
    ? `<div id="codes-list-${codesId}" class="codes-list hidden">${codesArray
        .map(c => `<div class="code-item">${c}</div>`).join('')}</div>`
    : `<div id="codes-list-${codesId}" class="codes-list hidden"><span>Sin códigos.</span></div>`;

  const pdfButton = doc.path
    ? `<a class="btn btn--primary btn-small" href="uploads/${doc.path}" target="_blank">Ver PDF</a>`
    : '';

  const adminButtons = options.showAdminButtons
    ? `<button class="btn btn--secondary btn-small" onclick="dispatchEdit(${doc.id})">Editar</button>
       <button class="btn btn--warning btn-small" onclick="eliminarDoc(${doc.id})">Eliminar</button>`
    : '';

  return `
    <div class="doc-item">
      <div><strong>${doc.name}</strong> (${fecha})</div>
      <div class="actions">
        ${pdfButton}
        <button class="btn btn-ver-codigos btn--secondary btn-small" data-codes-id="${codesId}">Ver Códigos</button>
        ${adminButtons}
      </div>
      ${codesListHtml}
    </div>
  `;
}

/**
 * Adjunta listeners a los botones "Ver Códigos" para que muestren/oculten la lista.
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


// --- LÓGICA PRINCIPAL ---

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
                  ? `<a class="btn btn--primary" href="uploads/${documento.path}" target="_blank">Ver PDF</a>`
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
        const allDocsRaw = await listarDocumentos();
        let allDocs = Array.isArray(allDocsRaw) ? allDocsRaw : (allDocsRaw?.documentos || allDocsRaw?.docs || []);
        
        const searchCode = c.toUpperCase();
        const matchedDocs = allDocs.filter(doc => {
          const codes = getCodesArray(doc).map(str => str.toUpperCase());
          return codes.some(code => code === searchCode || code.includes(searchCode));
        });

        if (matchedDocs.length) {
          codeResults.innerHTML = matchedDocs.map(doc => renderDocItem(doc, { showAdminButtons: false })).join('');
          bindCodeButtons(codeResults);
        } else {
          codeResults.innerHTML = 'No encontrado.';
        }
      } catch (err) {
        console.error(err);
        showToast('Error búsqueda por código', 'error');
      }
    });
  });

  initUploadForm();
  initAutocompleteCodigo();
});