// Lógica simple de clave de usuario (login modal)
window.authenticated = false;
function requireAuth(onSuccess) {
  if(window.authenticated) return onSuccess();
  showModalLogin(function() {
    window.authenticated = true;
    onSuccess();
  });
}
