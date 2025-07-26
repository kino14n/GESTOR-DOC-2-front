import { cargarConsulta, clearConsultFilter, doConsultFilter, downloadCsv, downloadPdfs, editarDoc, eliminarDoc } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

const API_BASE = 'https://gestor-doc-backend-production.up.railway.app/api/documentos';

// Función global para cambiar de pestaña
document.addEventListener('DOMContentLoaded', () => {
  initUploadForm();
  initAutocompleteCodigo();
  requireAuth(() => {
    window.showTab('tab-search');
    cargarConsulta();
  });

  // Lógica para la Pestaña "Buscar"
  const doOptimaSearchButton = document.getElementById('doOptimaSearchButton');
  const optimaSearchInput = document.getElementById('optimaSearchInput');
  const optimaResultsList = document.getElementById('results-optima-search');

  if (doOptimaSearchButton) {
    doOptimaSearchButton.addEventListener('click', async () => {
      // PREPROCESAR BLOQUE DE TEXTO: tomar primera "columna" de cada línea
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
          const errorData = await res.json();
          optimaResultsList.innerHTML = `<p class="text-red-500">Error en la búsqueda: ${errorData.error || res.statusText}</p>`;
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
        console.error('Error en la búsqueda óptima:', e);
        optimaResultsList.innerHTML = '<p class="text-red-500">Ocurrió un error al intentar la búsqueda óptima.</p>';
      }
    });
  }
});

// Función para cambiar pestañas (global)
window.showTab = function(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
};
