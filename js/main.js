import { buscarOptimaAvanzada, buscarPorCodigo, sugerirCodigos, listarDocumentos } from './api.js';
import { cargarConsulta } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

// Switch visible tab. Takes an id and toggles classes accordingly.
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

  // Wire up tab buttons to switch tabs
  document.querySelectorAll('.tab').forEach(btn =>
    btn.addEventListener('click', () => window.showTab(btn.dataset.tab))
  );

  // Once authenticated, reveal the main UI and set up handlers
  requireAuth(() => {
    document.getElementById('loginOverlay')?.classList.add('hidden');
    main?.classList.remove('hidden');

    // Show default tab and load consultation list
    window.showTab('tab-search');
    cargarConsulta();

    // === BÚSQUEDA ÓPTIMA ===
    const optimaInput = document.getElementById('optimaSearchInput');
    const optimaButton = document.getElementById('doOptimaSearchButton');
    const optimaClear = document.getElementById('clearOptimaSearchButton');
    const optimaResults = document.getElementById('results-optima-search');

    optimaButton.addEventListener('click', async () => {
      const txt = optimaInput.value.trim();
      if (!txt) return showToast('Ingrese uno o varios códigos separados por coma', 'warning');
      try {
        const resultado = await buscarOptimaAvanzada(txt);
        if (resultado.documentos?.length) {
          optimaResults.innerHTML =
            resultado.documentos
              .map(d => {
                const documento = d.documento;
                const codigos = d.codigos_cubre;
                // Resaltar el enlace de PDF como un botón
                const pdf = documento.path
                  ? `<a class="btn btn--primary" href="${documento.path}" target="_blank">Ver PDF</a>`
                  : 'Sin PDF';
                return `
                  <div class="doc-item">
                    <p><strong>Documento:</strong> ${documento.name}</p>
                    <p><strong>Códigos cubiertos:</strong> ${codigos.join(', ')}</p>
                    <p><strong>PDF:</strong> ${pdf}</p>
                  </div>
                `;
              })
              .join('') +
            (resultado.codigos_faltantes?.length
              ? `<p>Códigos no encontrados: ${resultado.codigos_faltantes.join(', ')}</p>`
              : '');
        } else {
          optimaResults.innerHTML = 'No halló resultados.';
        }
      } catch {
        showToast('Error búsqueda', 'error');
      }
    });

    optimaClear.addEventListener('click', () => {
      optimaInput.value = '';
      optimaResults.innerHTML = '';
    });

    // === BÚSQUEDA POR CÓDIGO ===
    const codeInput = document.getElementById('codeInput');
    const codeSearchButton = document.getElementById('doCodeSearchButton');
    const codeResults = document.getElementById('results-code');

    codeSearchButton.addEventListener('click', async () => {
      const c = codeInput.value.trim();
      if (!c) return showToast('Ingrese código', 'warning');
      try {
        const resp = await buscarPorCodigo(c);
        // Determinar dónde se encuentra el array de documentos. Algunos backend
        // devuelven un objeto con propiedad "documentos" o "docs". Si resp es
        // ya un array, úsalo directamente. De lo contrario, busca dentro de
        // posibles campos. Finalmente, asegúrate de que sea un array.
        let docsArray;
        if (Array.isArray(resp)) {
          docsArray = resp;
        } else if (resp && Array.isArray(resp.documentos)) {
          docsArray = resp.documentos;
        } else if (resp && Array.isArray(resp.docs)) {
          docsArray = resp.docs;
        } else if (resp && Array.isArray(resp.results)) {
          docsArray = resp.results;
        } else {
          docsArray = [];
        }
        if (Array.isArray(docsArray) && docsArray.length) {
          // Comprobar si los documentos tienen algún campo de códigos. Si no, obtén los códigos
          // completos de la API de listar documentos y fusiónalos. Esto sirve como fallback
          // cuando el backend no devuelve codigos_extraidos en /search.
          const docsWithCodes = await (async () => {
            // Función para determinar si un documento ya tiene códigos (cualquier campo posible)
            const hasCodes = doc => {
              const fields = ['codigos_extraidos', 'codigos', 'codes', 'codigo', 'codigos_cubre', 'codigosAsignados'];
              return fields.some(f => doc && doc[f]);
            };
            // Si al menos un doc tiene códigos ya, simplemente devuelve docsArray
            if (docsArray.some(hasCodes)) {
              return docsArray;
            }
            // De lo contrario, obtener la lista completa de documentos para mapear códigos
            try {
              const allDocs = await listarDocumentos();
              return docsArray.map(d => {
                const match = Array.isArray(allDocs)
                  ? allDocs.find(item => String(item.id) === String(d.id))
                  : null;
                return match ? { ...d, ...match } : d;
              });
            } catch (e) {
              // Si falla la llamada, simplemente retorna los docs sin códigos
              return docsArray;
            }
          })();
          codeResults.innerHTML = renderBuscarCodigoResults(docsWithCodes);
          bindCodeButtons(codeResults);
        } else {
          codeResults.innerHTML = 'No encontrado.';
        }
      } catch {
        showToast('Error búsqueda por código', 'error');
      }
    });

    // Delegación de eventos para mostrar/ocultar lista de códigos
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-ver-codigos');
      if (btn && btn.dataset.codesId) {
        const el = document.getElementById('codes-list-' + btn.dataset.codesId);
        if (el) {
          el.classList.remove('hidden');
          el.style.display = el.style.display === 'block' ? 'none' : 'block';
        }
      }
    });
  });

  // Inicializa formulario de subida y autocompletado
  initUploadForm();
  initAutocompleteCodigo();
});

