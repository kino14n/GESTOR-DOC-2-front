// GESTOR-DOC/frontend/js/auth.js

import { showModalLogin } from './modals.js'; 

// Leer el estado de autenticación desde localStorage al inicio
let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

export function requireAuth(callback) {
  if(isAuthenticated){
    callback();
  } else {
    // Si no está autenticado, muestra el modal de login
    showModalLogin(() => {
      isAuthenticated = true;
      localStorage.setItem('isAuthenticated', 'true'); // Guardar estado en localStorage
      callback();
    });
  }
}

// Opcional: Función para cerrar sesión y limpiar el estado
export function logout() {
  isAuthenticated = false;
  localStorage.removeItem('isAuthenticated');
  // Podrías recargar la página o redirigir al usuario aquí
  // window.location.reload(); 
}