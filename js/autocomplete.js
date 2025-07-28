// js/autocomplete.js

import { sugerirCodigos } from './api.js';

/** Inicializa autocompletado en #codeInput usando #suggestions */
export function initAutocompleteCodigo() {
  const input = document.getElementById('codeInput');
  const suggestions = document.getElementById('suggestions');
  if (!input || !suggestions) return;

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const term = input.value.trim();
    if (!term) {
      suggestions.innerHTML = '';
      suggestions.classList.add('hidden');
      return;
    }
    timer = setTimeout(async () => {
      try {
        const results = await sugerirCodigos(term);
        suggestions.innerHTML = results
          .map(r => {
            const code = typeof r === 'string' ? r : r.codigo;
            return `<div class="p-2 hover:bg-gray-100 cursor-pointer suggestion-item">${code}</div>`;
          })
          .join('');
        suggestions.classList.toggle('hidden', results.length === 0);
        suggestions.querySelectorAll('.suggestion-item').forEach(item => {
          item.onclick = () => {
            input.value = item.textContent;
            suggestions.classList.add('hidden');
          };
        });
      } catch (err) {
        console.error('Error en autocomplete:', err);
        suggestions.classList.add('hidden');
      }
    }, 300);
  });

  document.addEventListener('click', e => {
    if (e.target !== input && !suggestions.contains(e.target)) {
      suggestions.classList.add('hidden');
    }
  });
}
