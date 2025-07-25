export function showModalLogin(onSuccess) {
  const html = `
    <div class="modal" id="modal-login">
      <h3>Ingrese clave de administrador</h3>
      <input type="password" id="clave-admin" class="w-full border p-2 mb-2" />
      <button id="loginBtn" class="btn btn--primary w-full">Entrar</button>
    </div>
  `;
  document.getElementById('modals').innerHTML = html;

  document.getElementById('loginBtn').onclick = () => {
    const clave = document.getElementById('clave-admin').value;
    if(clave === '111'){
      document.getElementById('modals').innerHTML = '';
      if(typeof onSuccess === 'function') onSuccess();
    } else {
      alert('Clave incorrecta');
    }
  };
}

export function showModalConfirm(message, onConfirm) {
  const html = `
    <div class="modal" id="modal-confirm">
      <p>${message}</p>
      <button id="confirmOk" class="btn btn--primary mr-2">Aceptar</button>
      <button id="confirmCancel" class="btn btn--secondary">Cancelar</button>
    </div>
  `;
  document.getElementById('modals').innerHTML = html;

  document.getElementById('confirmOk').onclick = () => {
    document.getElementById('modals').innerHTML = '';
    if (typeof onConfirm === 'function') onConfirm();
  };

  document.getElementById('confirmCancel').onclick = () => {
    document.getElementById('modals').innerHTML = '';
  };
}
