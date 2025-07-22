// Llamadas AJAX al backend
const API_URL = 'https://gestor-doc-backend.up.railway.app/api.php';

function buscarVoraz() {
  const txt = document.getElementById('buscador-texto').value.trim();
  fetch(API_URL + '?action=buscar', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({texto: txt})
  })
  .then(r=>r.json())
  .then(res=>{
    let html = '';
    if(res.data && res.data.length) {
      html = '<ul>' + res.data.map(d => `<li><b>${d.nombre}</b> (${d.codigos})</li>`).join('') + '</ul>';
    } else {
      html = '<p>No se encontraron resultados.</p>';
    }
    document.getElementById('resultados').innerHTML = html;
  });
}
function buscarCodigo() {
  const codigo = document.getElementById('input-codigo').value.trim();
  fetch(API_URL + '?action=codigos&codigo='+encodeURIComponent(codigo))
    .then(r=>r.json())
    .then(res=>{
      let html = '';
      if(res.data && res.data.length) {
        html = '<ul>' + res.data.map(d => `<li><b>${d.nombre}</b> (${d.codigos})</li>`).join('') + '</ul>';
      } else {
        html = '<p>No se encontró el documento.</p>';
      }
      document.getElementById('resultado-codigo').innerHTML = html;
    });
}
function cargarConsulta() {
  fetch(API_URL + '?action=consulta')
    .then(r=>r.json())
    .then(res=>{
      let html = '';
      if(res.data && res.data.length) {
        html = '<ul>' + res.data.map(d => 
          `<li><b>${d.nombre}</b> (${d.codigos}) 
          <button onclick="editarDoc(${d.id})">Editar</button> 
          <button onclick="eliminarDoc(${d.id})">Eliminar</button></li>`
        ).join('') + '</ul>';
      } else {
        html = '<p>No hay documentos.</p>';
      }
      document.getElementById('lista-consulta').innerHTML = html;
    });
}
