// GESTOR-DOC-2-front/js/main.js

import { buscarOptimaAvanzada, buscarPorCodigo, listarDocumentos } from './api.js';
import { cargarConsulta } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';
import { config } from './config.js';

// ... (El código de showTab y solicitarPdfResaltado se mantiene igual) ...
window.showTab = tabId => {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  document.getElementById(tabId)?.classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(btn =>
    btn.dataset.tab === tabId ? btn.classList.add('active') : btn.classList.remove('active')
  );
};
// ...

document.addEventListener('DOMContentLoaded', () => {
    // ... (Toda la lógica de inicialización y de la búsqueda óptima se mantiene igual) ...
    requireAuth(() => {
        // ...
        
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
                    // --- 👇 INICIO DE LA CORRECCIÓN ---
                    codeResultsContainer.innerHTML = results.map(doc => {
                        // 1. Preparamos los códigos para mostrarlos en una lista
                        const codesArray = (doc.codigos_extraidos || '').split(',').map(s => s.trim()).filter(Boolean);
                        const codesId = `codes-list-search-${doc.id}`;

                        // 2. Creamos el HTML para la lista de códigos (inicialmente oculta)
                        const codesListHtml = `<div id="${codesId}" class="codes-list hidden">${
                            codesArray.length > 0 && codesArray[0] !== 'N/A'
                              ? codesArray.map(c => `<div class="code-item">${c}</div>`).join('')
                              : '<span>Sin códigos asociados.</span>'
                        }</div>`;

                        const verPdfBtn = doc.path ? `<a class="btn btn--primary" href="uploads/${doc.path}" target="_blank">Ver PDF</a>` : '';
                        const editBtn = `<button class="btn btn--secondary" onclick="window.dispatchEdit(${doc.id})">Editar</button>`;
                        
                        // 3. Añadimos el nuevo botón "Ver Códigos"
                        const verCodigosBtn = `<button class="btn btn--secondary btn-ver-codigos" data-codes-id="${codesId}">Ver Códigos</button>`;

                        return `
                            <div class="doc-item">
                                <div class="doc-item-info">
                                    <p class="font-bold text-lg">${doc.name}</p>
                                    <p class="text-sm mt-2">${verPdfBtn}</p>
                                </div>
                                <div class="doc-item-actions">
                                    ${editBtn}
                                    ${verCodigosBtn}
                                </div>
                                ${codesListHtml}
                            </div>`;
                    }).join('');
                    
                    // 4. Se llama a bindCodeButtons para activar los nuevos botones
                    bindCodeButtons(codeResultsContainer);
                    // --- 👆 FIN DE LA CORRECCIÓN ---

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
    
    initUploadForm();
    initAutocompleteCodigo();
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
        btn.textContent = el.classList.contains('hidden') ? 'Ver Códigos' : 'Ocultar Códigos';
      }
    });
  });
}
window.bindCodeButtons = bindCodeButtons;