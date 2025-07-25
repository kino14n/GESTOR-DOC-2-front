// GESTOR-DOC/frontend/js/auth.js

import { showModalLogin } from './modals.js'; // Importación directa

let isAuthenticated = false; // Estado de autenticación inicial

export function requireAuth(callback) {
  if(isAuthenticated){
    callback(); // Si ya está autenticado, ejecuta el callback inmediatamente
  } else {
    // Si no está autenticado, muestra el modal de login y le pasa el callback
    showModalLogin(() => {
      isAuthenticated = true; // Marca como autenticado después del éxito del login
      callback(); // Ejecuta el callback original (ej. mostrar contenido principal)
    });
  }
}

// Nota: La persistencia de isAuthenticated con localStorage se manejará en main.js o en el callback.
// Si quieres persistencia, el callback de showModalLogin en main.js deberá llamar a localStorage.setItem.