// Edición y eliminación en la consulta
function editarDoc(id) {
  requireAuth(() => {
    // Mostrar modal de edición o navegar a edición
    showModalConfirm('¿Editar este documento?', ()=>{alert('Editar ' + id)});
  });
}
function eliminarDoc(id) {
  requireAuth(() => {
    showModalConfirm('¿Seguro que desea eliminar?', ()=>{
      fetch(API_URL + '?action=documentos&id='+id, {method:'DELETE'})
      .then(r=>r.json())
      .then(res=>{
        if(res.ok) cargarConsulta();
        else alert('Error al eliminar');
      });
    });
  });
}
function descargarCSV() {
  fetch(API_URL + '?action=consulta&exportar=csv')
    .then(r=>r.blob())
    .then(blob=>{
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = "consulta.csv";
      document.body.appendChild(a);
      a.click(); document.body.removeChild(a);
    });
}
