import { buscarOptimaAvanzada, buscarPorCodigo, sugerirCodigos, listarDocumentos } from './api.js';
import { cargarConsulta } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

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

    window.showTab('tab-search');
    cargarConsulta();

    // === BÚSQUEDA ÓPTIMA ===
    const area = document.getElementById('optimaSearchInput');
    const btnO = document.getElementById('doOptimaSearchButton');
    const clrO = document.getElementById('clearOptimaSearchButton');
    const outO = document.getElementById('results-optima-search');

    btnO.addEventListener('click', async () => {
      const txt = area.value.trim();
      if (!txt) return showToast('Ingrese uno o varios códigos separados por coma', 'warning');
      try {
        const resultado = await buscarOptimaAvanzada(txt);
        if (resultado.documentos?.length) {
          outO.innerHTML = resultado.documentos.map(d =>
            `<div class="border rounded p-3 mb-3 bg-white">
               <div class="font-semibold text-green-700">Documento: ${d.documento.name}</div>
               <div><b>Códigos cubiertos:</b> <span class="text-green-800">${d.codigos_cubre.join(', ')}</span></div>
               <div><b>PDF:</b> ${
                 d.documento.path
                   ? `<a href="uploads/${d.documento.path}" target="_blank" class="text-blue-600 underline">${d.documento.path}</a>`
                   : '<span class="text-gray-400">Sin PDF</span>'
               }</div>
             </div>`
          ).join('') +
          (resultado.codigos_faltantes?.length
            ? `<div style="color:red; font-weight:bold">Códigos no encontrados: ${resultado.codigos_faltantes.join(', ')}</div>`
            : '');
        } else {
          outO.innerHTML = '<p>No halló resultados.</p>';
        }
      } catch {
        showToast('Error búsqueda', 'error');
      }
    });

    clrO.addEventListener('click', () => { area.value = ''; outO.innerHTML = ''; });

    // === BÚSQUEDA POR CÓDIGO ===
    const inputC = document.getElementById('codeInput');
    const btnC = document.getElementById('doCodeSearchButton');
    const outC = document.getElementById('results-code');

    btnC.addEventListener('click', async () => {
      const c = inputC.value.trim();
      if (!c) return showToast('Ingrese código', 'warning');
      try {
        const docs = await buscarPorCodigo(c);
        outC.innerHTML = docs.length
          ? docs.map(d => {
              const fecha = d.date ? new Date(d.date).toLocaleDateString('es-ES') : '';
              const codesArr = (d.codigos_extraidos || '').split(',').map(s => s.trim()).filter(Boolean);
              const codesList = codesArr.length
                ? `<ul class="codes-list mt-2 ml-4 list-disc list-inside" id="codes-list-${d.id}" style="display:none;">
                    ${codesArr.map(code => `<li>${code}</li>`).join('')}
                  </ul>`
                : `<p class="mt-2 italic" id="codes-list-${d.id}" style="display:none;">Sin códigos.</p>`;

              const pdfLink = d.path
                ? `<a href="uploads/${d.path}" target="_blank" class="text-blue-600 underline">${d.path}</a>`
                : '<span class="text-gray-400">Sin PDF</span>';

              return `
                <div class="border rounded p-3 mb-3 bg-white">
                  <div class="font-semibold text-green-700">${d.name}</div>
                  <div class="text-sm text-gray-600">${fecha}</div>
                  <div class="mb-1">${pdfLink}</div>
                  <button class="btn btn-small btn-secondary mb-1 btn-ver-codigos" data-codes-id="${d.id}">Ver Códigos</button>
                  ${codesList}
                </div>
              `;
            }).join('')
          : '<p>No encontrado.</p>';
      } catch {
        showToast('Error búsqueda por código', 'error');
      }
    });

    // Delegación de eventos para mostrar/ocultar lista de códigos
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn-ver-codigos');
      if (btn && btn.dataset.codesId) {
        const el = document.getElementById('codes-list-' + btn.dataset.codesId);
        if (el) {
          el.classList.remove('hidden');
          el.style.display = (el.style.display === 'none' || !el.style.display) ? 'block' : 'none';
        }
      }
    });

  });

  initUploadForm();
  initAutocompleteCodigo();
});
