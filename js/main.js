// Tabs animadas y renderizado premium
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
      html = `<h2 class="text-xl font-bold mb-3 text-gray-900">Búsqueda Inteligente</h2>
        <textarea id="buscador-texto" class="w-full border p-3 mb-2" placeholder="Pega aquí tus códigos o texto..."></textarea>
        <button onclick="buscarVoraz()" class="btn w-full mb-4">Buscar</button>
        <div id="resultados"></div>`;
      break;
    case 'subir':
      html = `<h2 class="text-xl font-bold mb-3 text-gray-900">Subir / Editar Documento</h2>
        <form id="form-subir" enctype="multipart/form-data">
          <input type="text" id="nombre" placeholder="Nombre" class="w-full border p-3 mb-2">
          <input type="date" id="fecha" class="w-full border p-3 mb-2">
          <input type="file" id="archivo" accept="application/pdf" class="mb-2">
          <textarea id="codigos" placeholder="Códigos" class="w-full border p-3 mb-2"></textarea>
          <button type="submit" class="btn w-full">Guardar</button>
        </form>
        <div id="feedback-subir"></div>`;
      break;
    case 'consultar':
      html = `<h2 class="text-xl font-bold mb-3 text-gray-900">Consultar Documentos</h2>
        <input type="text" id="filtro-consulta" class="w-full border p-3 mb-2" placeholder="Filtrar por nombre o PDF...">
        <button onclick="descargarCSV()" class="btn mb-3">Descargar CSV</button>
        <div id="lista-consulta"></div>`;
      break;
    case 'codigo':
      html = `<h2 class="text-xl font-bold mb-3 text-gray-900">Búsqueda por Código</h2>
        <input type="text" id="input-codigo" class="w-full border p-3 mb-2" placeholder="Código en MAYÚSCULAS (ej: ABC123)">
        <button onclick="buscarCodigo()" class="btn w-full mb-4">Buscar por Código</button>
        <div id="sugerencias-codigo"></div>
        <div id="resultado-codigo"></div>`;
      break;
  }
  document.getElementById('tab-content').innerHTML = html;
  if(tab === 'subir') initSubirForm && initSubirForm();
  if(tab === 'consultar') cargarConsulta && cargarConsulta();
  if(tab === 'codigo') initAutocompleteCodigo && initAutocompleteCodigo();
}
