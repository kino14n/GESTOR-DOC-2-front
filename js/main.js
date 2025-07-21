// Control de pestañas y renderizado de contenido dinámico
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderTab(this.dataset.tab);
    });
  });
  renderTab('buscar');
});

function renderTab(tab) {
  let html = '';
  switch(tab) {
    case 'buscar':
      html = `<h2>Búsqueda Inteligente</h2>
        <textarea id="buscador-texto" class="w-full border p-2 mb-2" placeholder="Pega aquí tus códigos o texto..."></textarea>
        <button onclick="buscarVoraz()" class="bg-red-400 text-white px-6 py-2 rounded mb-4">Buscar</button>
        <div id="resultados"></div>`;
      break;
    case 'subir':
      html = `<h2>Subir / Editar Documento</h2>
        <form id="form-subir" enctype="multipart/form-data">
          <input type="text" id="nombre" placeholder="Nombre" class="w-full border p-2 mb-2">
          <input type="date" id="fecha" class="w-full border p-2 mb-2">
          <input type="file" id="archivo" accept="application/pdf" class="mb-2">
          <textarea id="codigos" placeholder="Códigos" class="w-full border p-2 mb-2"></textarea>
          <button type="submit" class="bg-red-400 text-white w-full py-2 rounded">Guardar</button>
        </form>
        <div id="feedback-subir"></div>`;
      break;
    case 'consultar':
      html = `<h2>Consultar Documentos</h2>
        <input type="text" id="filtro-consulta" class="w-full border p-2 mb-2" placeholder="Filtrar por nombre o PDF...">
        <button onclick="descargarCSV()" class="bg-red-400 text-white px-4 py-2 rounded mb-4">Descargar CSV</button>
        <div id="lista-consulta"></div>`;
      break;
    case 'codigo':
      html = `<h2>Búsqueda por Código</h2>
        <input type="text" id="input-codigo" class="w-full border p-2 mb-2" placeholder="Código en MAYÚSCULAS (ej: ABC123)">
        <button onclick="buscarCodigo()" class="bg-red-400 text-white w-full py-2 rounded mb-4">Buscar por Código</button>
        <div id="sugerencias-codigo"></div>
        <div id="resultado-codigo"></div>`;
      break;
  }
  document.getElementById('tab-content').innerHTML = html;
  if(tab === 'subir') initSubirForm();
  if(tab === 'consultar') cargarConsulta();
  if(tab === 'codigo') initAutocompleteCodigo();
}
