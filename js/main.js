// js/main.js

import { cargarConsulta, clearConsultFilter, doConsultFilter, downloadCsv, downloadPdfs, editarDoc, eliminarDoc } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

const API_BASE = 'https://gestor-doc-backend-production.up.railway.app/api/documentos';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar pestañas
  document.querySelectorAll('.tab').forEach(button => {
    button.addEventListener('click', () => window.showTab(button.dataset.tab));
  });

  // Ocultar contenido hasta login
  const mainContent = document.getElementById('mainContent');
  if (mainContent) mainContent.classList.add('hidden');

  // Autenticación
  requireAuth(() => {
    // Tras login exitoso:
    // 1) Ocultar overlay
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) loginOverlay.classList.add('hidden');
    // 2) Mostrar app
    if (mainContent) mainContent.classList.remove('hidden');

    // 3) Mostrar pestaña inicial y cargar datos
    window.showTab('tab-search');
    cargarConsulta();
  });

  // Arrancar formularios y autocompletado **sin** mostrar antes del login
  initUploadForm();
  initAutocompleteCodigo();
});
