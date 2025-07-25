import { cargarConsulta, clearConsultFilter, doConsultFilter, downloadCsv, downloadPdfs } from './consulta.js'; // Importar todas las funciones necesarias
import { initUploadForm } from './upload.js';
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js';
import { showToast } from './toasts.js'; // Asegurarse de que showToast esté importado

const API_BASE = 'https://gestor-doc-backend-production.up.railway.app/api/documentos';

// Función global para cambiar de pestaña
window.showTab = function(tabId) {
    const tabsContent = document.querySelectorAll('.tab-content');
    tabsContent.forEach(tab => {
        tab.classList.add('hidden');
    });

    const activeTabContent = document.getElementById(tabId);
    if (activeTabContent) {
        activeTabContent.classList.remove('hidden');
    }

    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(button => {
        if (button.dataset.tab === tabId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Lógica específica para cada pestaña al activarse
    if (tabId === 'tab-list') {
        cargarConsulta();
    }
    // initAutocompleteCodigo se llama en DOMContentLoaded, no es necesario aquí.
};

document.addEventListener('DOMContentLoaded', () => {
    // Adjuntar event listeners a los botones de las pestañas
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.showTab(button.dataset.tab); // Usar window.showTab para llamarla
        });
    });

    // Inicializar el formulario de subida
    initUploadForm();

    // Mostrar el modal de login si no está autenticado
    requireAuth(() => {
        // Callback después de una autenticación exitosa
        document.getElementById('loginOverlay').classList.add('hidden'); // Ocultar overlay de login
        document.getElementById('mainContent').classList.remove('hidden'); // Mostrar contenido principal
        window.showTab('tab-search'); // Activar la primera pestaña por defecto
        initAutocompleteCodigo(); // Inicializar autocompletado (solo si es necesario después del login)
        cargarConsulta(); // Cargar la consulta inicial (si es necesario después del login)
    });

    // Lógica para la Pestaña "Buscar" (Búsqueda Óptima)
    const doOptimaSearchButton = document.getElementById('doOptimaSearchButton');
    const clearOptimaSearchButton = document.getElementById('clearOptimaSearchButton');
    const optimaSearchInput = document.getElementById('optimaSearchInput');
    const optimaResultsList = document.getElementById('results-optima-search');

    if (doOptimaSearchButton) {
        doOptimaSearchButton.addEventListener('click', async () => {
            const codigos = optimaSearchInput.value.trim();
            if (!codigos) {
                optimaResultsList.innerHTML = '<p class="text-red-500">Por favor, ingrese al menos un código para la búsqueda.</p>';
                return;
            }

            optimaResultsList.innerHTML = '<p>Buscando documentos óptimos...</p>';

            try {
                const res = await fetch(`${API_BASE}/search_optima`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ codigos: codigos })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    optimaResultsList.innerHTML = `<p class="text-red-500">Error en la búsqueda: ${errorData.error || res.statusText}</p>`;
                    return;
                }

                const data = await res.json();

                if (data.documentos && data.documentos.length > 0) {
                    let htmlContent = `<p class="font-bold mb-2">Se encontraron ${data.documentos.length} documentos para cubrir los códigos:</p>`;
                    htmlContent += data.documentos.map(item => `
                        <div class="border rounded p-4 mb-2 bg-white shadow-sm">
                            <h3 class="font-semibold">${item.documento.name}</h3>
                            <p><b>Fecha:</b> ${item.documento.date || ''}</p>
                            <p>PDF: ${item.documento.path ? `<a href="uploads/${item.documento.path}" target="_blank" class="text-blue-600 underline">${item.documento.path}</a>` : 'N/A'}</p>
                            <div class="mt-2">
                                <button class="btn btn--secondary btn--sm" data-action="toggleCodes">Mostrar Códigos</button>
                                <p class="codes-container hidden mt-1 text-sm text-gray-700">${(item.documento.codigos_encontrados || '').split(',').join('<br>')}</p>
                            </div>
                            <p class="text-sm mt-2">Códigos cubiertos por este documento en la búsqueda: <span class="font-medium">${item.codigos_cubre.join(', ')}</span></p>
                        </div>
                    `).join('');

                    if (data.codigos_faltantes && data.codigos_faltantes.length > 0) {
                        htmlContent += `<p class="text-orange-600 mt-4">Atención: No se pudieron cubrir todos los códigos. Códigos faltantes: <span class="font-medium">${data.codigos_faltantes.join(', ')}</span></p>`;
                    }

                    optimaResultsList.innerHTML = htmlContent;

                } else if (data.codigos_faltantes && data.codigos_faltantes.length > 0) {
                    optimaResultsList.innerHTML = `<p class="text-orange-600">No se encontraron documentos que contengan los códigos buscados. Códigos faltantes: ${data.codigos_faltantes.join(', ')}</p>`;
                } else {
                    optimaResultsList.innerHTML = '<p>No se encontraron documentos que cumplan con la búsqueda.</p>';
                }

            } catch (error) {
                console.error('Error en la búsqueda óptima:', error);
                optimaResultsList.innerHTML = `<p class="text-red-500">Ocurrió un error al intentar la búsqueda óptima.</p>`;
            }
        });
    }

    if (clearOptimaSearchButton) {
        clearOptimaSearchButton.addEventListener('click', () => {
            optimaSearchInput.value = '';
            optimaResultsList.innerHTML = '';
        });
    }

    // Lógica para la Pestaña "BUSCAR POR CÓDIGO"
    const doCodeSearchButton = document.getElementById('doCodeSearchButton');
    const clearCodeSearchButton = document.getElementById('clearCodeSearchButton');

    if (doCodeSearchButton) {
        doCodeSearchButton.addEventListener('click', async () => {
            const input = document.getElementById('codeInput');
            const code = input.value.trim();
            const resultsDiv = document.getElementById('results-code');
            resultsDiv.innerHTML = '';
            if(code.length < 1){
                resultsDiv.innerHTML = '<p>Escribe un código para buscar.</p>';
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/search_by_code`, { // Asegúrate de que esta URL sea correcta para Flask
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ codigo: code })
                });
                const data = await res.json();
                if(data.length === 0){
                    resultsDiv.innerHTML = '<p>No se encontró ningún documento con ese código.</p>';
                    return;
                }
                resultsDiv.innerHTML = data.map(doc => `
                    <div class="border p-4 rounded shadow">
                        <h3 class="font-semibold">${doc.name}</h3>
                        <p><b>Fecha:</b> ${doc.date || ''}</p>
                        <p><b>Códigos:</b> ${doc.codigos_extraidos || ''}</p>
                        <p><b>PDF:</b> ${doc.path ? `<a href="uploads/${doc.path}" target="_blank" class="text-blue-600 underline">${doc.path}</a>` : ''}</p>
                    </div>
                `).join('');
            } catch(e) {
                console.error('Error en la búsqueda por código:', e);
                resultsDiv.innerHTML = '<p>Error en la búsqueda por código.</p>';
            }
        });
    }

    if (clearCodeSearchButton) {
        clearCodeSearchButton.addEventListener('click', () => {
            document.getElementById('codeInput').value = '';
            document.getElementById('results-code').innerHTML = '';
        });
    }
});

// Asegurarse de que toggleCodes esté disponible globalmente (definido en consulta.js)
// Ya no lo definimos aquí, ya que consulta.js lo exporta globalmente a través de window.