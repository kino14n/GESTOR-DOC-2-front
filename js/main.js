import { cargarConsulta, clearConsultFilter, doConsultFilter, downloadCsv, downloadPdfs, editarDoc, eliminarDoc } from './consulta.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

const API_BASE = 'https://gestor-doc-backend-production.up.railway.app/api/documentos';

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTab(tab.dataset.tab);
    });
  });
  renderTab('tab-search'); // Activar la primera pestaña por defecto

  document.getElementById('form-upload')?.addEventListener('submit', handleUpload);
});

function renderTab(tabName) {
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(c => c.classList.add('hidden'));
  const current = document.getElementById(tabName);
  if(current) current.classList.remove('hidden');

  if(tabName === 'tab-list') cargarConsulta();
  if(tabName === 'tab-code') initAutocompleteCodigo();
}

// Búsqueda inteligente
export async function doSearch() {
  const text = document.getElementById('searchInput').value.trim();
  const alertDiv = document.getElementById('search-alert');
  const resultsDiv = document.getElementById('results-search');
  alertDiv.textContent = '';
  resultsDiv.innerHTML = '';

  if(text.length < 3){
    alertDiv.textContent = 'Ingrese al menos 3 caracteres para buscar.';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ texto: text })
    });
    const data = await res.json();

    if(data.length === 0){
      resultsDiv.innerHTML = '<p>No se encontraron resultados.</p>';
      return;
    }

    resultsDiv.innerHTML = data.map(doc => `
      <div class="border p-4 rounded shadow">
        <h3 class="font-semibold">${doc.nombre}</h3>
        <p>Fecha: ${doc.fecha}</p>
        <p>Códigos: ${doc.codigos}</p>
        <a href="${doc.pdf_url}" target="_blank" class="text-blue-600 hover:underline">Ver PDF</a>
      </div>
    `).join('');

  } catch(e) {
    alertDiv.textContent = 'Error al buscar. Intente de nuevo.';
    console.error(e);
  }
}

export function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('search-alert').textContent = '';
  document.getElementById('results-search').innerHTML = '';
}

async function handleUpload(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const alertWarning = document.getElementById('uploadWarning');

  // Validar tamaño archivo
  const fileInput = document.getElementById('file');
  if(fileInput.files.length > 0 && fileInput.files[0].size > 10 * 1024 * 1024){
    alertWarning.classList.remove('hidden');
    return;
  } else {
    alertWarning.classList.add('hidden');
  }

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if(data.ok){
      showToast('Documento subido correctamente', true);
      form.reset();
    } else {
      showToast('Error: ' + data.error, false);
    }
  } catch(e){
    showToast('Error en la subida', false);
    console.error(e);
  }
}

// Exponer funciones globales para el HTML inline
window.doSearch = doSearch;
window.clearSearch = clearSearch;
window.cargarConsulta = cargarConsulta;
window.clearConsultFilter = clearConsultFilter;
window.doConsultFilter = doConsultFilter;
window.downloadCsv = downloadCsv;
window.downloadPdfs = downloadPdfs;
window.editarDoc = editarDoc;
window.eliminarDoc = eliminarDoc;
window.initAutocompleteCodigo = initAutocompleteCodigo;
