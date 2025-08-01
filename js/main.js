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
                  ? `<a class="btn btn--primary" href="uploads/${documento.path}" target="_blank">Ver PDF</a>`
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

    /**
     * Extrae un array de códigos de un documento. Esta función replica la lógica
     * de renderBuscarCodigoResults para detectar los posibles campos de
     * códigos y normalizar el valor a un array de strings. Se exporta aquí
     * porque se utiliza tanto para filtrar resultados como para mostrarlos.
     *
     * @param {any} doc
     * @returns {string[]} array de códigos limpios
     */
    function extractCodes(doc) {
      const possibleFields = [
        'codigos_extraidos',
        'codigos',
        'codes',
        'codigo',
        'codigos_cubre',
        'codigosAsignados'
      ];
      let value;
      for (const field of possibleFields) {
        if (doc && Object.prototype.hasOwnProperty.call(doc, field)) {
          value = doc[field];
          break;
        }
      }
      if (!value) return [];
      if (Array.isArray(value)) {
        return value.map(v => String(v).trim()).filter(Boolean);
      }
      if (typeof value === 'string') {
        return value
          .split(/[;,\s]+/)
          .map(s => s.trim())
          .filter(Boolean);
      }
      return [];
    }

    codeSearchButton.addEventListener('click', async () => {
      const c = codeInput.value.trim();
      if (!c) return showToast('Ingrese código', 'warning');
      try {
        // En lugar de depender de que el backend devuelva los códigos en la respuesta
        // del endpoint /search, obtenemos la lista completa de documentos y filtramos
        // los que contengan el código buscado. Esto garantiza que siempre tendremos
        // acceso al campo codigos_extraidos (o equivalente) para mostrar la lista.
        const allDocsRaw = await listarDocumentos();
        // Determinar dónde está el array de documentos (puede venir como array plano
        // o dentro de propiedades tipo "documentos" o "docs")
        let allDocs;
        if (Array.isArray(allDocsRaw)) {
          allDocs = allDocsRaw;
        } else if (allDocsRaw && Array.isArray(allDocsRaw.documentos)) {
          allDocs = allDocsRaw.documentos;
        } else if (allDocsRaw && Array.isArray(allDocsRaw.docs)) {
          allDocs = allDocsRaw.docs;
        } else {
          allDocs = [];
        }
        // Normalizar el código buscado para comparaciones sin distinguir mayúsculas
        const searchCode = c.toUpperCase();
        // Filtrar documentos cuyo listado de códigos contenga el código buscado
        const matchedDocs = allDocs.filter(doc => {
          const codes = extractCodes(doc).map(str => str.toUpperCase());
          return codes.some(code => code === searchCode || code.includes(searchCode));
        });
        if (matchedDocs.length) {
          codeResults.innerHTML = renderBuscarCodigoResults(matchedDocs);
          bindCodeButtons(codeResults);
        } else {
          codeResults.innerHTML = 'No encontrado.';
        }
      } catch (err) {
        console.error(err);
        showToast('Error búsqueda por código', 'error');
      }
    });

        // No usamos delegación global aquí porque cada pestaña maneja sus propios
        // botones con bindCodeButtons.
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
export function bindCodeButtons(container) {
  if (!container) return;
  const buttons = container.querySelectorAll('.btn-ver-codigos');
  buttons.forEach(btn => {
    const codesId = btn.dataset.codesId;
    btn.addEventListener('click', e => {
      e.preventDefault();
      const el = document.getElementById('codes-list-' + codesId);
      if (el) {
        // Alternar entre oculto y visible ajustando el estilo display.
        el.style.display = el.style.display === 'none' || !el.style.display ? 'block' : 'none';
      }
    });
  });
}

// Exponer la función bindCodeButtons en el ámbito global para que otros módulos (como
// consulta.js) puedan llamarla sin crear una dependencia circular entre módulos.
// Esto permite que la pestaña de consulta adjunte eventos a sus botones "Ver Códigos".
window.bindCodeButtons = bindCodeButtons;

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
      // Usar style="display: none;" en lugar de la clase .hidden para evitar que
      // reglas CSS globales con !important impidan mostrar la lista
      const codesListHtml = codesArr.length
        ? `<div id="codes-list-${codesId}" class="codes-list" style="display: none;">${codesArr
            .map(code => `<div class="code-item">${code}</div>`)
            .join('')}</div>`
        : `<div id="codes-list-${codesId}" class="codes-list" style="display: none;"><span>Sin códigos.</span></div>`;
      // Resaltar Ver PDF como botón
      const pdfButton = doc.path
        ? `<a class="btn btn--primary" href="uploads/${doc.path}" target="_blank">Ver PDF</a>`
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