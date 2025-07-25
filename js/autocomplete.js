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
                    // *** VUELTA A FLASK: Endpoint search_by_code, método POST, cuerpo JSON ***
                    // Flask `search_by_code` devuelve documentos, no solo una lista de códigos
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

                    const data = await res.json(); // Flask devuelve un array de documentos
                    console.log('Respuesta backend (sugerencias):', data); 

                    const uniqueCodes = new Set(); 

                    // *** VUELTA A FLASK: Iterar sobre documentos y extraer `codigos_extraidos` ***
                    data.forEach(doc => {
                        if (doc.codigos_extraidos) {
                            doc.codigos_extraidos.split(',').forEach(code => {
                                const trimmedCode = code.trim().toUpperCase(); 
                                if (trimmedCode.includes(query.toUpperCase()) && trimmedCode.length > query.length) { 
                                    uniqueCodes.add(trimmedCode);
                                }
                            });
                        }
                    });

                    console.log('Códigos únicos encontrados para sugerir (autocomplete):', Array.from(uniqueCodes)); 
                    displaySuggestions(Array.from(uniqueCodes)); 

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

        suggestions.sort(); 

        suggestions.forEach(suggestion => {
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