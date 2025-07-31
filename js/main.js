// js/main.js

import { listarDocumentos } from './api.js';
import { cargarConsulta } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

function renderBuscarCodigoResults(docs) {
    return docs.map(doc => {
        if (!doc || !doc.id) { return ''; }
        const fecha = doc.date ? new Date(doc.date).toLocaleDateString('es-ES') : '';
        const codesArray = (doc.codigos_extraidos || '').split(',').map(s => s.trim()).filter(Boolean);
        const codesId = doc.id;
        
        const codesListHtml = codesArray.length
            ? `<div id="codes-list-${codesId}" class="codes-list" style="display: none;">${codesArray.map(code => `<div class="code-item">${code}</div>`).join('')}</div>`
            : `<div id="codes-list-${codesId}" class="codes-list" style="display: none;"><span>Sin códigos asignados.</span></div>`;
        
        const pdfButton = doc.path ? `<a class="btn btn--primary btn-small" href="uploads/${doc.path}" target="_blank">Ver PDF</a>` : '<span>Sin PDF</span>';

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

// --- LÓGICA PRINCIPAL ---

window.toggleCodeVisibility = (codesId) => {
    if (!codesId) return;
    const codesList = document.getElementById(`codes-list-${codesId}`);
    if (codesList) {
        // Solución final: se manipula el estilo directamente para forzar la visibilidad.
        const isVisible = codesList.style.display === 'block';
        codesList.style.display = isVisible ? 'none' : 'block';
    }
};

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
    window.showTab('tab-list');
    cargarConsulta();

    const codeInput = document.getElementById('codeInput');
    const codeSearchButton = document.getElementById('doCodeSearchButton');
    const codeResults = document.getElementById('results-code');

    codeSearchButton.addEventListener('click', async () => {
      const c = codeInput.value.trim();
      if (!c) return showToast('Ingrese un código para buscar', 'warning');
      try {
        const allDocsRaw = await listarDocumentos();
        const allDocs = Array.isArray(allDocsRaw) ? allDocsRaw : [];
        const searchCode = c.toUpperCase();
        const matchedDocs = allDocs.filter(doc => {
          const codes = (doc.codigos_extraidos || '').split(',').map(str => str.trim().toUpperCase());
          return codes.some(code => code.includes(searchCode));
        });

        if (matchedDocs.length) {
          codeResults.innerHTML = renderBuscarCodigoResults(matchedDocs);
        } else {
          codeResults.innerHTML = '<p>No se encontraron documentos con ese código.</p>';
        }
      } catch (err) {
        showToast('Error en la búsqueda por código', 'error');
      }
    });
  });

  initUploadForm();
  initAutocompleteCodigo();
});