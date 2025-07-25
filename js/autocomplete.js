// GESTOR-DOC/frontend/js/autocomplete.js

import { requireAuth } from './auth.js'; 

export function initAutocompleteCodigo() {
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

        // Oculta las sugerencias si la consulta es muy corta o vacía
        if (query.length < 1) { // Buscar a partir de 1 carácter
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.classList.add('hidden'); // Asegurarse de que se oculte
            return;
        }

        timeout = setTimeout(async () => {
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
                    const uniqueCodes = new Set(); 

                    data.forEach(doc => {
                        if (doc.codigos_extraidos) {
                            doc.codigos_extraidos.split(',').forEach(code => {
                                const trimmedCode = code.trim().toUpperCase(); 
                                // Solo añade sugerencias que *contengan* la consulta (más flexible)
                                if (trimmedCode.includes(query.toUpperCase()) && trimmedCode.length > query.length) { 
                                    uniqueCodes.add(trimmedCode);
                                }
                            });
                        }
                    });

                    displaySuggestions(Array.from(uniqueCodes)); 

                } catch (error) {
                    console.error('Error fetching autocomplete suggestions:', error);
                    suggestionsDiv.innerHTML = '<p class="text-red-500 p-2">Error en la red.</p>';
                    suggestionsDiv.classList.remove('hidden');
                }
            });
        }, 200); // Retardo de 200 milisegundos para mejorar la experiencia
    });

    function displaySuggestions(suggestions) {
        suggestionsDiv.innerHTML = ''; 
        if (suggestions.length === 0) {
            suggestionsDiv.classList.add('hidden'); 
            return;
        }

        suggestions.sort(); // Ordenar alfabéticamente

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
    }

    document.addEventListener('click', (event) => {
        if (event.target !== codeInput && !suggestionsDiv.contains(event.target)) {
            suggestionsDiv.classList.add('hidden');
            suggestionsDiv.innerHTML = ''; 
        }
    });
}