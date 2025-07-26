// main.js corregido: evita redeclarar cargarConsulta
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

// Cambiar pestañas
window.showTab = function(tabId) {
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
  const content = document.getElementById(tabId);
  if (content) content.classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.tab[data-target="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');
};

// Inicialización tras autenticación
document.addEventListener('DOMContentLoaded', () => {
  requireAuth(initApp);
});

// Función que arranca la app
function initApp() {
  initUploadForm();
  initAutocompleteCodigo();
  cargarConsulta();

  const filterInput = document.getElementById('consultFilterInput');
  if (filterInput) filterInput.addEventListener('input', doConsultFilter);

  const btnClear = document.getElementById('btnClearFilter');
  if (btnClear) btnClear.addEventListener('click', clearConsultFilter);

  const btnCsv = document.getElementById('btnDownloadCsv');
  if (btnCsv) btnCsv.addEventListener('click', downloadCsv);

  // downloadPdfs, editarDoc y eliminarDoc están manejados en consulta.js
}
