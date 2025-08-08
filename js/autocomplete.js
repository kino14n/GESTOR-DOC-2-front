// Autocompletado para la pestaña "Búsqueda por Código"
// Soporta ser llamado sin argumentos: detecta #codigoInput automáticamente.

import { sugerirCodigos } from './api.js';

let abortCtrl = null;

/**
 * Inicializa el autocompletado sobre un input.
 * @param {HTMLInputElement} [inputEl] Si no se provee, intenta usar #codigoInput
 * @param {(codigo: string) => void} [onSelect]
 */
export function initAutocompleteCodigo(inputEl, onSelect) {
  const input = inputEl || /** @type {HTMLInputElement|null} */ (document.getElementById('codigoInput'));
  if (!input) return;

  const listId = input.getAttribute('aria-controls') || 'codigo-suggestions';
  let list = document.getElementById(listId);
  if (!list) {
    list = document.createElement('ul');
    list.id = listId;
    list.className = 'absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow text-sm';
    if (input.parentElement) input.parentElement.style.position = 'relative';
    input.parentElement?.appendChild(list);
  }

  async function render(q) {
    list.innerHTML = '';
    if (!q || q.length < 2) return;

    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();

    try {
      const res = await sugerirCodigos(q, { signal: abortCtrl.signal });
      const items = Array.isArray(res?.data) ? res.data : [];
      const codigos = items.map(it => (typeof it === 'string' ? it : it.codigo)).filter(Boolean);

      codigos.slice(0, 10).forEach(c => {
        const li = document.createElement('li');
        li.textContent = c;
        li.tabIndex = 0;
        li.className = 'px-3 py-2 cursor-pointer hover:bg-gray-100';
        li.addEventListener('click', () => {
          input.value = c;
          list.innerHTML = '';
          if (onSelect) onSelect(c);
        });
        list.appendChild(li);
      });
    } catch (err) {
      if (err?.name !== 'AbortError') console.error('Autocomplete error', err);
    }
  }

  input.addEventListener('input', () => render((input.value || '').trim()));
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape') list.innerHTML = ''; });
  input.addEventListener('blur', () => setTimeout(() => (list.innerHTML = ''), 120));
}
