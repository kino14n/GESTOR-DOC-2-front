// auth.js corregido con selectores genéricos y validación de clave
import { showToast } from './toasts.js';

/**
 * Muestra el modal de acceso y ejecuta el callback tras autenticación.
 * @param {Function} onSuccess - Función a ejecutar cuando el usuario ingresa clave correcta.
 */
export function requireAuth(onSuccess) {
  // Seleccionar el modal (fallback a clase .modal si no hay id)
  const loginModal = document.getElementById('loginModal') || document.querySelector('.modal');
  if (!loginModal) {
    console.error('Modal de login no encontrado.');
    return;
  }

  // Mostrar modal
  loginModal.classList.remove('hidden');

  // Seleccionar input y botón (basado en placeholder y texto)
  const accessInput = loginModal.querySelector('input') || loginModal.querySelector('input[placeholder]');
  const loginButton = loginModal.querySelector('button') || document.querySelector('button[type="submit"]');

  if (!accessInput || !loginButton) {
    console.error('Input o botón de acceso no encontrados.');
    return;
  }

  // Handler de login
  const handleLogin = () => {
    const value = accessInput.value.trim();
    // Validación simple: reemplaza 'TU_CLAVE' por la valor real o consulta a backend
    if (value === 'TU_CLAVE') {
      loginModal.classList.add('hidden');
      cleanup();
      if (typeof onSuccess === 'function') onSuccess();
    } else {
      showToast('Clave incorrecta', 'error');
    }
  };

  // Limpiar listeners
  function cleanup() {
    loginButton.removeEventListener('click', handleLogin);
  }

  loginButton.addEventListener('click', handleLogin);
}
