import { requireAuth } from './auth.js';
import { showModalConfirm } from './modals.js';
import { showToast } from './toasts.js';

export async function cargarConsulta() {
  const container = document.getElementById('results-list');
  try {
    const res = await fetch('https://gestor-doc-backend-production.up.railway.app/api/documentos');
    const data = await res.json();

    if(data.length === 0){
      container.innerHTML = '<p>No hay documentos.</p>';
      return;
    }

    container.innerHTML = data.map(doc => `
      <div class="border rounded p-4 mb-2">
        <h3 class="font-semibold">${doc.nombre}</h3>
        <p>Códigos: ${doc.codigos}</p>
        <button class="btn btn--primary mr-2" onclick="editarDoc(${doc.id})">Editar</button>
        <button class="btn btn--secondary" onclick="eliminarDoc(${doc.id})">Eliminar</button>
      </div>
    `).join('');

  } catch(e){
    container.innerHTML = '<p>Error cargando documentos.</p>';
    console.error(e);
  }
}

export function editarDoc(id) {
  requireAuth(() => {
    alert('Función editar documento ID: ' + id);
  });
}

export function eliminarDoc(id) {
  requireAuth(() => {
    showModalConfirm('¿Seguro que desea eliminar?', async () => {
      try {
        const res = await fetch(`https://gestor-doc-backend-production.up.railway.app/api/documentos?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if(data.ok){
          cargarConsulta();
          showToast('Documento eliminado');
        } else {
          showToast('Error eliminando documento', false);
        }
      } catch(e){
        showToast('Error eliminando documento', false);
        console.error(e);
      }
    });
  });
}

export function clearConsultFilter() {
  document.getElementById('consultFilterInput').value = '';
  cargarConsulta();
}

export function doConsultFilter() {
  const filter = document.getElementById('consultFilterInput').value.toLowerCase();
  const container = document.getElementById('results-list');
  const items = container.querySelectorAll('div.border');
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(filter) ? '' : 'none';
  });
}

export function downloadCsv() {
  window.open('https://gestor-doc-backend-production.up.railway.app/api/documentos?exportar=csv', '_blank');
}

export function downloadPdfs() {
  alert('Función para descargar PDFs pendiente');
}
