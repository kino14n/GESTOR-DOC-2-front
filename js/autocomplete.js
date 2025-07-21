// Sugerencias/autocomplete búsqueda por código
function initAutocompleteCodigo() {
  const input = document.getElementById('input-codigo');
  if(!input) return;
  input.addEventListener('input', function() {
    const val = this.value;
    if(val.length < 2) {
      document.getElementById('sugerencias-codigo').innerHTML = '';
      return;
    }
    fetch(API_URL + '?action=codigos&predictivo=1&codigo='+encodeURIComponent(val))
      .then(r=>r.json())
      .then(res=>{
        if(res.sugerencias && res.sugerencias.length) {
          document.getElementById('sugerencias-codigo').innerHTML =
            '<ul>' + res.sugerencias.map(c=>`<li>${c}</li>`).join('') + '</ul>';
        } else {
          document.getElementById('sugerencias-codigo').innerHTML = '';
        }
      });
  });
}
