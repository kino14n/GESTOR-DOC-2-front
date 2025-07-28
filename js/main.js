// js/main.js

import { buscarOptima, buscarPorCodigo, sugerirCodigos } from './api.js';
import { cargarConsulta } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

window.showTab = tabId => {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  document.getElementById(tabId)?.classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(btn =>
    btn.dataset.tab===tabId?btn.classList.add('active'):btn.classList.remove('active')
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

    // Consulta inicial
    window.showTab('tab-search');
    cargarConsulta();

    // Búsqueda Óptima
    const area = document.getElementById('optimaSearchInput');
    const btnO = document.getElementById('doOptimaSearchButton');
    const clrO = document.getElementById('clearOptimaSearchButton');
    const outO = document.getElementById('results-optima-search');

    btnO.addEventListener('click', async () => {
      const txt = area.value.trim();
      if (!txt) return showToast('Ingrese algo', 'warning');
      try {
        const docs = await buscarOptima(txt);
        outO.innerHTML = docs.length
          ? docs.map(d => `<p style="color:green;font-weight:bold">${d.name} — ${d.codigos_extraidos}</p>`).join('')
          : '<p>No halló resultados.</p>';
      } catch {
        showToast('Error búsqueda', 'error');
      }
    });
    clrO.addEventListener('click', ()=>{ area.value=''; outO.innerHTML=''; });

    // Búsqueda por Código
    const inputC = document.getElementById('codeInput');
    const btnC   = document.getElementById('doCodeSearchButton');
    const outC   = document.getElementById('results-code');

    btnC.addEventListener('click', async () => {
      const c = inputC.value.trim();
      if (!c) return showToast('Ingrese código', 'warning');
      try {
        const docs = await buscarPorCodigo(c);
        outC.innerHTML = docs.length
          ? docs.map(d => `<p>${d.name} — ${d.codigos_extraidos}</p>`).join('')
          : '<p>No encontrado.</p>';
      } catch {
        showToast('Error búsqueda por código', 'error');
      }
    });

  });

  initUploadForm();
  initAutocompleteCodigo();
});
