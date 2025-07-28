// js/main.js

import { buscarOptima, buscarPorCodigo } from './api.js';
import { cargarConsulta } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

/** Función global para cambiar pestañas */
window.showTab = tabId => {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  const sec = document.getElementById(tabId);
  if (sec) sec.classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(btn =>
    btn.dataset.tab === tabId
      ? btn.classList.add('active')
      : btn.classList.remove('active')
  );
};

document.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.getElementById('mainContent');
  if (mainContent) mainContent.classList.add('hidden');

  // Bind de pestañas
  document.querySelectorAll('.tab').forEach(btn =>
    btn.addEventListener('click', () => window.showTab(btn.dataset.tab))
  );

  // Autenticación
  requireAuth(() => {
    document.getElementById('loginOverlay')?.classList.add('hidden');
    mainContent?.classList.remove('hidden');

    // Pestaña inicial y carga de lista
    window.showTab('tab-search');
    cargarConsulta();

    // ==== BÚSQUEDA ÓPTIMA ====
    const txtArea = document.getElementById('optimaSearchInput');
    const btnOpt   = document.getElementById('doOptimaSearchButton');
    const btnClear = document.getElementById('clearOptimaSearchButton');
    const resultsO = document.getElementById('results-optima-search');

    if (btnOpt && txtArea && resultsO) {
      btnOpt.addEventListener('click', async () => {
        const txt = txtArea.value.trim();
        if (!txt) return showToast('Ingrese texto para buscar', 'warning');
        try {
          const res = await buscarOptima(txt);
          resultsO.innerHTML = res
            .map(d => `<div class="border p-2">${d.nombre || d.name} – ${d.codigo}</div>`)
            .join('') || '<p>No se encontraron resultados.</p>';
        } catch (e) {
          console.error(e);
          showToast('Error en la búsqueda', 'error');
        }
      });
    }
    if (btnClear && txtArea && resultsO) {
      btnClear.addEventListener('click', () => {
        txtArea.value = '';
        resultsO.innerHTML = '';
      });
    }

    // ==== BÚSQUEDA POR CÓDIGO ====
    const codeIn = document.getElementById('codeInput');
    const btnCode = document.getElementById('doCodeSearchButton');
    const resultsC= document.getElementById('results-code');

    if (btnCode && codeIn && resultsC) {
      btnCode.addEventListener('click', async () => {
        const code = codeIn.value.trim();
        if (!code) return showToast('Ingrese un código', 'warning');
        try {
          const res = await buscarPorCodigo(code);
          resultsC.innerHTML = res.length
            ? res.map(d => `<div class="border p-2">${d.nombre || d.name} – ${d.codigo}</div>`).join('')
            : '<p>No se encontró.</p>';
        } catch (e) {
          console.error(e);
          showToast('Error en búsqueda por código', 'error');
        }
      });
    }
  });

  // Formularios de subida y autocomplete (ocultos hasta login)
  initUploadForm();
  initAutocompleteCodigo();
});
