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
  modalsContainer.innerHTML = ''; // Limpiar cualquier modal/contenido anterior
  currentOnLoginSuccessCallback = onSuccess; // Almacenar el callback de éxito

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

  // Asegurarse de que el overlay sea visible (la clase 'overlay' en CSS debe tener display:flex)
  const loginOverlay = document.getElementById('loginOverlay');
  if (loginOverlay) {
      loginOverlay.classList.remove('hidden');
      console.log('showModalLogin: Modal de login mostrado y visible.');
  } else {
      console.error('showModalLogin: Overlay de login no encontrado después de inyectar HTML.');
  }
  // Los listeners para 'submitAccess' se adjuntarán via delegación en DOMContentLoaded
}

// Función para mostrar el modal de confirmación
export function showModalConfirm(message, onConfirm) {
  const modalsContainer = document.getElementById('modals');
  if (!modalsContainer) {
      console.error('Contenedor #modals no encontrado para showModalConfirm. (Importante para eventos)');
      return;
  }
  modalsContainer.innerHTML = ''; // Limpiar cualquier modal/contenido anterior
  currentOnConfirmCallback = onConfirm; // Almacenar el callback de confirmación

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

  // Asegurarse de que el overlay sea visible
  const confirmOverlay = document.getElementById('confirmOverlay');
  if (confirmOverlay) {
      confirmOverlay.classList.remove('hidden');
      console.log('showModalConfirm: Modal de confirmación agregado al DOM y visible.');
  } else {
      console.error('showModalConfirm: Overlay de confirmación no encontrado después de inyectar HTML.');
  }
  // Los listeners para 'confirmOk' y 'confirmCancel' se adjuntarán via delegación en DOMContentLoaded
}

// *** DELEGACIÓN DE EVENTOS EN EL CONTENEDOR PRINCIPAL (#modals) ***
// Este listener se adjunta una única vez al cargar el DOM y permanece activo.
// Captura clics en cualquier parte del contenedor #modals y luego decide qué hacer
// basándose en el ID del elemento donde se originó el clic.
document.addEventListener('DOMContentLoaded', () => {
    const modalsContainer = document.getElementById('modals');
    if (!modalsContainer) {
        console.error('DOMContentLoaded: Contenedor #modals no encontrado. Los eventos de modal no funcionarán.');
        return;
    }

    modalsContainer.addEventListener('click', (event) => {
        const target = event.target; // El elemento específico en el que se hizo clic

        // Manejar botones del modal de Confirmación
        if (target.id === 'confirmOk') {
            console.log('Delegación: ¡Clic en Aceptar del modal de confirmación detectado!');
            modalsContainer.innerHTML = ''; // Limpiar el modal del DOM al hacer clic
            if (currentOnConfirmCallback && typeof currentOnConfirmCallback === 'function') {
                currentOnConfirmCallback(); // Ejecutar el callback almacenado
                console.log('Delegación: Callback onConfirm ejecutado.');
            }
            currentOnConfirmCallback = null; // Limpiar la referencia al callback
        } else if (target.id === 'confirmCancel') {
            console.log('Delegación: Clic en Cancelar del modal de confirmación detectado.');
            modalsContainer.innerHTML = ''; // Limpiar el modal del DOM al hacer clic
            currentOnConfirmCallback = null; // Limpiar la referencia al callback
        } 
        
        // Manejar botones del modal de Login
        else if (target.id === 'submitAccess') {
            console.log('Delegación: Clic en Entrar del modal de login detectado!');
            const accessInput = document.getElementById('accessInput'); // El input de clave dentro del modal de login
            const clave = accessInput ? accessInput.value : '';
            
            if (clave === 'tuClaveAdmin') { // Validar la clave (cambia 'tuClaveAdmin' en modals.js)
                modalsContainer.innerHTML = ''; // Limpiar el modal del DOM
                if (currentOnLoginSuccessCallback && typeof currentOnLoginSuccessCallback === 'function') {
                    currentOnLoginSuccessCallback();
                    console.log('Delegación: Callback onLoginSuccess ejecutado.');
                }
                currentOnLoginSuccessCallback = null;
            } else {
                alert('Clave incorrecta'); 
            }
        }
    });
    console.log('DOMContentLoaded: Listener de delegación de modales adjuntado a #modals.'); // LOG FINAL
});