import { cargarConsulta } from './consulta.js';
import { initUploadForm } from './upload.js'; 
import { requireAuth } from './auth.js';
import { initAutocompleteCodigo } from './autocomplete.js'; 

// Función para cambiar de pestaña (global)
window.showTab = function(tabId) {
    const tabs = document.querySelectorAll('.tab-content'); // Usar .tab-content para los paneles
    tabs.forEach(tab => {
        tab.classList.add('hidden');
    });

    const activeTabContent = document.getElementById(tabId);
    if (activeTabContent) {
        activeTabContent.classList.remove('hidden');
    }

    // Actualiza las clases 'active' de los botones de las pestañas
    const tabButtons = document.querySelectorAll('.tab'); // Seleccionar los <li> con clase 'tab'
    tabButtons.forEach(button => {
        if (button.dataset.tab === tabId) { // Compara con el data-tab del li
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Lógica específica para cada pestaña al activarse
    if (tabId === 'tab-list') { 
        cargarConsulta();
    } else if (tabId === 'tab-code') {
        // initAutocompleteCodigo() ya se llama en DOMContentLoaded, no es necesario re-llamar aquí
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Adjuntar event listeners a los botones de las pestañas
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            showTab(button.dataset.tab);
        });
    });

    // Manejo del formulario de subida (se inicializa una vez al cargar el DOM)
    initUploadForm(); 

    // Mostrar la pestaña "Buscar" (Óptima) al cargar la página por defecto
    showTab('tab-search'); 

    // Inicializa el autocompletado para la pestaña de búsqueda por código
    initAutocompleteCodigo(); 
    
    // Lógica para la Pestaña "Buscar" (Búsqueda Óptima)
    const doOptimaSearchButton = document.getElementById('doOptimaSearchButton');
    const clearOptimaSearchButton = document.getElementById('clearOptimaSearchButton');
    const optimaSearchInput = document.getElementById('optimaSearchInput');
    const optimaResultsList = document.getElementById('results-optima-search'); 

    if (doOptimaSearchButton) {
        doOptimaSearchButton.addEventListener('click', async () => {
            requireAuth(async () => { // Proteger la búsqueda con autenticación
                const codigos = optimaSearchInput.value.trim();
                if (!codigos) {
                    optimaResultsList.innerHTML = '<p class="text-red-500">Por favor, ingrese al menos un código para la búsqueda.</p>';
                    return;
                }

                optimaResultsList.innerHTML = '<p>Buscando documentos óptimos...</p>';

                try {
                    const res = await fetch('https://gestor-doc-backend-production.up.railway.app/api/documentos/search_optima', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
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
                                    <button class="btn btn--secondary btn--sm" onclick="toggleCodes(this)">Mostrar Códigos</button>
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
            requireAuth(async () => { // Proteger la búsqueda con autenticación
                try {
                    const res = await fetch('https://gestor-doc-backend-production.up.railway.app/api/documentos/search_by_code', {
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
                    resultsDiv.innerHTML = '<p>Error en la búsqueda por código.</p>';
                }
            });
        });
    }

    if (clearCodeSearchButton) {
        clearCodeSearchButton.addEventListener('click', () => {
            document.getElementById('codeInput').value = '';
            document.getElementById('results-code').innerHTML = '';
        });
    }
});

// Asegurarse de que toggleCodes esté disponible globalmente
if (typeof window.toggleCodes === 'undefined') {
    window.toggleCodes = function(button) {
        const codesContainer = button.nextElementSibling;
        if (codesContainer.classList.contains('hidden')) {
            codesContainer.classList.remove('hidden');
            button.textContent = 'Ocultar Códigos';
        } else {
            codesContainer.classList.add('hidden');
            button.textContent = 'Mostrar Códigos';
        }
    };
}