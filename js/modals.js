// Modales de login, edición y eliminación
function showModalLogin(onOk) {
  const html = `<div class="modal" id="modal-login">
    <div class="modal-content">
      <h3>Ingrese clave de administrador</h3>
      <input type="password" id="clave-admin" class="w-full border p-2 mb-2">
      <button onclick="loginClave()" class="bg-red-400 text-white w-full py-2 rounded">Entrar</button>
    </div>
  </div>`;
  document.getElementById('modals').innerHTML = html;
  window.loginClave = function() {
    const clave = document.getElementById('clave-admin').value;
    document.getElementById('modals').innerHTML = '';
    if(typeof onOk === 'function') onOk();
  }
}
function showModalConfirm(msg, onOk) {
  const html = `<div class="modal" id="modal-confirm">
    <div class="modal-content">
      <p>${msg}</p>
      <button onclick="ok()">Sí</button>
      <button onclick="cancel()">No</button>
    </div>
  </div>`;
  document.getElementById('modals').innerHTML = html;
  window.ok = function() {
    document.getElementById('modals').innerHTML = '';
    if(typeof onOk === 'function') onOk();
  }
  window.cancel = function() {
    document.getElementById('modals').innerHTML = '';
  }
}
