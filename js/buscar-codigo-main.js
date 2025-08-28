// js/buscar-codigo-main.js
// Este archivo controla la lógica exclusiva de la página buscar-codigo.html

import { buscarPorCodigo } from './api.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';
import { bindCodeButtons } from './main.js'; // Reutilizamos esta útil función
import { config } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const codeInput = document.getElementById('codeInput');
    const codeSearchButton = document.getElementById('doCodeSearchButton');
    const codeResultsContainer = document.getElementById('results-code');

    // Función principal para realizar la búsqueda
    const performCodeSearch = async () => {
        const code = codeInput.value.trim();
        if (!code) {
            showToast('Ingresa un término para buscar.', false);
            return;
        }

        codeSearchButton.disabled = true;
        codeSearchButton.textContent = "Buscando...";
        codeResultsContainer.innerHTML = '<p>Buscando...</p>';

        try {
            const results = await buscarPorCodigo(code, 'like');

            if (results && results.length > 0) {
                // Genera el HTML para cada resultado
                codeResultsContainer.innerHTML = results.map(doc => {
                    const codesArray = (doc.codigos_extraidos || '').split(',').map(s => s.trim()).filter(Boolean);
                    const codesId = `codes-list-search-${doc.id}`;
                    
                    const codesListHtml = `<div id="${codesId}" class="codes-list hidden">${
                        codesArray.length > 0 && codesArray[0] !== 'N/A'
                          ? codesArray.map(c => `<div class="code-item">${c}</div>`).join('')
                          : '<span>Sin códigos asociados.</span>'
                    }</div>`;

                    // Construye la URL completa para ver el PDF desde el backend
                    const pdfUrl = doc.path ? `${config.API_BASE}/api/documentos/files/${doc.path}` : null;
                    const verPdfBtn = pdfUrl ? `<a class="btn btn--secondary btn-small" href="${pdfUrl}" target="_blank">Ver PDF</a>` : '';
                    const verCodigosBtn = codesArray.length > 0 ? `<button class="btn btn--secondary btn-small btn-ver-codigos" data-codes-id="${codesId}">Ver Códigos</button>` : '';

                    return `
                        <div class="doc-item">
                            <div class="doc-item-info">
                                <p class="font-bold text-lg">${doc.name}</p>
                            </div>
                            <div class="doc-item-actions flex items-center gap-2">${verPdfBtn}${verCodigosBtn}</div>
                            ${codesListHtml}
                        </div>`;
                }).join('');
                
                // Activa los botones de "Ver Códigos"
                bindCodeButtons(codeResultsContainer);
            } else {
                codeResultsContainer.innerHTML = '<p>No se encontraron documentos que coincidan con la búsqueda.</p>';
            }
        } catch (err) {
            showToast('Error en la búsqueda: ' + err.message, false);
            codeResultsContainer.innerHTML = `<p class="text-red-600">Error al realizar la búsqueda.</p>`;
        } finally {
            codeSearchButton.disabled = false;
            codeSearchButton.textContent = "Buscar";
        }
    };

    // Asignar eventos al botón y al campo de entrada
    codeSearchButton.addEventListener('click', performCodeSearch);
    codeInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performCodeSearch();
        }
    });

    // Inicializar las sugerencias de autocompletado
    initAutocompleteCodigo();
});