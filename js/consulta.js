// js/consulta.js

import { listarDocumentos, eliminarDocumento, obtenerDocumento } from './api.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';
import { bindCodeButtons } from './main.js';
import { tenantConfig } from './tenant_config.js';

// Contiene la lista actual de documentos para filtros o recargas
let currentDocs = [];

/**
 * Carga y muestra los documentos en #results-list.
 */
export async function cargarConsulta() {
  try {
    currentDocs = await listarDocumentos();
    renderDocs(currentDocs);
    // Vincular los eventos de los botones "Ver Códigos" después de renderizar
    const listEl = document.getElementById('results-list');
    if (listEl) bindCodeButtons(listEl);
  } catch (e) {
    console.error('Error al cargar documentos:', e);
    showToast('Error al cargar lista', 'error');
  }
}

/**
 * Renderiza documentos con la información a la izquierda y las acciones a la derecha.
 */
function renderDocs(docs) {
  const container = document.getElementById('results-list');
  if (!container) return;
  container.innerHTML = docs
    .map(d => {
      // Formatea la fecha o muestra un texto por defecto
      const fecha = d.date ? new Date(d.date).toISOString().split('T')[0] : 'Sin fecha';
      const codesArray = (d.codigos_extraidos || '').split(',').map(s => s.trim()).filter(Boolean);
      const codesId = `codes-list-${d.id || Math.random().toString(36).slice(2)}`;

      // Genera la lista de códigos (oculta inicialmente)
      const codesListHtml = `<div id="${codesId}" class="codes-list hidden">${
        codesArray.length > 0
          ? codesArray.map(c => `<div class="code-item">${c}</div>`).join('')
          : '<span>Sin códigos.</span>'
      }</div>`;

      // Genera el enlace para ver el PDF usando la URL de R2
      const pdfLink = d.path ? `<a href="${tenantConfig.r2PublicUrl}/${d.path}" target="_blank" class="text-blue-600 hover:underline">Ver PDF</a>` : 'Sin PDF';

      return `
        <div class="doc-item">
          <div class="doc-item-info">
            <p class="font-bold text-lg">${d.name}</p>
            <p class="text-sm text-gray-600 mt-1">${fecha}</p>
            <p class="text-xs text-gray-500 mt-1">Archivo PDF: ${d.path || 'No disponible'}</p>
            <p class="text-sm mt-2">${pdfLink}</p>
          </div>
          <div class="doc-item-actions">
            <button class="btn btn--secondary btn--full-width" data-action="edit" data-id="${d.id}">Editar</button>
            <button class="btn btn--warning btn--full-width" data-action="delete" data-id="${d.id}">Eliminar</button>
            <button class="btn btn--secondary btn--full-width btn-ver-codigos" data-codes-id="${codesId}">Ver Códigos</button>
          </div>
          ${codesListHtml}
        </div>
      `;
    })
    .join('');

  // Delegación de eventos para Editar / Eliminar
  container.addEventListener('click', onListClick, { once: true });
}

async function onListClick(ev) {
  const btn = ev.target.closest('button[data-action]');
  if (!btn) return;

  const id = btn.getAttribute('data-id');
  const action = btn.getAttribute('data-action');

  if (action === 'delete') {
    showModalConfirm('¿Eliminar documento?', async () => {
      try {
        await eliminarDocumento(id);
        showToast('Documento eliminado', 'success');
        cargarConsulta();
      } catch {
        showToast('No se pudo eliminar', 'error');
      }
    });
    return;
  }

  if (action === 'edit') {
    try {
      // Usa la API que incluye X-Tenant-ID mediante jfetch
      const d = await obtenerDocumento(id);
      if (!d || d.error) throw new Error(d?.error || 'No se pudo cargar');

      // Cambia a la pestaña "Subir"
      if (window.showTab) window.showTab('tab-upload');

      // Llena el formulario de subida/edición
      const inputNombre = document.getElementById('name');
      const inputFecha  = document.getElementById('date');
      const inputCods   = document.getElementById('codes');
      
      if (inputNombre) inputNombre.value = d.name || '';
      if (inputFecha)  inputFecha.value  = d.date || '';
      if (inputCods)   inputCods.value   = (d.codigos_extraidos || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .join('\n');

      // Muestra enlace del PDF actual
      const a = document.getElementById('link-pdf-actual');
      if (a) {
        if (d.path) {
          a.href = `${tenantConfig.r2PublicUrl}/${d.path}`;
          a.textContent = 'PDF actual';
          a.target = '_blank';
          a.classList.remove('hidden');
        } else {
          a.removeAttribute('href');
          a.textContent = 'Sin PDF';
          a.classList.remove('hidden');
        }
      }

      // (Opcional) puedes guardar el id en un hidden si luego implementas PUT:
      // let hidden = document.getElementById('doc-id');
      // if (!hidden) {
      //   hidden = document.createElement('input');
      //   hidden.type = 'hidden';
      //   hidden.id = 'doc-id';
      //   document.getElementById('upload-form')?.appendChild(hidden);
      // }
      // hidden.value = d.id;

    } catch (e) {
      console.error(e);
      showToast('Error al cargar el documento', 'error');
    }
  }
}

// Filtros cliente-side
window.clearConsultFilter = () => {
  const input = document.getElementById('consultFilterInput');
  if (input) input.value = '';
  renderDocs(currentDocs);
  const listEl = document.getElementById('results-list');
  if (listEl) bindCodeButtons(listEl);
};

window.doConsultFilter = () => {
  const term = document.getElementById('consultFilterInput').value.toLowerCase().trim();
  renderDocs(
    currentDocs.filter(d =>
      d.name.toLowerCase().includes(term) ||
      (d.codigos_extraidos || '').toLowerCase().includes(term) ||
      (d.path || '').toLowerCase().includes(term)
    )
  );
  const listEl = document.getElementById('results-list');
  if (listEl) bindCodeButtons(listEl);
};

window.downloadCsv = () => window.open(`/api/documentos?format=csv`, '_blank');
window.downloadPdfs = id => window.open(`/api/documentos?format=pdf&id=${id}`, '_blank');
