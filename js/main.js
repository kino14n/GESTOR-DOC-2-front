// GESTOR-DOC-2-front/js/main.js

import { buscarOptimaAvanzada, buscarPorCodigo, listarDocumentos } from './api.js';
import { cargarConsulta } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';
import { config } from './config.js';

/**
 * Cambia la pestaña visible en la interfaz.
 */
window.showTab = tabId => {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  document.getElementById(tabId)?.classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(btn =>
    btn.dataset.tab === tabId ? btn.classList.add('active') : btn.classList.remove('active')
  );
};

/**
 * Llama al backend para solicitar un PDF con códigos resaltados.
 */
async function solicitarPdfResaltado(button, pdfPath, codes) {
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Procesando...';

    try {
        // Esta URL debe coincidir con la ruta que implementes en el backend para esta función
        const response = await fetch(`${config.API_BASE}/api/documentos/resaltar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdf_path: pdfPath, codes: codes })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error desconocido al resaltar el PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 100);

    } catch (error) {
        console.error('Error al solicitar PDF resaltado:', error);
        showToast(error.message, false);
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

/**
 * Asigna el evento de clic a los botones "Ver Códigos" y cambia su texto.
 */
export function bindCodeButtons(container) {
  if (!container) return;
  const buttons = container.querySelectorAll('.btn-ver-codigos');
  buttons.forEach(btn => {
    const codesId = btn.dataset.codesId;
    if (!codesId) return;

    btn.addEventListener('click', e => {
      e.preventDefault();
      const el = document.getElementById(codesId);
      if (el) {
        el.classList.toggle('hidden');
        btn.textContent = el.classList.contains('hidden') ? 'Ver Códigos' : 'Ocultar Códigos';
      }
    });
  });
}
window.bindCodeButtons = bindCodeButtons;


// --- INICIALIZACIÓN DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('mainContent');
    if (main) main.classList.add('hidden');

    document.querySelectorAll('.tab').forEach(btn =>
        btn.addEventListener('click', () => window.showTab(btn.dataset.tab))
    );

    requireAuth(() => {
        document.getElementById('loginOverlay')?.classList.add('hidden');
        if (main) main.classList.remove('hidden');

        // Carga inicial de datos y funcionalidades
        window.showTab('tab-search');
        cargarConsulta();
        initUploadForm();
        initAutocompleteCodigo();

        // === LÓGICA DE BÚSQUEDA ÓPTIMA ===
        const optimaInput = document.getElementById('optimaSearchInput');
        const optimaButton = document.getElementById('doOptimaSearchButton');
        const optimaClear = document.getElementById('clearOptimaSearchButton');
        const optimaResults = document.getElementById('results-optima-search');

        function attachResaltarListeners() {
            optimaResults.querySelectorAll('.btn-resaltar').forEach(button => {
                button.addEventListener('click', () => {
                    const pdfPath = button.dataset.pdfPath;
                    const codes = JSON.parse(button.dataset.codes);
                    solicitarPdfResaltado(button, pdfPath, codes);
                });
            });
        }

        const doOptimaSearch = async () => {
            const txt = optimaInput.value.trim();
            if (!txt) return showToast('Ingresa uno o varios códigos para buscar', 'warning');
            
            optimaButton.disabled = true;
            optimaButton.textContent = "Buscando...";
            optimaResults.innerHTML = '<p>Buscando...</p>';

            try {
                const resultado = await buscarOptimaAvanzada(txt);
                if (resultado.documentos?.length) {
                    const docsHtml = resultado.documentos.map(d => {
                        const doc = d.documento;
                        const codes = d.codigos_cubre;
                        const codesJsonString = JSON.stringify(codes);
                        const verPdfBtn = doc.path ? `<a class="btn btn--primary" href="uploads/${doc.path}" target="_blank">Ver PDF</a>` : '';
                        const resaltarPdfBtn = doc.path ? `<button class="btn btn-secondary btn-resaltar" data-pdf-path="${doc.path}" data-codes='${codesJsonString}'>PDF Resaltado</button>` : '';

                        return `<div class="doc-item">
                                    <div>
                                        <p><strong>Documento:</strong> ${doc.name}</p>
                                        <p class="mt-1"><strong>Códigos cubiertos:</strong> ${codes.join(', ')}</p>
                                    </div>
                                    <div class="flex items-center gap-2 mt-2 md:mt-0">${verPdfBtn}${resaltarPdfBtn}</div>
                                </div>`;
                    }).join('');
                    const faltantesHtml = resultado.codigos_faltantes?.length ? `<p class="mt-4 text-red-600">Códigos no encontrados: ${resultado.codigos_faltantes.join(', ')}</p>` : '';
                    optimaResults.innerHTML = docsHtml + faltantesHtml;
                    attachResaltarListeners();
                } else {
                    optimaResults.innerHTML = '<p>No se encontraron documentos que cubran los códigos solicitados.</p>';
                }
            } catch (err) {
                showToast('Error en la búsqueda: ' + err.message, false);
                optimaResults.innerHTML = `<p class="text-red-600">Error en la búsqueda.</p>`;
            } finally {
                optimaButton.disabled = false;
                optimaButton.textContent = "Buscar";
            }
        };

        optimaButton.addEventListener('click', doOptimaSearch);
        optimaClear.addEventListener('click', () => {
            optimaInput.value = '';
            optimaResults.innerHTML = '';
        });

        // === LÓGICA PARA BÚSQUEDA POR CÓDIGO ===
        const codeInput = document.getElementById('codeInput');
        const codeSearchButton = document.getElementById('doCodeSearchButton');
        const codeResultsContainer = document.getElementById('results-code');

        const performCodeSearch = async () => {
            const code = codeInput.value.trim();
            if (!code) return showToast('Ingresa un término para buscar.', 'warning');

            codeSearchButton.disabled = true;
            codeSearchButton.textContent = "Buscando...";
            codeResultsContainer.innerHTML = '<p>Buscando...</p>';

            try {
                const results = await buscarPorCodigo(code, 'like');
                if (results && results.length > 0) {
                    codeResultsContainer.innerHTML = results.map(doc => {
                        const codesArray = (doc.codigos_extraidos || '').split(',').map(s => s.trim()).filter(Boolean);
                        const codesId = `codes-list-search-${doc.id}`;
                        const codesListHtml = `<div id="${codesId}" class="codes-list hidden">${
                            codesArray.length > 0 && codesArray[0] !== 'N/A'
                              ? codesArray.map(c => `<div class="code-item">${c}</div>`).join('')
                              : '<span>Sin códigos asociados.</span>'
                        }</div>`;
                        const verPdfBtn = doc.path ? `<a class="btn btn--primary" href="uploads/${doc.path}" target="_blank">Ver PDF</a>` : '';
                        const editBtn = `<button class="btn btn--secondary" onclick="window.dispatchEdit(${doc.id})">Editar</button>`;
                        const verCodigosBtn = `<button class="btn btn--secondary btn-ver-codigos" data-codes-id="${codesId}">Ver Códigos</button>`;

                        return `<div class="doc-item">
                                    <div class="doc-item-info">
                                        <p class="font-bold text-lg">${doc.name}</p>
                                        <p class="text-sm mt-2">${verPdfBtn}</p>
                                    </div>
                                    <div class="doc-item-actions">${editBtn}${verCodigosBtn}</div>
                                    ${codesListHtml}
                                </div>`;
                    }).join('');
                    bindCodeButtons(codeResultsContainer);
                } else {
                    codeResultsContainer.innerHTML = '<p>No se encontraron documentos que coincidan con la búsqueda.</p>';
                }
            } catch (err) {
                showToast('Error en la búsqueda: ' + err.message, false);
                codeResultsContainer.innerHTML = `<p class="text-red-600">Error al realizar la búsqueda.</p>`;
            } finally {
                codeSearchButton.disabled = false;
                codeSearchButton.textContent = "Buscar por Código";
            }
        };

        codeSearchButton.addEventListener('click', performCodeSearch);
        codeInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performCodeSearch();
            }
        });
    });
});