// GESTOR-DOC/frontend/js/autocomplete.js

import { requireAuth } from './auth.js'; 

export function initAutocompleteCodigo() {
    console.log('initAutocompleteCodigo: Función inicializada.'); 
    const codeInput = document.getElementById('codeInput');
    const suggestionsDiv = document.getElementById('suggestions');

    if (!codeInput || !suggestionsDiv) {
        console.warn('Elementos de autocompletado no encontrados (codeInput o suggestionsDiv).');
        return;
    }

    let timeout = null; 

    codeInput.addEventListener('input', () => {
        clearTimeout(timeout); 
        const query = codeInput.value.trim(); 
        console.log('Input digitado (autocomplete):', query); 

        if (query.length < 1) { 
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.classList.add('hidden'); 
            console.log('Consulta muy corta (autocomplete), sugerencias ocultas.'); 
            return;
        }

        timeout = setTimeout(async () => {
            console.log('Realizando fetch para sugerencias con query (autocomplete):', query); 
            await requireAuth(async () => {
                try {
                    const res = await fetch('https://gestor-doc-backend-production.up.railway.app/api/documentos/search_by_code', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ codigo: query }) 
                    });

                    if (!res.ok) {
                        console.error('Error al obtener sugerencias (autocomplete):', res.statusText);
                        suggestionsDiv.innerHTML = `<p class="text-red-500 p-2">Error al cargar sugerencias.</p>`;
                        suggestionsDiv.classList.remove('hidden'); 
                        return;
                    }

                    const data = await res.json(); 
                    console.log('Respuesta backend (sugerencias):', data); 

                    // --- CAMBIO CLAVE AQUÍ: Lógica de extracción de códigos más simple ---
                    const allRelevantCodes = [];
                    data.forEach(doc => { 
                        if (doc.codigos_extraidos) { 
                            doc.codigos_extraidos.split(',').forEach(code => {
                                const trimmedCode = code.trim().toUpperCase(); 
                                // Solamente verifica si el código CONTIENE la consulta (más simple y efectivo)
                                if (trimmedCode.includes(query.toUpperCase())) { 
                                    allRelevantCodes.push(trimmedCode);
                                }
                            });
                        }
                    });

                    // Eliminar duplicados y ordenar
                    const uniqueSortedSuggestions = Array.from(new Set(allRelevantCodes)).sort();
                    
                    console.log('Códigos filtrados y únicos para sugerir (autocomplete):', uniqueSortedSuggestions); 
                    displaySuggestions(uniqueSortedSuggestions); 

                } catch (error) {
                    console.error('Error fetching autocomplete suggestions:', error);
                    suggestionsDiv.innerHTML = `<p class="text-red-500 p-2">Error en la red.</p>`;
                    suggestionsDiv.classList.remove('hidden');
                }
            });
        }, 200); 
    });

    function displaySuggestions(suggestions) {
        console.log('displaySuggestions: Mostrando sugerencias (autocomplete):', suggestions); 
        suggestionsDiv.innerHTML = ''; 
        if (suggestions.length === 0) {
            suggestionsDiv.classList.add('hidden'); 
            console.log('No hay sugerencias (autocomplete), div oculto.'); 
            return;
        }

        suggestions.forEach(suggestion => { // Ya vienen ordenadas
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-200'); 
            suggestionItem.textContent = suggestion; 
            
            suggestionItem.addEventListener('click', () => {
                codeInput.value = suggestion;
                suggestionsDiv.innerHTML = '';
                suggestionsDiv.classList.add('hidden');
            });
            suggestionsDiv.appendChild(suggestionItem); 
        });
        suggestionsDiv.classList.remove('hidden'); 
        console.log('Sugerencias mostradas (autocomplete), div visible.'); 
    }

    document.addEventListener('click', (event) => {
        if (event.target !== codeInput && !suggestionsDiv.contains(event.target)) {
            suggestionsDiv.classList.add('hidden');
            suggestionsDiv.innerHTML = ''; 
        }
    });
}