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

        // Las sugerencias se activan a partir del segundo dígito
        if (query.length < 1) { 
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.classList.add('hidden'); 
            return;
        }

        timeout = setTimeout(async () => {
            await requireAuth(async () => {
                try {
                    // Endpoint Flask para buscar por código
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
                        suggestionsDiv.classList.add('hidden'); 
                        return;
                    }

                    const data = await res.json(); // Data es directamente el array de códigos (ej. ["CODE1", "CODE2"])
                    
                    // Filtrar por códigos que empiecen con la consulta y eliminar duplicados.
                    const uniqueSortedSuggestions = Array.from(new Set(data)).filter(code => {
                        return code.toUpperCase().startsWith(query.toUpperCase());
                    }).sort();
                    
                    displaySuggestions(uniqueSortedSuggestions); 

                } catch (error) {
                    console.error('Error fetching autocomplete suggestions:', error);
                    suggestionsDiv.innerHTML = `<p class="text-red-500 p-2">Error en la red.</p>`;
                    suggestionsDiv.classList.add('hidden');
                }
            });
        }, 200); 
    });

    function displaySuggestions(suggestions) {
        suggestionsDiv.innerHTML = ''; 
        if (suggestions.length === 0) {
            suggestionsDiv.classList.add('hidden'); 
            return;
        }

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
    }

    document.addEventListener('click', (event) => {
        if (event.target !== codeInput && !suggestionsDiv.contains(event.target)) {
            suggestionsDiv.classList.add('hidden');
            suggestionsDiv.innerHTML = ''; 
        }
    });
}