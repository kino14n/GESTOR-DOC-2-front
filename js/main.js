// main.js ajustado para esperar el DOM y manejar inicialización tras login
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

// Función global para cambiar de pestaña
window.showTab = function(tabId) {
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
  const content = document.getElementById(tabId);
  if (content) content.classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.tab[data-target="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');
};

// START: Espera el DOM y realiza login
(async function() {
  await new Promise(res => document.addEventListener('DOMContentLoaded', res));

  // Ejecuta login, pasando la inicialización dentro de la promesa del callback
  await new Promise((resolve) => {
    requireAuth(() => {
      resolve();
    });
  });

  // Después del login exitoso, inicializar app
  try {
    initUploadForm();
    initAutocompleteCodigo();
    cargarConsulta();

    const filterInput = document.getElementById('consultFilterInput');
    if (filterInput) filterInput.addEventListener('input', doConsultFilter);

    const btnClear = document.getElementById('btnClearFilter');
    if (btnClear) btnClear.addEventListener('click', clearConsultFilter);

    const btnCsv = document.getElementById('btnDownloadCsv');
    if (btnCsv) btnCsv.addEventListener('click', downloadCsv);

  } catch (err) {
    console.error('Error al inicializar app tras login:', err);
    showToast('Error inicializando la aplicación', 'error');
  }
})();
