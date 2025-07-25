// GESTOR-DOC/frontend/js/auth.js

import { showModalLogin } from './modals.js'; // ¡Esta línea es la nueva importación necesaria!

let isAuthenticated = false;

export function requireAuth(callback) {
  if(isAuthenticated){
    callback();
  } else {
    // Ahora showModalLogin estará definida aquí
    showModalLogin(() => {
      isAuthenticated = true;
      callback();
    });
  }
}