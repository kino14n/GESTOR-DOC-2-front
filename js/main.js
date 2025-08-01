import { buscarOptimaAvanzada, buscarPorCodigo, sugerirCodigos, listarDocumentos } from './api.js';
import { cargarConsulta } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';
import { config } from './config.js';

// Switch visible tab. Takes an id and toggles classes accordingly.
window.showTab = tabId => {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  document.getElementById(tabId)?.classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(btn =>
    btn.dataset.tab === tabId ? btn.classList.add('active') : btn.classList.remove('active')
  );
};

/**
 * Llama al backend de App1 para que este pida el PDF resaltado a App2.
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
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error al solicitar PDF resaltado:', error);
        showToast(error.message, false);
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}
window.solicitarPdfResaltado = solicitarPdfResaltado;


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

    window.showTab('tab-search');
    cargarConsulta();

    // === BÚSQUEDA ÓPTIMA (MODIFICADA) ===
    const optimaInput = document.getElementById('optimaSearchInput');
    const optimaButton = document.getElementById('doOptimaSearchButton');
    const optimaClear = document.getElementById('clearOptimaSearchButton');
    const optimaResults = document.getElementById('results-optima-search');

    optimaButton.addEventListener('click', async () => {
        const txt = optimaInput.value.trim();
        if (!txt) return showToast('Ingrese uno o varios códigos separados por coma', 'warning');
        
        optimaButton.disabled = true;
        optimaButton.textContent = "Buscando...";
        optimaResults.innerHTML = '<p>Buscando...</p>';

        try {
            const resultado = await buscarOptimaAvanzada(txt);
            if (resultado.documentos?.length) {
                optimaResults.innerHTML = resultado.documentos.map(d => {
                    const doc = d.documento;
                    const codes = d.codigos_cubre;
                    const codesJson = JSON.stringify(codes); // Prepara los códigos para el onclick

                    const verPdfBtn = doc.path ? `<a class="btn btn-primary" href="uploads/${doc.path}" target="_blank">Ver PDF</a>` : '';
                    const resaltarPdfBtn = doc.path ? `<button class="btn btn-secondary" onclick="solicitarPdfResaltado(this, '${doc.path}', ${codesJson})">PDF Resaltado</button>` : '';

                    return `
                        <div class="doc-item" style="justify-content: space-between; align-items: center;">
                            <div>
                                <p><strong>Documento:</strong> ${doc.name}</p>
                                <p class="mt-1"><strong>Códigos cubiertos:</strong> ${codes.join(', ')}</p>
                            </div>
                            <div class="flex items-center gap-2 mt-2 md:mt-0">
                                ${verPdfBtn}
                                ${resaltarPdfBtn}
                            </div>
                        </div>`;
                }).join('') + (resultado.codigos_faltantes?.length ? `<p class="mt-4 text-red-600">Códigos no encontrados: ${resultado.codigos_faltantes.join(', ')}</p>` : '');
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
    });

    optimaClear.addEventListener('click', () => {
        optimaInput.value = '';
        optimaResults.innerHTML = '';
    });
    // === FIN DE BÚSQUEDA ÓPTIMA ===

    // === BÚSQUEDA POR CÓDIGO ===
    // ... El resto del archivo se mantiene sin cambios ...
    const codeInput = document.getElementById('codeInput');
    const codeSearchButton = document.getElementById('doCodeSearchButton');
    const codeResults = document.getElementById('results-code');
    // ...
  });

  initUploadForm();
  initAutocompleteCodigo();
});

// ... (El resto de funciones como bindCodeButtons, renderBuscarCodigoResults, etc., se mantienen sin cambios)
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

function renderBuscarCodigoResults(docs) {
    // ...
}