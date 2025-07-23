
export function showModalLogin(onSuccess) {
  const html = `
    <div class="modal" id="modal-login">
      <h3>Ingrese clave de administrador</h3>
      <input type="password" id="clave-admin" class="w-full border p-2 mb-2" />
      <button id="loginBtn" class="btn btn--primary w-full">Entrar</button>
    </div>
  `;
  document.getElementById('modals').innerHTML = html;

  document.getElementById('loginBtn').onclick = () => {
    const clave = document.getElementById('clave-admin').value;
    if(clave === 'tuClaveAdmin'){
      document.getElementById('modals').innerHTML = '';
      if(typeof onSuccess === 'function') onSuccess();
    } else {
      alert('Clave incorrecta');
    }
  };
}
