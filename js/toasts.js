// GESTOR-DOC/frontend/js/toasts.js

export function showToast(message, success = true) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${success ? 'bg-blue-600' : 'bg-red-600'}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}