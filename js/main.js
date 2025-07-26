import { cargarConsulta, clearConsultFilter, doConsultFilter, downloadCsv, downloadPdfs, editarDoc, eliminarDoc } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

const API_BASE = 'https://gestor-doc-backend-production.up.railway.app/api/documentos';

// Función global para cambiar de pestaña
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      window.showTab(button.dataset.tab);
    });
  });

  initUploadForm();
  initAutocompleteCodigo();

  const mainContent = document.getElementById('mainContent');
  if (mainContent) mainContent.classList.add('hidden');

  requireAuth(() => {
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) loginOverlay.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');

    window.showTab('tab-search');
    cargarConsulta();
  });

  // Pestaña Buscar Óptima
  const doOptimaSearchButton = document.getElementById('doOptimaSearchButton');
  const clearOptimaSearchButton = document.getElementById('clearOptimaSearchButton');
  const optimaSearchInput = document.getElementById('optimaSearchInput');
  const optimaResultsList = document.getElementById('results-optima-search');

  if (doOptimaSearchButton) {
    doOptimaSearchButton.addEventListener('click', async () => {
      // Extraer primera columna de cada línea
      const raw = optimaSearchInput.value;
      const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l);
      const codesArray = lines.map(l => l.split(/\s+/)[0]);
      const codigos = codesArray.join(',');

      if (!codigos) {
        optimaResultsList.innerHTML = '<p class="text-red-500">Por favor, ingrese al menos un código para la búsqueda.</p>';
        return;
      }

      optimaResultsList.innerHTML = '<p>Buscando documentos óptimos...</p>';
      try {
        const res = await fetch(`${API_BASE}/search_optima`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ codigos })
        });
        if (!res.ok) {
          const err = await res.json();
          optimaResultsList.innerHTML = `<p class="text-red-500">Error: ${err.error || res.statusText}</p>`;
          return;
        }
        const data = await res.json();
        if (data.documentos && data.documentos.length > 0) {
          let html = `<p class="font-bold mb-2">Se encontraron ${data.documentos.length} documentos:</p>`;
          html += data.documentos.map(item => `
            <div class="border rounded p-4 mb-2 bg-white shadow-sm">
              <h3 class="font-semibold">${item.documento.name}</h3>
              <p><b>Fecha:</b> ${item.documento.date || ''}</p>
              <p>PDF: ${item.documento.path ? `<a href="uploads/${item.documento.path}" target="_blank">${item.documento.path}</a>` : 'N/A'}</p>
            </div>
          `).join('');
          optimaResultsList.innerHTML = html;
        } else {
          optimaResultsList.innerHTML = '<p>No se encontraron documentos que cumplan con la búsqueda.</p>';
        }
      } catch (e) {
        console.error('Error búsqueda óptima:', e);
        optimaResultsList.innerHTML = '<p class="text-red-500">Error al buscar documentos.</p>';
      }
    });

    clearOptimaSearchButton.addEventListener('click', () => {
      optimaSearchInput.value = '';
      optimaResultsList.innerHTML = '';
    });
  }

  // Pestaña Buscar por Código
  const doCodeSearchButton = document.getElementById('doCodeSearchButton');
  const clearCodeSearchButton = document.getElementById('clearCodeSearchButton');

  if (doCodeSearchButton) {
    doCodeSearchButton.addEventListener('click', async () => {
      const input = document.getElementById('codeInput');
      const code = input.value.trim();
      const resultsDiv = document.getElementById('results-code');
      resultsDiv.innerHTML = '';
      if (!code) {
        resultsDiv.innerHTML = '<p>Escribe un código para buscar.</p>';
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/search_by_code`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ codigo: code })
        });
        const docs = await res.json();
        if (docs.length === 0) {
          resultsDiv.innerHTML = '<p>No se encontró ningún documento con ese código.</p>';
          return;
        }
        resultsDiv.innerHTML = docs.map(doc => `
          <div class="border p-4 rounded shadow">
            <h3 class="font-semibold">${doc.name}</h3>
            <p><b>Fecha:</b> ${doc.date || ''}</p>
            <p><b>Códigos:</b> ${doc.codigos_extraidos || ''}</p>
            <p><b>PDF:</b> ${doc.path ? `<a href="uploads/${doc.path}" target="_blank" class="text-blue-600 underline">${doc.path}</a>` : ''}</p>
          </div>
        `).join('');
      } catch (e) {
        console.error('Error búsqueda por código:', e);
        resultsDiv.innerHTML = '<p>Error en la búsqueda por código.</p>';
      }
    });
    clearCodeSearchButton.addEventListener('click', () => {
      document.getElementById('codeInput').value = '';
      document.getElementById('results-code').innerHTML = '';
    });
  }
});

// Función global
window.showTab = function(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
};
