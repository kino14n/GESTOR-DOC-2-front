// GESTOR-DOC/frontend/js/modals.js

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
    if(clave === 'tuClaveAdmin'){ // <<-- CAMBIA 'tuClaveAdmin' POR TU CLAVE REAL
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

  const confirmOkButton = document.getElementById('confirmOk');
  const confirmCancelButton = document.getElementById('confirmCancel');

  console.log('showModalConfirm: Modal de confirmación mostrado.'); // LOG 1
  console.log('showModalConfirm: Botón Aceptar encontrado:', confirmOkButton); // LOG 2

  // Usar addEventListener en lugar de onclick directamente para más robustez
  if (confirmOkButton) {
    confirmOkButton.addEventListener('click', () => {
      console.log('showModalConfirm: Botón Aceptar clicado.'); // LOG 3
      document.getElementById('modals').innerHTML = ''; // Ocultar modal
      if (typeof onConfirm === 'function') {
        onConfirm(); // Ejecutar el callback de confirmación (la lógica de eliminación)
        console.log('showModalConfirm: Callback onConfirm ejecutado.'); // LOG 4
      } else {
        console.warn('showModalConfirm: onConfirm no es una función.');
      }
    });
  } else {
    console.error('showModalConfirm: Botón "Aceptar" no encontrado en el DOM.');
  }

  if (confirmCancelButton) {
    confirmCancelButton.addEventListener('click', () => {
      console.log('showModalConfirm: Botón Cancelar clicado.'); // LOG 5
      document.getElementById('modals').innerHTML = ''; // Ocultar modal
    });
  }
}