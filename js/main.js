// js/main.js

import { cargarConsulta, clearConsultFilter, doConsultFilter, downloadCsv, downloadPdfs, editarDoc, eliminarDoc } from './consulta.js';
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js';

const API_BASE = 'https://gestor-doc-backend-production.up.railway.app/api/documentos';

// 1) Definimos la función global para cambiar de pestaña
window.showTab = function(tabId) {
  // Oculta todos los contenidos de pestaña
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  // Muestra la sección seleccionada
  const section = document.getElementById(tabId);
  if (section) section.classList.remove('hidden');
  // Marca la pestaña activa
  document.querySelectorAll('.tab').forEach(btn => {
    if (btn.dataset.tab === tabId) btn.classList.add('active');
    else btn.classList.remove('active');
  });
};

document.addEventListener('DOMContentLoaded', () => {
  // 2) Ocultamos todo hasta validar login
  const mainContent = document.getElementById('mainContent');
  if (mainContent) mainContent.classList.add('hidden');

  // 3) Asignamos el evento a cada pestaña
  document.querySelectorAll('.tab').forEach(button => {
    button.addEventListener('click', () => window.showTab(button.dataset.tab));
  });

  // 4) Ejecutamos la lógica de autenticación
  requireAuth(() => {
    // Una vez validado:
    // – Oculta overlay y muestra contenido
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) loginOverlay.classList.add('hidden');
    if (mainContent)  mainContent.classList.remove('hidden');
    // – Muestra la pestaña inicial y carga datos
    window.showTab('tab-search');
    cargarConsulta();
  });

  // 5) Inicializamos formularios y autocompletado (no visibles hasta login)
  initUploadForm();
  initAutocompleteCodigo();
});
