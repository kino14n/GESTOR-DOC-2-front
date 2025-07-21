// Notificaciones visuales azules
function showToast(msg, ok=true) {
  const el = document.createElement('div');
  el.className = 'fixed top-8 left-1/2 -translate-x-1/2 px-6 py-2 rounded-xl shadow-lg z-50 ' + (ok ? 'bg-blue-500 text-white' : 'bg-red-500 text-white');
  el.innerText = msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 2500);
}
