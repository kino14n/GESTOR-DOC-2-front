// GESTOR-DOC/frontend/js/modals.js

// Variables globales para almacenar los callbacks que se ejecutarán cuando se confirmen los modales
let currentOnConfirmCallback = null;
let currentOnLoginSuccessCallback = null;

// Función para mostrar el modal de inicio de sesión
export function showModalLogin(onSuccess) {
  const modalsContainer = document.getElementById('modals');
  if (!modalsContainer) {
      console.error('Contenedor #modals no encontrado para showModalLogin. (Importante para eventos)');
      return;
  }
  modalsContainer.innerHTML = ''; 
  currentOnLoginSuccessCallback = onSuccess; 

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

  const loginOverlay = document.getElementById('loginOverlay');
  if (loginOverlay) {
      loginOverlay.classList.remove('hidden'); 
      console.log('showModalLogin: Modal de login mostrado y visible.');
  } else {
      console.error('showModalLogin: Overlay de login no encontrado después de inyectar HTML.');
  }
}

// Función para mostrar el modal de confirmación
export function showModalConfirm(message, onConfirm) {
  const modalsContainer = document.getElementById('modals');
  if (!modalsContainer) {
      console.error('Contenedor #modals no encontrado para showModalConfirm. (Importante para eventos)');
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
            const confirmOverlay = document.getElementById('confirmOverlay');
            if (confirmOverlay) {
                confirmOverlay.classList.add('hidden'); 
            }
            modalsContainer.innerHTML = ''; 

            if (target.id === 'confirmOk') {
                console.log('Delegación: ¡Clic en Aceptar del modal de confirmación detectado!');
                if (currentOnConfirmCallback && typeof currentOnConfirmCallback === 'function') {
                    currentOnConfirmCallback(); 
                    console.log('Delegación: Callback onConfirm ejecutado.');
                }
            } else { 
                console.log('Delegación: Clic en Cancelar del modal de confirmación detectado.');
            }
            currentOnConfirmCallback = null; 
        }
        
        // Manejar botones del modal de Login
        else if (target.id === 'submitAccess') {
            const loginOverlay = document.getElementById('loginOverlay');
            if (loginOverlay) {
                loginOverlay.classList.add('hidden'); 
            }
            modalsContainer.innerHTML = ''; 

            console.log('Delegación: Clic en Entrar del modal de login detectado!');
            const accessInput = document.getElementById('accessInput');
            const clave = accessInput ? accessInput.value : '';
            
            if (clave === '111') { 
                if (currentOnLoginSuccessCallback && typeof currentOnLoginSuccessCallback === 'function') {
                    currentOnLoginSuccessCallback();
                    console.log('Delegación: Callback onLoginSuccess ejecutado.');
                }
            } else {
                alert('Clave incorrecta'); 
            }
            currentOnLoginSuccessCallback = null;
        }
    });
    console.log('DOMContentLoaded: Listener de delegación de modales adjuntado a #modals.');
});