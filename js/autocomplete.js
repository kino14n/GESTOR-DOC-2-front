// js/autocomplete.js

import { buscarPorCodigo } from './api.js';

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
        const data = await buscarPorCodigo(term);
        const unique = Array.from(new Set(data))
          .filter(c => c.toUpperCase().startsWith(term.toUpperCase()))
          .sort();
        suggestions.innerHTML = unique
          .map(c => `<div class="p-2 cursor-pointer hover:bg-gray-200 suggestion-item">${c}</div>`)
          .join('');
        suggestions.classList.toggle('hidden', unique.length === 0);
        // click a cada item
        suggestions.querySelectorAll('.suggestion-item').forEach(item => {
          item.onclick = () => {
            input.value = item.textContent;
            suggestions.classList.add('hidden');
          };
        });
      } catch (err) {
        console.error('Autocomplete error:', err);
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
