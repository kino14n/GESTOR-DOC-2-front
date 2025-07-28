// js/main.js

import { listarDocumentos } from './api.js';
import { buscarOptima } from './api.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

/** Navegación entre pestañas */
window.showTab = tabId => {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  document.getElementById(tabId)?.classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(btn =>
    btn.dataset.tab === tabId
      ? btn.classList.add('active')
      : btn.classList.remove('active')
  );
};

document.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.getElementById('mainContent');
  mainContent?.classList.add('hidden');

  // Bind pestañas
  document.querySelectorAll('.tab').forEach(btn =>
    btn.addEventListener('click', () => window.showTab(btn.dataset.tab))
  );

  // Login y arranque de la app
  requireAuth(() => {
    document.getElementById('loginOverlay')?.classList.add('hidden');
    mainContent?.classList.remove('hidden');

    // Carga inicial de consulta
    window.showTab('tab-search');
    listarDocumentos().then(docs => {
      document.getElementById('results-list').innerHTML =
        docs.map(d => `<div>${d.name} – ${d.codigos_extraidos}</div>`).join('');
    });

    // BÚSQUEDA ÓPTIMA
    const txtArea = document.getElementById('optimaSearchInput');
    const btnOpt  = document.getElementById('doOptimaSearchButton');
    const btnClr  = document.getElementById('clearOptimaSearchButton');
    const resOpt  = document.getElementById('results-optima-search');

    btnOpt?.addEventListener('click', async () => {
      const txt = txtArea.value.trim();
      if (!txt) return showToast('Ingrese texto para buscar', 'warning');
      try {
        const docs = await buscarOptima(txt);
        resOpt.innerHTML = docs.length
          ? docs.map(d => `<div>${d.name} – ${d.codigos_extraidos}</div>`).join('')
          : '<p>No se encontraron resultados.</p>';
      } catch {
        showToast('Error en búsqueda óptima', 'error');
      }
    });
    btnClr?.addEventListener('click', () => {
      txtArea.value = '';
      resOpt.innerHTML = '';
    });

    // BUSCAR POR CÓDIGO (documentos)
    const codeIn = document.getElementById('codeInput');
    const btnCode= document.getElementById('doCodeSearchButton');
    const resCod = document.getElementById('results-code');

    btnCode?.addEventListener('click', async () => {
      const code = codeIn.value.trim();
      if (!code) return showToast('Ingrese un código', 'warning');
      try {
        const docs = await buscarOptima(code);
        resCod.innerHTML = docs.length
          ? docs.map(d => `<div>${d.name} – ${d.codigos_extraidos}</div>`).join('')
          : '<p>No se encontró.</p>';
      } catch {
        showToast('Error en búsqueda por código', 'error');
      }
    });
  });

  // Upload y autocomplete (ocultos hasta login)
  initUploadForm();
  initAutocompleteCodigo();
});