/**
 * Adjunta listeners individuales a todos los botones "Ver Códigos" dentro de un contenedor.
 * Esta función se invoca después de renderizar los resultados de búsqueda para asegurar
 * que cada botón togglee correctamente su lista asociada.
 * @param {HTMLElement} container - El contenedor que contiene los resultados y los botones.
 */
function bindCodeButtons(container) {
  if (!container) return;
  const buttons = container.querySelectorAll('.btn-ver-codigos');
  buttons.forEach(btn => {
    const codesId = btn.dataset.codesId;
    btn.addEventListener('click', e => {
      e.preventDefault();
      const el = document.getElementById('codes-list-' + codesId);
      if (el) {
        el.classList.remove('hidden');
        el.style.display = el.style.display === 'block' ? 'none' : 'block';
      }
    });
  });
}

/**
 * Renderiza un array de documentos devueltos por la búsqueda por código.
 * Cada documento incluye un botón "Ver Códigos" y una lista de códigos
 * en columna dentro de un contenedor oculto. El enlace al PDF se muestra
 * como un botón destacado.
 * @param {Array} docs - Lista de objetos de documento.
 * @returns {string} HTML para insertar en el contenedor de resultados.
 */
function renderBuscarCodigoResults(docs) {
  /**
   * Obtiene un array de códigos a partir del objeto documento.
   * Intenta detectar el nombre del campo y el tipo de dato para ser
   * robusto ante distintas implementaciones del backend. Se aceptan
   * strings con diferentes separadores (coma, punto y coma, espacio) o
   * arrays de cadenas.
   * @param {any} doc
   * @returns {string[]} array de códigos limpios
   */
  function getCodesArray(doc) {
  // Posibles nombres de propiedad donde el backend envía los códigos
    const possibleFields = [
      'codigos_extraidos',
      'codigos',
      'codes',
      'codigo',
      'codigos_cubre',
      'codigosAsignados',
    ];
    // Encuentra el primer campo que exista en el objeto
    let value;
    for (const field of possibleFields) {
      if (doc && Object.prototype.hasOwnProperty.call(doc, field)) {
        value = doc[field];
        break;
      }
    }
    if (!value) return [];
    // Si ya es un array, devuélvelo tal cual (filtrando falsy)
    if (Array.isArray(value)) {
      return value.map(v => String(v).trim()).filter(Boolean);
    }
    // Si es una cadena, dividirla por coma, punto y coma o espacios consecutivos
    if (typeof value === 'string') {
      return value
        .split(/[;,\s]+/)
        .map(s => s.trim())
        .filter(Boolean);
    }
    // En cualquier otro caso, devolver vacío
    return [];
  }

  return docs
    .map(doc => {
      const fecha = doc.date ? new Date(doc.date).toLocaleDateString('es-ES') : '';
      const codesArr = getCodesArray(doc);
      // Generar id para asociar el botón y la lista; si doc.id no existe, usar un hash aleatorio
      const codesId = doc.id || Math.random().toString(36).slice(2);
      // Construir la lista de códigos como columna oculta
      const codesListHtml = codesArr.length
        ? `<div id="codes-list-${codesId}" class="codes-list hidden">${codesArr
            .map(code => `<div class="code-item">${code}</div>`)
            .join('')}</div>`
        : `<div id="codes-list-${codesId}" class="codes-list hidden"><span>Sin códigos.</span></div>`;
      // Resaltar Ver PDF como botón
      const pdfButton = doc.path
        ? `<a class="btn btn--primary" href="${doc.path}" target="_blank">Ver PDF</a>`
        : 'Sin PDF';
      return `
        <div class="doc-item">
          <p><strong>${doc.name}</strong></p>
          <p>${fecha}</p>
          <p>${pdfButton}</p>
          <button class="btn-ver-codigos" data-codes-id="${codesId}">Ver Códigos</button>
          ${codesListHtml}
        </div>
      `;
    })
    .join('');
}
