// GESTOR-DOC/frontend/js/modals.js

export function showModalLogin(onSuccess) {
  const modalsContainer = document.getElementById('modals');
  if (!modalsContainer) {
      console.error('Contenedor #modals no encontrado para showModalLogin.');
      return;
  }
  modalsContainer.innerHTML = ''; 

  const overlay = document.createElement('div');
  overlay.id = 'loginOverlay';
  overlay.className = 'overlay'; 
  
  const modalDiv = document.createElement('div');
  modalDiv.className = 'modal';

  modalDiv.innerHTML = `
    <h3>Ingrese clave de administrador</h3>
    <input type="password" id="accessInput" class="w-full border p-2 mb-2" />
    <button id="submitAccess" class="btn btn--primary w-full">Entrar</button>
  `;
  
  overlay.appendChild(modalDiv);
  modalsContainer.appendChild(overlay);

  const accessInput = document.getElementById('accessInput');
  const submitAccessButton = document.getElementById('submitAccess');

  if (submitAccessButton && accessInput) {
      submitAccessButton.addEventListener('click', () => {
          const clave = accessInput.value;
          if(clave === 'tuClaveAdmin'){ // <<-- CAMBIA 'tuClaveAdmin' POR TU CLAVE REAL
              modalsContainer.innerHTML = ''; 
              overlay.classList.add('hidden'); 
              if(typeof onSuccess === 'function') onSuccess();
          } else {
              alert('Clave incorrecta'); 
          }
      });
      overlay.classList.remove('hidden');
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
  modalsContainer.innerHTML = ''; 

  console.log('showModalConfirm: Preparando para crear modal de confirmación.'); 

  const overlay = document.createElement('div');
  overlay.id = 'confirmOverlay';
  overlay.className = 'overlay'; 

  const modalDiv = document.createElement('div');
  modalDiv.className = 'modal';

  modalDiv.innerHTML = `
    <p>${message}</p>
    <button id="confirmOk" class="btn btn--primary mr-2">Aceptar</button>
    <button id="confirmCancel" class="btn btn--secondary">Cancelar</button>
  `;
  
  overlay.appendChild(modalDiv);
  modalsContainer.appendChild(overlay);

  const confirmOkButton = document.getElementById('confirmOk');
  const confirmCancelButton = document.getElementById('confirmCancel');

  console.log('showModalConfirm: Modal de confirmación agregado al DOM.'); 
  console.log('showModalConfirm: Botón Aceptar obtenido:', confirmOkButton); 
  console.log('showModalConfirm: Botón Cancelar obtenido:', confirmCancelButton); 

  if (confirmOkButton) {
    confirmOkButton.addEventListener('click', () => {
      console.log('showModalConfirm: ¡Clic en Aceptar detectado!'); 
      modalsContainer.innerHTML = ''; 
      overlay.classList.add('hidden'); 

      if (typeof onConfirm === 'function') {
        onConfirm(); 
        console.log('showModalConfirm: Callback onConfirm ejecutado.'); 
      } else {
        console.warn('showModalConfirm: onConfirm no es una función.');
      }
    });
  } else {
    console.error('showModalConfirm: Botón "Aceptar" no encontrado DESPUÉS de crearlo.');
  }

  if (confirmCancelButton) {
    confirmCancelButton.addEventListener('click', () => {
      console.log('showModalConfirm: Clic en Cancelar detectado.'); 
      modalsContainer.innerHTML = ''; 
      overlay.classList.add('hidden'); 
    });
  } else {
    console.error('showModalConfirm: Botón "Cancelar" no encontrado DESPUÉS de crearlo.');
  }
  overlay.classList.remove('hidden');
}