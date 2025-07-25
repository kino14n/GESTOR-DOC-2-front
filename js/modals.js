// GESTOR-DOC/frontend/js/modals.js

export function showModalLogin(onSuccess) {
  const html = `
    <div class="overlay" id="loginOverlay"> <div class="modal" id="modal-login">
        <h3>Ingrese clave de administrador</h3>
        <input type="password" id="accessInput" class="w-full border p-2 mb-2" /> <button id="submitAccess" class="btn btn--primary w-full">Entrar</button> </div>
    </div>
  `;
  // Insertar el HTML del modal en el contenedor de modales dinámicos
  document.getElementById('modals').innerHTML = html;

  const accessInput = document.getElementById('accessInput');
  const submitAccessButton = document.getElementById('submitAccess');
  const loginOverlay = document.getElementById('loginOverlay'); // Obtener el overlay

  if (submitAccessButton && accessInput && loginOverlay) {
      submitAccessButton.addEventListener('click', () => {
          const clave = accessInput.value;
          // ¡AQUÍ ESTÁ LA CLAVE DE ADMINISTRADOR! Cámbiála por la que quieras.
          if(clave === 'tuClaveAdmin'){ // <<-- CAMBIA 'tuClaveAdmin' POR TU CLAVE REAL
              document.getElementById('modals').innerHTML = ''; // Limpiar el modal
              loginOverlay.classList.add('hidden'); // Asegurarse de que el overlay se oculte
              if(typeof onSuccess === 'function') onSuccess();
          } else {
              alert('Clave incorrecta'); // Usar alert simple por ahora
              // También podrías mostrar un toast de error si lo prefieres
              // showToast('Clave incorrecta', false);
          }
      });
      // Mostrar el overlay (ya debería estar display:flex por defecto si no tiene hidden)
      loginOverlay.classList.remove('hidden');
  } else {
      console.error('showModalLogin: Elementos del modal de login no encontrados.');
  }
}

export function showModalConfirm(message, onConfirm) {
  const html = `
    <div class="overlay" id="confirmOverlay"> <div class="modal" id="modal-confirm">
        <p>${message}</p>
        <button id="confirmOk" class="btn btn--primary mr-2">Aceptar</button>
        <button id="confirmCancel" class="btn btn--secondary">Cancelar</button>
        </div>
    </div>
  `;
  document.getElementById('modals').innerHTML = html;

  const confirmOkButton = document.getElementById('confirmOk');
  const confirmCancelButton = document.getElementById('confirmCancel');
  const confirmOverlay = document.getElementById('confirmOverlay');

  console.log('showModalConfirm: Modal de confirmación mostrado.'); // LOG 1
  console.log('showModalConfirm: Botón Aceptar encontrado:', confirmOkButton); // LOG 2

  if (confirmOkButton && confirmOverlay) {
    confirmOkButton.addEventListener('click', () => {
      console.log('showModalConfirm: Botón Aceptar clicado.'); // LOG 3 (este es el que no aparece)
      document.getElementById('modals').innerHTML = ''; // Limpiar el modal (removerlo del DOM)
      confirmOverlay.classList.add('hidden'); // Asegurarse de que el overlay se oculte
      if (typeof onConfirm === 'function') {
        onConfirm(); // Ejecutar el callback de confirmación
        console.log('showModalConfirm: Callback onConfirm ejecutado.'); // LOG 4
      } else {
        console.warn('showModalConfirm: onConfirm no es una función.');
      }
    });
  } else {
    console.error('showModalConfirm: Botón "Aceptar" o overlay no encontrados en el DOM.');
  }

  if (confirmCancelButton && confirmOverlay) {
    confirmCancelButton.addEventListener('click', () => {
      console.log('showModalConfirm: Botón Cancelar clicado.'); // LOG 5
      document.getElementById('modals').innerHTML = ''; // Limpiar el modal
      confirmOverlay.classList.add('hidden'); // Asegurarse de que el overlay se oculte
    });
  }
  // Mostrar el overlay para que el modal sea visible
  confirmOverlay.classList.remove('hidden');
}