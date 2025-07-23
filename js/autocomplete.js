
const API_BASE = 'https://gestor-doc-backend-production.up.railway.app/api/documentos';

export function initAutocompleteCodigo() {
  const input = document.getElementById('codeInput');
  const suggestions = document.getElementById('suggestions');

  if(!input) return;

  input.addEventListener('input', async () => {
    const val = input.value.toUpperCase();
    if(val.length < 2){
      suggestions.style.display = 'none';
      suggestions.innerHTML = '';
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/search_by_code`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ codigo: val, predictivo: true })
      });
      const data = await res.json();

      if(data.sugerencias && data.sugerencias.length > 0){
        suggestions.innerHTML = data.sugerencias.map(codigo => `<div class="p-2 cursor-pointer hover:bg-gray-200">${codigo}</div>`).join('');
        suggestions.style.display = 'block';

        Array.from(suggestions.children).forEach(div => {
          div.onclick = () => {
            input.value = div.textContent;
            suggestions.style.display = 'none';
            doCodeSearch();
          };
        });
      } else {
        suggestions.style.display = 'none';
        suggestions.innerHTML = '';
      }
    } catch(e){
      console.error(e);
    }
  });
}
