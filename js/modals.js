// GESTOR-DOC/frontend/js/modals.js

// Variables globales para almacenar los callbacks
let currentOnConfirmCallback = null;
let currentOnLoginSuccessCallback = null;

// Función para mostrar el modal de inicio de sesión
export function showModalLogin(onSuccess) {
  const modalsContainer = document.getElementById('modals');
  if (!modalsContainer) {
      console.error('showModalLogin: Contenedor #modals no encontrado.');
      return;
  }
  modalsContainer.innerHTML = ''; // Limpiar cualquier modal/contenido anterior
  currentOnLoginSuccessCallback = onSuccess; // Almacenar el callback

  console.log('showModalLogin: Preparando para mostrar modal de login.');

  const html = `
    <div class="overlay" id="loginOverlay">
        <div class="modal">
        <h3>Ingrese clave de administrador</h3>
        <input type="password" id="accessInput" class="w-full border p-2 mb-2" />
        <button id="submitAccess" class="btn btn--primary w-full">Entrar</button>
        </div>
    </div>
  `;
  modalsContainer.innerHTML = html; // Insertar el HTML del modal

  const loginOverlay = document.getElementById('loginOverlay');
  const accessInput = document.getElementById('accessInput');
  const submitAccessButton = document.getElementById('submitAccess');

  if (loginOverlay && accessInput && submitAccessButton) {
      loginOverlay.classList.remove('hidden'); // Asegurarse de que sea visible
      console.log('showModalLogin: Modal de login agregado al DOM y visible.');

      // *** LÓGICA DE ONCLICK DIRECTO PARA EL BOTÓN DE LOGIN ***
      submitAccessButton.onclick = () => {
          const clave = accessInput.value;
          console.log('showModalLogin: Clic en Entrar detectado. Clave:', clave); // LOG CLAVE DEPURACIÓN
          
          // ¡REVISA Y CAMBIA ESTA CLAVE SEGÚN SEA NECESARIO!
          if(clave === '111') { // <-- ¡VERIFICA QUE ESTA CLAVE COINCIDA!
              console.log('showModalLogin: Clave correcta. Ocultando modal.');
              modalsContainer.innerHTML = ''; // Eliminar contenido del modal
              loginOverlay.classList.add('hidden'); // Asegurar ocultamiento
              if (typeof currentOnLoginSuccessCallback === 'function') {
                  currentOnLoginSuccessCallback();
                  console.log('showModalLogin: Callback de éxito de login ejecutado.');
              }
          } else {
              console.log('showModalLogin: Clave incorrecta.');
              alert('Clave incorrecta'); // Puedes usar showToast aquí si prefieres
          }
      };
      // Opcional: listener para Enter en el input
      accessInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
              submitAccessButton.click();
          }
      });

  } else {
      console.error('showModalLogin: Elementos del modal de login no encontrados o incompletos después de inyección.');
  }
}

// Función para mostrar el modal de confirmación
export function showModalConfirm(message, onConfirm) {
  const modalsContainer = document.getElementById('modals');
  if (!modalsContainer) {
      console.error('showModalConfirm: Contenedor #modals no encontrado.');
      return;
  }
  modalsContainer.innerHTML = ''; // Limpiar cualquier modal/contenido anterior
  currentOnConfirmCallback = onConfirm; // Almacenar el callback

  console.log('showModalConfirm: Preparando para crear modal de confirmación.');

  const html = `
    <div class="overlay" id="confirmOverlay">
        <div class="modal">
        <p>${message}</p>
        <button id="confirmOk" class="btn btn--primary mr-2">Aceptar</button>
        <button id="confirmCancel" class="btn btn--secondary">Cancelar</button>
        </div>
    </div>
  `;
  modalsContainer.innerHTML = html; // Insertar el HTML del modal

  const confirmOverlay = document.getElementById('confirmOverlay');
  const confirmOkButton = document.getElementById('confirmOk');
  const confirmCancelButton = document.getElementById('confirmCancel');

  if (confirmOverlay && confirmOkButton && confirmCancelButton) {
      confirmOverlay.classList.remove('hidden'); // Asegurarse de que sea visible
      console.log('showModalConfirm: Modal de confirmación agregado al DOM y visible.');

      // *** LÓGICA DE ONCLICK DIRECTO PARA BOTONES DE CONFIRMACIÓN ***
      confirmOkButton.onclick = () => {
          console.log('showModalConfirm: Clic en Aceptar detectado.'); // LOG CLAVE
          modalsContainer.innerHTML = ''; // Limpiar el modal del DOM
          confirmOverlay.classList.add('hidden'); // Asegurar ocultamiento
          if (typeof currentOnConfirmCallback === 'function') {
              currentOnConfirmCallback();
              console.log('showModalConfirm: Callback onConfirm ejecutado.');
          }
          currentOnConfirmCallback = null;
      };

      confirmCancelButton.onclick = () => {
          console.log('showModalConfirm: Clic en Cancelar detectado.'); // LOG CLAVE
          modalsContainer.innerHTML = ''; // Limpiar el modal del DOM
          confirmOverlay.classList.add('hidden'); // Asegurar ocultamiento
          currentOnConfirmCallback = null;
      };

  } else {
      console.error('showModalConfirm: Elementos del modal de confirmación no encontrados o incompletos.');
  }
}

// *** IMPORTANTE: Eliminar el listener de delegación si estaba aquí, ya no es necesario ***
// document.addEventListener('DOMContentLoaded', ...) este bloque DEBE ELIMINARSE si estaba aquí antes.
// Porque los eventos ahora se adjuntan directamente en las funciones showModalLogin/Confirm.

// Si usabas DOMContentLoaded para otras cosas en modals.js,
// asegúrate de que esas otras cosas se muevan a main.js o un script apropiado.
// En esta versión, no hay DOMContentLoaded en modals.js.

// Asegúrate de que esta línea no duplique la definición en main.js
// y que el showToast sea accesible.
// showToast no se define aquí, solo se usa si ya está global.