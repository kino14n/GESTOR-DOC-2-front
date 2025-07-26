// auth.js actualizado para manejar correctamente callbacks

/**
 * Muestra el modal de login y ejecuta la función callback tras autenticación.
 * @param {Function} onSuccess - Función a ejecutar cuando el usuario se autentica.
 */
export function requireAuth(onSuccess) {
  const isLoggedIn = Boolean(localStorage.getItem('token')); // o tu lógica de auth
  if (isLoggedIn) {
    // Ya autenticado: ejecuta callback directamente
    if (typeof onSuccess === 'function') onSuccess();
  } else {
    // No autenticado: mostrar modal
    const loginModal = document.getElementById('loginModal');
    const loginButton = document.getElementById('loginButton');
    const closeBtn = loginModal.querySelector('.close-modal');

    // Abrir modal
    loginModal.classList.remove('hidden');

    // Manejar clic de login
    const handleLogin = () => {
      // Lógica real de login (API, validaciones...)
      // Si login OK:
      localStorage.setItem('token', 'tu_token');
      loginModal.classList.add('hidden');
      // Ejecutar el callback
      if (typeof onSuccess === 'function') onSuccess();
      // Limpiar listeners
      loginButton.removeEventListener('click', handleLogin);
      closeBtn.removeEventListener('click', handleClose);
    };

    // Manejar cierre de modal sin login
    const handleClose = () => {
      loginModal.classList.add('hidden');
      loginButton.removeEventListener('click', handleLogin);
      closeBtn.removeEventListener('click', handleClose);
    };

    loginButton.addEventListener('click', handleLogin);
    closeBtn.addEventListener('click', handleClose);
  }
}
