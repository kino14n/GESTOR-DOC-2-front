// js/auth.js

/**
 * requireAuth muestra siempre el overlay de login y, tras introducir "111",
 * oculta el overlay, guarda en localStorage y ejecuta el callback onSuccess().
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

  // Cada recarga limpia el token para forzar nueva validación
  localStorage.removeItem('token');

  // Función interna para mostrar la app
  const showApp = () => {
    loginOverlay.classList.add('hidden');
    mainContent.classList.remove('hidden');
  };

  // Mostrar overlay y ocultar mensaje de error
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
      accessInput.value = '';
      accessInput.focus();
    }
  });
}
