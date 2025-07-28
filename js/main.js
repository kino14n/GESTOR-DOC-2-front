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

    // Búsqueda Óptima
    document.getElementById('doOptimaSearchButton')?.addEventListener('click', async () => {
      const txt = document.getElementById('optimaInput').value.trim();
      if (!txt) return showToast('Ingrese texto para buscar', 'warning');
      const res = await buscarOptima(txt);
      document.getElementById('results-search').innerHTML =
        res.map(d => `<div>${d.name || d.nombre} – ${d.codigo}</div>`).join('');
    });

    // Búsqueda por Código
    document.getElementById('doCodeSearchButton')?.addEventListener('click', async () => {
      const code = document.getElementById('codeInput').value.trim();
      if (!code) return showToast('Ingrese un código', 'warning');
      const res = await buscarPorCodigo(code);
      document.getElementById('results-code').innerHTML =
        res.length
          ? res.map(d => `<div>${d.name || d.nombre} – ${d.codigo}</div>`).join('')
          : '<p>No se encontró.</p>';
    });
  });

  // Formulario de subida y autocomplete (se esconden hasta login)
  initUploadForm();
  initAutocompleteCodigo();
});
