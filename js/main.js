// main.js actualizado
import {
  cargarConsulta,
  clearConsultFilter,
  doConsultFilter,
  downloadCsv,
  downloadPdfs,
  editarDoc,
  eliminarDoc
} from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

const API_BASE = 'https://gestor-doc-backend-production.up.railway.app/api/documentos';

// Función global para cambiar pestaña
window.showTab = function(tabId) {
  const tabsContent = document.querySelectorAll('.tab-content');
  tabsContent.forEach(tab => tab.classList.add('hidden'));
  const activeTabContent = document.getElementById(tabId);
  if (activeTabContent) activeTabContent.classList.remove('hidden');
  const tabButtons = document.querySelectorAll('.tab');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  const activeTabButton = document.querySelector(`.tab[data-target="${tabId}"]`);
  if (activeTabButton) activeTabButton.classList.add('active');
};

// Esperar a que el DOM cargue antes de enganchar listeners
document.addEventListener('DOMContentLoaded', () => {
  // Autenticación
  if (typeof requireAuth === 'function') requireAuth();

  // Inicializar formulario de subida
  if (typeof initUploadForm === 'function') initUploadForm();

  // Inicializar autocomplete en Búsqueda por Código
  if (typeof initAutocompleteCodigo === 'function') initAutocompleteCodigo();

  // Cargar datos de consulta inicial
  if (typeof cargarConsulta === 'function') cargarConsulta();

  // Enganchar filtro y botones de consulta (asegúrate de tener estos IDs en tu HTML)
  const filterInput = document.getElementById('consultFilterInput');
  if (filterInput) {
    filterInput.addEventListener('input', doConsultFilter);
  }

  const btnClearFilter = document.getElementById('btnClearFilter');
  if (btnClearFilter) {
    btnClearFilter.addEventListener('click', clearConsultFilter);
  }

  const btnDownloadCsv = document.getElementById('btnDownloadCsv');
  if (btnDownloadCsv) {
    btnDownloadCsv.addEventListener('click', downloadCsv);
  }

  // Otros listeners dinámicos (Editar, Eliminar, Mostrar Códigos) se gestionan internamente en consulta.js
});
