// GESTOR-DOC/frontend/js/modals.js

// Variables globales para almacenar los callbacks que se ejecutarán cuando se confirmen los modales
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
  currentOnLoginSuccessCallback = onSuccess; // Almacenar el callback de éxito

  console.log('showModalLogin: Preparando para mostrar modal de login.'); // LOG DE INICIO

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
  if (loginOverlay) {
      loginOverlay.classList.remove('hidden'); // Asegurarse de que sea visible al mostrarlo
      console.log('showModalLogin: Modal de login agregado al DOM y visible.'); // LOG DE VISIBILIDAD
  } else {
      console.error('showModalLogin: Overlay de login no encontrado después de inyectar HTML.');
  }
}

// Función para mostrar el modal de confirmación (sin cambios si ya funcionaba)
export function showModalConfirm(message, onConfirm) {
  const modalsContainer = document.getElementById('modals');
  if (!modalsContainer) {
      console.error('showModalConfirm: Contenedor #modals no encontrado.');
      return;
  }
  modalsContainer.innerHTML = ''; 
  currentOnConfirmCallback = onConfirm; 

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
  modalsContainer.innerHTML = html; 

  const confirmOverlay = document.getElementById('confirmOverlay');
  if (confirmOverlay) {
      confirmOverlay.classList.remove('hidden'); 
      console.log('showModalConfirm: Modal de confirmación agregado al DOM y visible.');
  } else {
      console.error('showModalConfirm: Overlay de confirmación no encontrado después de inyectar HTML.');
  }
}

// *** DELEGACIÓN DE EVENTOS EN EL CONTENEDOR PRINCIPAL (#modals) ***
document.addEventListener('DOMContentLoaded', () => {
    const modalsContainer = document.getElementById('modals');
    if (!modalsContainer) {
        console.error('DOMContentLoaded: Contenedor #modals no encontrado. Los eventos de modal no funcionarán.');
        return;
    }

    modalsContainer.addEventListener('click', (event) => {
        const target = event.target; 

        // Manejar botones del modal de Confirmación
        if (target.id === 'confirmOk' || target.id === 'confirmCancel') {
            console.log('Delegación: Clic en botón de confirmación detectado. ID:', target.id); // LOG DE CLIC
            const confirmOverlay = document.getElementById('confirmOverlay');
            if (confirmOverlay) {
                confirmOverlay.classList.add('hidden'); 
            }
            modalsContainer.innerHTML = ''; 

            if (target.id === 'confirmOk') {
                console.log('Delegación: Click en Aceptar del modal de confirmación.');
                if (currentOnConfirmCallback && typeof currentOnConfirmCallback === 'function') {
                    currentOnConfirmCallback(); 
                    console.log('Delegación: Callback onConfirm ejecutado.');
                }
            } else { 
                console.log('Delegación: Click en Cancelar del modal de confirmación.');
            }
            currentOnConfirmCallback = null; 
        }
        
        // Manejar botones del modal de Login
        else if (target.id === 'submitAccess') {
            console.log('Delegación: Click en botón de login "Entrar" detectado.'); // LOG DE CLIC EN LOGIN
            const accessInput = document.getElementById('accessInput');
            const clave = accessInput ? accessInput.value : '';
            console.log('Delegación: Clave ingresada:', clave); // LOG DE CLAVE INGRESADA
            
            // ¡REVISA Y CAMBIA ESTA CLAVE SEGÚN SEA NECESARIO!
            if(clave === '111') { 
                console.log('Delegación: Clave correcta. Ocultando modal de login.'); // LOG DE CLAVE CORRECTA
                const loginOverlay = document.getElementById('loginOverlay');
                if (loginOverlay) {
                    loginOverlay.classList.add('hidden'); 
                }
                modalsContainer.innerHTML = ''; // Eliminar contenido del modal
                if (currentOnLoginSuccessCallback && typeof currentOnLoginSuccessCallback === 'function') {
                    currentOnLoginSuccessCallback();
                    console.log('Delegación: Callback onLoginSuccess ejecutado.');
                }
            } else {
                console.log('Delegación: Clave incorrecta.'); // LOG DE CLAVE INCORRECTA
                alert('Clave incorrecta'); 
            }
            currentOnLoginSuccessCallback = null;
        }
    });
    console.log('DOMContentLoaded: Listener de delegación de modales adjuntado a #modals.');
});