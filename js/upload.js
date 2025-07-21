// Lógica para subir PDF, asignar códigos y fecha
function initSubirForm() {
  const form = document.getElementById('form-subir');
  if(!form) return;
  form.onsubmit = function(e) {
    e.preventDefault();
    const fd = new FormData(form);
    fetch(API_URL + '?action=upload', {
      method: 'POST',
      body: fd
    }).then(r=>r.json())
      .then(res=>{
        document.getElementById('feedback-subir').innerHTML = res.ok ? '<p>Documento subido!</p>' : '<p>Error: '+res.error+'</p>';
      });
  }
}
