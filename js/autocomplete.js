// GESTOR-DOC/frontend/js/autocomplete.js

import { requireAuth } from './auth.js'; // Se asume que la autenticación es necesaria para las sugerencias.

export function initAutocompleteCodigo() {
    const codeInput = document.getElementById('codeInput');
    const suggestionsDiv = document.getElementById('suggestions');

    // Verifica que los elementos HTML existan antes de intentar usarlos
    if (!codeInput || !suggestionsDiv) {
        console.warn('Elementos de autocompletado no encontrados (codeInput o suggestionsDiv).');
        return;
    }

    let timeout = null; // Variable para controlar el retardo en la búsqueda

    // Evento que se dispara cada vez que el usuario escribe en el input
    codeInput.addEventListener('input', () => {
        clearTimeout(timeout); // Limpia cualquier temporizador anterior para evitar búsquedas innecesarias
        const query = codeInput.value.trim(); // Obtiene el texto actual del input

        // Si la consulta es muy corta, oculta las sugerencias y no busca
        if (query.length < 2) { // Puedes ajustar este número (ej. buscar a partir de 1, 2 o 3 caracteres)
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.classList.add('hidden');
            return;
        }

        // Establece un retardo antes de hacer la búsqueda para no saturar el servidor
        timeout = setTimeout(async () => {
            // Usa requireAuth para asegurar que la solicitud esté autenticada
            await requireAuth(async () => {
                try {
                    // Realiza la solicitud POST al endpoint de búsqueda por código
                    // Este endpoint busca documentos donde el código contenga la 'query'
                    const res = await fetch('https://gestor-doc-backend-production.up.railway.app/api/documentos/search_by_code', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ codigo: query }) // Envía la consulta como 'codigo'
                    });

                    // Si la respuesta no es exitosa (ej. error 4xx o 5xx)
                    if (!res.ok) {
                        console.error('Error al obtener sugerencias:', res.statusText);
                        suggestionsDiv.innerHTML = '<p class="text-red-500 p-2">Error al cargar sugerencias.</p>';
                        suggestionsDiv.classList.remove('hidden');
                        return;
                    }

                    const data = await res.json(); // Parsea la respuesta JSON
                    const uniqueCodes = new Set(); // Usamos un Set para almacenar códigos únicos

                    // Itera sobre los documentos encontrados para extraer todos los códigos
                    data.forEach(doc => {
                        if (doc.codigos_extraidos) {
                            // Divide la cadena de códigos por coma y procesa cada uno
                            doc.codigos_extraidos.split(',').forEach(code => {
                                const trimmedCode = code.trim().toUpperCase(); // Limpia y convierte a mayúsculas
                                // Agrega el código al Set solo si empieza con la consulta (para mayor relevancia)
                                if (trimmedCode.startsWith(query.toUpperCase())) {
                                    uniqueCodes.add(trimmedCode);
                                }
                            });
                        }
                    });

                    // Muestra las sugerencias en el div correspondiente
                    displaySuggestions(Array.from(uniqueCodes)); // Convierte el Set a un Array para pasarlo

                } catch (error) {
                    // Captura cualquier error de red o en el procesamiento
                    console.error('Error fetching autocomplete suggestions:', error);
                    suggestionsDiv.innerHTML = '<p class="text-red-500 p-2">Error en la red.</p>';
                    suggestionsDiv.classList.remove('hidden');
                }
            });
        }, 300); // Retardo de 300 milisegundos
    });

    // Función para mostrar las sugerencias en el DOM
    function displaySuggestions(suggestions) {
        suggestionsDiv.innerHTML = ''; // Limpia las sugerencias anteriores
        if (suggestions.length === 0) {
            suggestionsDiv.classList.add('hidden'); // Oculta si no hay sugerencias
            return;
        }

        suggestions.sort(); // Opcional: ordenar alfabéticamente las sugerencias para mejor UX

        // Crea un elemento div para cada sugerencia
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-200'); // Clases para estilo
            suggestionItem.textContent = suggestion; // El texto de la sugerencia
            
            // Cuando se hace clic en una sugerencia, llena el input y oculta las sugerencias
            suggestionItem.addEventListener('click', () => {
                codeInput.value = suggestion;
                suggestionsDiv.innerHTML = '';
                suggestionsDiv.classList.add('hidden');
                // Opcional: Puedes disparar la búsqueda principal aquí si quieres que al seleccionar se busque automáticamente
                // window.doCodeSearch(); 
            });
            suggestionsDiv.appendChild(suggestionItem); // Agrega la sugerencia al contenedor
        });
        suggestionsDiv.classList.remove('hidden'); // Muestra el contenedor de sugerencias
    }

    // Ocultar sugerencias cuando se hace clic fuera del input o las sugerencias
    document.addEventListener('click', (event) => {
        // Si el clic no fue en el input ni dentro del div de sugerencias
        if (event.target !== codeInput && !suggestionsDiv.contains(event.target)) {
            suggestionsDiv.classList.add('hidden');
            suggestionsDiv.innerHTML = ''; // Limpia el contenido para futuras búsquedas
        }
    });
}