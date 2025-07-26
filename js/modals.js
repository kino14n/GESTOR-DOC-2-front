// GESTOR-DOC/frontend/js/modals.js

export function showModalLogin(onSuccess) {
  const loginOverlay = document.getElementById('loginOverlay'); // Obtener el overlay de login que está en index.html
  const claveInput = document.getElementById('accessInput'); // Obtener el input de clave
  const loginButton = document.getElementById('submitAccess'); // Obtener el botón de login
  const errorMsgDiv = document.getElementById('errorMsg'); // Obtener el mensaje de error

  if (!loginOverlay || !claveInput || !loginButton || !errorMsgDiv) {
    console.error('showModalLogin: Elementos del modal de login no encontrados. Asegúrese de que estén en index.html con los IDs correctos.');
    return;
  }

  // Asegura que el modal sea visible
  loginOverlay.classList.remove('hidden'); // Hace visible el overlay del login
  errorMsgDiv.classList.add('hidden'); // Oculta el mensaje de error inicialmente
  claveInput.value = ''; // Limpia el input de clave
  claveInput.focus(); // Enfoca el input

  // Adjunta el evento onclick al botón de login
  loginButton.onclick = () => {
    console.log('showModalLogin: Clic en Entrar detectado.'); // LOG
    const clave = claveInput.value;
    
    // LA CLAVE DE ADMINISTRADOR ESTÁ AQUÍ. CÁMBIALA SI ES NECESARIO.
    if (clave === 'tuClaveAdmin') { // <-- ¡VERIFICA ESTA CLAVE!
      console.log('showModalLogin: Clave correcta. Ocultando modal.'); // LOG
      loginOverlay.classList.add('hidden'); // Ocultar el overlay de login
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
  claveInput.onkeypress = (e) => {
      if (e.key === 'Enter') {
          loginButton.click();
      }
  };
}

export function showModalConfirm(message, onConfirm) {
  const confirmOverlay = document.getElementById('confirmOverlay');
  const confirmOkButton = document.getElementById('confirmOk');
  const confirmCancelButton = document.getElementById('confirmCancel');
  const confirmMsgP = document.getElementById('confirmMsg'); 

  if (!confirmOverlay || !confirmOkButton || !confirmCancelButton || !confirmMsgP) {
    console.error('showModalConfirm: Elementos del modal de confirmación no encontrados. Asegúrese de que estén en index.html con los IDs correctos.');
    return;
  }

  confirmMsgP.textContent = message; // Actualiza el mensaje
  confirmOverlay.classList.remove('hidden'); // Hace visible el overlay de confirmación

  confirmOkButton.onclick = () => { 
    console.log('showModalConfirm: Clic en Aceptar detectado.'); 
    confirmOverlay.classList.add('hidden'); // Ocultar el overlay
    if (typeof onConfirm === 'function') {
      onConfirm(); 
    }
  };

  confirmCancelButton.onclick = () => { 
    console.log('showModalConfirm: Clic en Cancelar detectado.'); 
    confirmOverlay.classList.add('hidden'); // Ocultar el overlay
  };
}