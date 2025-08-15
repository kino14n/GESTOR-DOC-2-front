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
 * @param {string} tabId El ID de la pestaña a mostrar.
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
 * @param {HTMLButtonElement} button - El botón que fue presionado.
 * @param {string} pdfPath - El nombre del archivo PDF a procesar.
 * @param {string[]} codes - Array de códigos a resaltar.
 */
async function solicitarPdfResaltado(button, pdfPath, codes) {
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Procesando...';

    try {
        const response = await fetch(`${config.API_BASE}/resaltar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pdf_path: pdfPath,
                codes: codes
            })
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

// --- INICIALIZACIÓN DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('mainContent');
    if (main) {
        main.classList.add('hidden');
    }

    // Asigna el evento de clic a cada pestaña
    document.querySelectorAll('.tab').forEach(btn =>
        btn.addEventListener('click', () => window.showTab(btn.dataset.tab))
    );

    // Requiere autenticación antes de mostrar el contenido principal
    requireAuth(() => {
        document.getElementById('loginOverlay')?.classList.add('hidden');
        if (main) {
            main.classList.remove('hidden');
        }

        // Carga las funciones principales
        window.showTab('tab-search');
        cargarConsulta();
        initUploadForm();
        initAutocompleteCodigo(); // Activa las sugerencias

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
            if (!txt) return showToast('Ingrese uno o varios códigos para buscar', 'warning');

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

                        return `
                            <div class="doc-item">
                                <div>
                                    <p><strong>Documento:</strong> ${doc.name}</p>
                                    <p class="mt-1"><strong>Códigos cubiertos:</strong> ${codes.join(', ')}</p>
                                </div>
                                <div class="flex items-center gap-2 mt-2 md:mt-0">
                                    ${verPdfBtn}
                                    ${resaltarPdfBtn}
                                </div>
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
            if (!code) return showToast('Ingresa un código para buscar.', 'warning');

            codeSearchButton.disabled = true;
            codeSearchButton.textContent = "Buscando...";
            codeResultsContainer.innerHTML = '<p>Buscando...</p>';

            try {
                const results = await buscarPorCodigo(code, 'like');
                if (results && results.length > 0) {
                    codeResultsContainer.innerHTML = results.map(doc => {
                         const verPdfBtn = doc.path ? `<a class="btn btn--primary" href="uploads/${doc.path}" target="_blank">Ver PDF</a>` : '';
                         const editBtn = `<button class="btn btn--secondary" onclick="window.dispatchEdit(${doc.id})">Editar</button>`;
                         return `
                            <div class="doc-item">
                                <div>
                                    <p><strong>Documento:</strong> ${doc.name}</p>
                                    <p class="mt-1"><strong>Códigos:</strong> ${doc.codigos_extraidos || 'N/A'}</p>
                                </div>
                                <div class="flex items-center gap-2 mt-2 md:mt-0">
                                    ${verPdfBtn}
                                    ${editBtn}
                                </div>
                            </div>`;
                    }).join('');
                } else {
                    codeResultsContainer.innerHTML = '<p>No se encontraron documentos para ese código.</p>';
                }
            } catch (err) {
                showToast('Error en la búsqueda por código: ' + err.message, false);
                codeResultsContainer.innerHTML = `<p class="text-red-600">Error en la búsqueda.</p>`;
            } finally {
                codeSearchButton.disabled = false;
                codeSearchButton.textContent = "Buscar por Código";
            }
        };

        codeSearchButton.addEventListener('click', performCodeSearch);
        codeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performCodeSearch();
            }
        });
    });
});

/**
 * Asigna el evento de clic a los botones "Ver Códigos".
 * @param {HTMLElement} container El elemento que contiene los botones.
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
      }
    });
  });
}
window.bindCodeButtons = bindCodeButtons;