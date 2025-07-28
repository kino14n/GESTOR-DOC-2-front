// js/auth.js

/**
 * requireAuth muestra el overlay de login y, tras introducir "111",
 * oculta el overlay y ejecuta el callback para continuar con la app.
 */
export function requireAuth(onSuccess) {
  const loginOverlay  = document.getElementById('loginOverlay');
  const accessInput   = document.getElementById('accessInput');
  const submitAccess  = document.getElementById('submitAccess');
  const errorMsg      = document.getElementById('errorMsg');
  const mainContent   = document.getElementById('mainContent');

  if (!loginOverlay || !accessInput || !submitAccess || !errorMsg || !mainContent) {
    console.error('❌ Elementos de autenticación no encontrados en el DOM');
    return;
  }

  // **Eliminamos el auto-login para que siempre pida clave:**
  // if (localStorage.getItem('token') === '111') {
  //   showApp();
  //   onSuccess();
  //   return;
  // }

  // Función para mostrar la app y ocultar el login
  const showApp = () => {
    loginOverlay.classList.add('hidden');
    mainContent.classList.remove('hidden');
  };

  // Cada recarga limpia el token para forzar nueva validación
  localStorage.removeItem('token');

  // Caso inicial: mostramos overlay y ocultamos mensaje de error
  loginOverlay.classList.remove('hidden');
  errorMsg.classList.add('hidden');

  submitAccess.addEventListener('click', () => {
    const val = accessInput.value.trim();
    if (val === '111') {
      localStorage.setItem('token', val);
      showApp();
      onSuccess();
    } else {
      errorMsg.textContent = 'Número incorrecto. Intente de nuevo.';
      errorMsg.classList.remove('hidden');
    }
  });
}
