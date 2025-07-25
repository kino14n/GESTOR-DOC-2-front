// GESTOR-DOC/frontend/js/autocomplete.js

import { requireAuth } from './auth.js'; 

export function initAutocompleteCodigo() {
    console.log('initAutocompleteCodigo: Función inicializada.'); // LOG 1
    const codeInput = document.getElementById('codeInput');
    const suggestionsDiv = document.getElementById('suggestions');

    if (!codeInput || !suggestionsDiv) {
        console.warn('Elementos de autocompletado no encontrados (codeInput o suggestionsDiv).');
        return;
    }

    let timeout = null; 

    // Evento que se dispara cada vez que el usuario escribe en el input
    codeInput.addEventListener('input', () => {
        clearTimeout(timeout); 
        const query = codeInput.value.trim(); 
        console.log('Input digitado:', query); // LOG 2

        // Oculta las sugerencias si la consulta es muy corta o vacía
        if (query.length < 1) { 
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.classList.add('hidden'); 
            console.log('Consulta muy corta, sugerencias ocultas.'); // LOG 3
            return;
        }

        // Establece un retardo antes de hacer la búsqueda
        timeout = setTimeout(async () => {
            console.log('Realizando fetch para sugerencias con query:', query); // LOG 4
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
                        console.error('Error al obtener sugerencias:', res.statusText);
                        suggestionsDiv.innerHTML = '<p class="text-red-500 p-2">Error al cargar sugerencias.</p>';
                        suggestionsDiv.classList.remove('hidden'); 
                        return;
                    }

                    const data = await res.json(); 
                    console.log('Respuesta backend (data):', data); // LOG 5

                    const uniqueCodes = new Set(); 

                    data.forEach(doc => {
                        if (doc.codigos_extraidos) {
                            doc.codigos_extraidos.split(',').forEach(code => {
                                const trimmedCode = code.trim().toUpperCase(); 
                                // Solo añade sugerencias que *contengan* la consulta y sean más largas que la consulta
                                if (trimmedCode.includes(query.toUpperCase()) && trimmedCode.length > query.length) { 
                                    uniqueCodes.add(trimmedCode);
                                }
                            });
                        }
                    });

                    console.log('Códigos únicos encontrados para sugerir:', Array.from(uniqueCodes)); // LOG 6
                    displaySuggestions(Array.from(uniqueCodes)); 

                } catch (error) {
                    console.error('Error fetching autocomplete suggestions:', error);
                    suggestionsDiv.innerHTML = '<p class="text-red-500 p-2">Error en la red.</p>';
                    suggestionsDiv.classList.remove('hidden');
                }
            });
        }, 200); 
    });

    function displaySuggestions(suggestions) {
        console.log('displaySuggestions: Mostrando sugerencias:', suggestions); // LOG 7
        suggestionsDiv.innerHTML = ''; 
        if (suggestions.length === 0) {
            suggestionsDiv.classList.add('hidden'); 
            console.log('No hay sugerencias, div oculto.'); // LOG 8
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
        suggestionsDiv.classList.remove('hidden'); // Muestra el contenedor
        console.log('Sugerencias mostradas, div visible.'); // LOG 9
    }

    document.addEventListener('click', (event) => {
        if (event.target !== codeInput && !suggestionsDiv.contains(event.target)) {
            suggestionsDiv.classList.add('hidden');
            suggestionsDiv.innerHTML = ''; 
        }
    });
}