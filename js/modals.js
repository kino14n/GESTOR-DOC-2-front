// GESTOR-DOC/frontend/js/modals.js

export function showModalLogin(onSuccess) {
  const modalsContainer = document.getElementById('modals'); // Contenedor global de modales
  if (!modalsContainer) {
    console.error('showModalLogin: Contenedor #modals no encontrado.');
    return;
  }
  // Inyecta el HTML del modal de login directamente en el contenedor #modals
  modalsContainer.innerHTML = `
    <div class="overlay" id="loginOverlay">
      <div class="modal">
        <h3>Ingrese clave de administrador</h3>
        <input type="password" id="clave-admin" class="w-full border p-2 mb-2" />
        <button id="loginBtn" class="btn btn--primary w-full">Entrar</button>
        <p id="errorMsg" class="mt-2 text-red-500 hidden">Clave incorrecta.</p>
      </div>
    </div>
  `;

  // Obtiene referencias a los elementos del modal recién inyectado
  const loginOverlay = document.getElementById('loginOverlay');
  const claveInput = document.getElementById('clave-admin');
  const loginButton = document.getElementById('loginBtn');
  const errorMsgDiv = document.getElementById('errorMsg');

  // Asegura que el modal sea visible
  if (loginOverlay) {
    loginOverlay.classList.remove('hidden'); // Hace visible el overlay
  }

  // Adjunta el evento onclick al botón de login
  if (loginButton && claveInput && errorMsgDiv) {
    loginButton.onclick = () => {
      console.log('showModalLogin: Clic en Entrar detectado.'); // LOG
      const clave = claveInput.value;
      
      // La clave de administrador está aquí. Cámbiala si es necesario.
      if (clave === '111') { // <-- ¡VERIFICA ESTA CLAVE!
        console.log('showModalLogin: Clave correcta. Ocultando modal.'); // LOG
        modalsContainer.innerHTML = ''; // Limpia el HTML del modal para removerlo
        // loginOverlay.classList.add('hidden'); // Opcional, si el innerHTML no lo quita
        if (typeof onSuccess === 'function') {
          onSuccess(); // Ejecuta el callback de éxito
        }
      } else {
        console.log('showModalLogin: Clave incorrecta.'); // LOG
        errorMsgDiv.classList.remove('hidden'); // Muestra mensaje de error
        claveInput.value = ''; // Limpia el input
        claveInput.focus(); // Enfoca el input
      }
    };
    // Permite presionar Enter en el campo de clave
    claveInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });
  } else {
    console.error('showModalLogin: Elementos del modal de login no encontrados para adjuntar eventos.');
  }
}

export function showModalConfirm(message, onConfirm) {
  const modalsContainer = document.getElementById('modals');
  if (!modalsContainer) {
    console.error('showModalConfirm: Contenedor #modals no encontrado.');
    return;
  }
  modalsContainer.innerHTML = ''; 

  // Inyecta el HTML del modal de confirmación
  modalsContainer.innerHTML = `
    <div class="overlay" id="confirmOverlay">
      <div class="modal">
        <p>${message}</p>
        <button id="confirmOk" class="btn btn--primary mr-2">Aceptar</button>
        <button id="confirmCancel" class="btn btn--secondary">Cancelar</button>
      </div>
    </div>
  `;

  // Obtiene referencias a los elementos del modal recién inyectado
  const confirmOverlay = document.getElementById('confirmOverlay');
  const confirmOkButton = document.getElementById('confirmOk');
  const confirmCancelButton = document.getElementById('confirmCancel');

  // Asegura que el modal sea visible
  if (confirmOverlay) {
    confirmOverlay.classList.remove('hidden');
  }

  // Adjunta eventos onclick a los botones
  if (confirmOkButton && confirmCancelButton) {
    confirmOkButton.onclick = () => {
      console.log('showModalConfirm: Clic en Aceptar detectado.'); // LOG
      modalsContainer.innerHTML = ''; // Remueve el modal
      // confirmOverlay.classList.add('hidden'); // Opcional si innerHTML ya lo remueve
      if (typeof onConfirm === 'function') {
        onConfirm(); // Ejecuta el callback de confirmación
      }
    };

    confirmCancelButton.onclick = () => {
      console.log('showModalConfirm: Clic en Cancelar detectado.'); // LOG
      modalsContainer.innerHTML = ''; // Remueve el modal
      // confirmOverlay.classList.add('hidden'); // Opcional
    };
  } else {
    console.error('showModalConfirm: Elementos del modal de confirmación no encontrados para adjuntar eventos.');
  }
}