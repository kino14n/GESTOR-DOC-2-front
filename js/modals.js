// GESTOR-DOC/frontend/js/modals.js

export function showModalLogin(onSuccess) {
  const modalsContainer = document.getElementById('modals');
  if (!modalsContainer) {
      console.error('Contenedor #modals no encontrado para showModalLogin.');
      return;
  }
  modalsContainer.innerHTML = ''; // Limpiar cualquier modal anterior

  const html = `
    <div class="overlay" id="loginOverlay">
        <div class="modal">
        <h3>Ingrese clave de administrador</h3>
        <input type="password" id="accessInput" class="w-full border p-2 mb-2" />
        <button id="submitAccess" class="btn btn--primary w-full">Entrar</button>
        </div>
    </div>
  `;
  modalsContainer.innerHTML = html;

  const accessInput = document.getElementById('accessInput');
  const submitAccessButton = document.getElementById('submitAccess');
  const loginOverlay = document.getElementById('loginOverlay');

  if (submitAccessButton && accessInput && loginOverlay) {
      submitAccessButton.addEventListener('click', () => {
          const clave = accessInput.value;
          if(clave === '111'){ // <<-- CAMBIA 'tuClaveAdmin' POR TU CLAVE REAL
              modalsContainer.innerHTML = ''; // Limpiar el modal
              loginOverlay.classList.add('hidden'); // Ocultar overlay
              if(typeof onSuccess === 'function') onSuccess();
          } else {
              alert('Clave incorrecta'); 
          }
      });
      loginOverlay.classList.remove('hidden'); // Asegurarse de que el overlay sea visible
  } else {
      console.error('showModalLogin: Elementos del modal de login no encontrados o incompletos.');
  }
}

export function showModalConfirm(message, onConfirm) {
  const modalsContainer = document.getElementById('modals');
  if (!modalsContainer) {
      console.error('Contenedor #modals no encontrado para showModalConfirm.');
      return;
  }
  modalsContainer.innerHTML = ''; // ¡MUY IMPORTANTE! Limpiar cualquier modal o overlay anterior

  const html = `
    <div class="overlay" id="confirmOverlay">
        <div class="modal"> <p>${message}</p>
        <button id="confirmOk" class="btn btn--primary mr-2">Aceptar</button>
        <button id="confirmCancel" class="btn btn--secondary">Cancelar</button>
        </div>
    </div>
  `;
  modalsContainer.innerHTML = html;

  const confirmOkButton = document.getElementById('confirmOk');
  const confirmCancelButton = document.getElementById('confirmCancel');
  const confirmOverlay = document.getElementById('confirmOverlay');

  console.log('showModalConfirm: Modal de confirmación mostrado.'); // LOG: Modal visible
  console.log('showModalConfirm: Botón Aceptar encontrado:', confirmOkButton); // LOG: Se encontró el botón "Aceptar"
  console.log('showModalConfirm: Botón Cancelar encontrado:', confirmCancelButton); // LOG: Se encontró el botón "Cancelar"

  if (confirmOkButton && confirmOverlay) {
    confirmOkButton.addEventListener('click', () => {
      console.log('showModalConfirm: ¡Clic en Aceptar detectado!'); // LOG CLAVE: Si este no aparece, el clic no llega
      // Ocultar el modal inmediatamente al hacer clic
      modalsContainer.innerHTML = ''; 
      confirmOverlay.classList.add('hidden'); 

      if (typeof onConfirm === 'function') {
        onConfirm(); 
        console.log('showModalConfirm: Callback onConfirm ejecutado (procediendo con eliminación).'); // LOG: Callback ejecutado
      } else {
        console.warn('showModalConfirm: onConfirm no es una función, no se puede ejecutar callback.');
      }
    });
  } else {
    console.error('showModalConfirm: Elementos del botón "Aceptar" o overlay no encontrados en el DOM.');
  }

  if (confirmCancelButton && confirmOverlay) {
    confirmCancelButton.addEventListener('click', () => {
      console.log('showModalConfirm: Clic en Cancelar detectado.'); // LOG: Clic en Cancelar
      modalsContainer.innerHTML = ''; 
      confirmOverlay.classList.add('hidden'); 
    });
  } else {
    console.error('showModalConfirm: Elementos del botón "Cancelar" o overlay no encontrados en el DOM.');
  }
  
  // Asegurarse de que el overlay sea visible
  confirmOverlay.classList.remove('hidden');
}