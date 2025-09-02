/* ============================================================
 * upload.js - Gestor de Documentos (frontend)
 * ------------------------------------------------------------
 * - Lee nombre, fecha, archivo PDF y códigos.
 * - Normaliza la fecha a YYYY-MM-DD (acepta múltiples formatos).
 * - Envía FormData al backend /api/documentos/upload.
 * - Muestra toasts de éxito/error.
 * ============================================================ */

/* =========================
 * Configuración del API
 * =========================
 * Puedes ajustar API_BASE si usas un dominio distinto.
 * Por defecto usa ruta relativa (mismo host/gh-pages) hacia el backend.
 */
const API_BASE =
  window.API_BASE ||
  (typeof getApiBase === "function" ? getApiBase() : "") || // por si existe api.js con getApiBase()
  ""; // relativo (ej. https://gestor-doc-backend-production.up.railway.app proxied con /api)

/* =========================
 * Utilidades UI (toasts)
 * ========================= */
function createToastContainer() {
  let c = document.getElementById("toast-container");
  if (!c) {
    c = document.createElement("div");
    c.id = "toast-container";
    c.style.position = "fixed";
    c.style.top = "20px";
    c.style.right = "20px";
    c.style.zIndex = "9999";
    c.style.display = "flex";
    c.style.flexDirection = "column";
    c.style.gap = "10px";
    document.body.appendChild(c);
  }
  return c;
}

function showToast(message, type = "error", timeout = 4000) {
  const container = createToastContainer();
  const box = document.createElement("div");
  box.style.minWidth = "260px";
  box.style.maxWidth = "360px";
  box.style.padding = "14px 16px";
  box.style.borderRadius = "10px";
  box.style.boxShadow = "0 10px 20px rgba(0,0,0,.12)";
  box.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  box.style.fontSize = "14px";
  box.style.lineHeight = "1.2";
  box.style.color = "#fff";
  box.style.border = "1px solid transparent";
  box.style.background =
    type === "success" ? "#16a34a" : type === "warn" ? "#f59e0b" : "#dc2626";
  box.textContent = message;
  container.appendChild(box);
  setTimeout(() => {
    box.style.transition = "opacity .25s ease";
    box.style.opacity = "0";
    setTimeout(() => container.removeChild(box), 300);
  }, timeout);
}

/* =========================
 * Normalización de fechas
 * =========================
 * Devuelve YYYY-MM-DD o null si no puede convertir.
 */
function normalizeDate(inputValue) {
  if (!inputValue) return null;
  const raw = String(inputValue).trim();

  // Si ya viene en ISO (value de <input type="date">)
  // Chrome/Safari/Edge envían exactamente YYYY-MM-DD
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (isoMatch) return raw;

  const tryParse = (str, fmt) => {
    // fmt: "DMY", "MDY" con separador "/" o "-"
    const sep = str.includes("/") ? "/" : "-";
    const parts = str.split(sep).map((x) => x.trim());
    if (parts.length !== 3) return null;

    let d, m, y;
    if (fmt === "DMY") {
      [d, m, y] = parts;
    } else if (fmt === "MDY") {
      [m, d, y] = parts;
    } else {
      return null;
    }
    if (!/^\d{1,2}$/.test(d) || !/^\d{1,2}$/.test(m) || !/^\d{4}$/.test(y)) {
      return null;
    }
    // Normalizar con ceros a la izquierda
    const dd = d.padStart(2, "0");
    const mm = m.padStart(2, "0");

    // Validación básica de rango
    const nY = Number(y),
      nM = Number(mm),
      nD = Number(dd);
    if (nY < 1900 || nY > 9999 || nM < 1 || nM > 12 || nD < 1 || nD > 31) {
      return null;
    }

    // Check de fecha real
    const dt = new Date(`${y}-${mm}-${dd}T00:00:00Z`);
    if (
      !dt ||
      Number.isNaN(dt.getTime()) ||
      dt.getUTCFullYear() !== nY ||
      dt.getUTCMonth() + 1 !== nM ||
      dt.getUTCDate() !== nD
    ) {
      return null;
    }

    return `${y}-${mm}-${dd}`;
  };

  // Soportar: DD/MM/YYYY, DD-MM-YYYY
  if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(raw)) {
    // Probar DMY primero (lo más común en ES), si falla intenta MDY
    return tryParse(raw, "DMY") || tryParse(raw, "MDY");
  }

  return null;
}

/* =========================
 * Helpers DOM
 * ========================= */
function $(sel) {
  return document.querySelector(sel);
}
function getVal(...selectors) {
  for (const s of selectors) {
    const el = $(s);
    if (el && typeof el.value !== "undefined") return el.value;
  }
  return "";
}
function getFile(...selectors) {
  for (const s of selectors) {
    const el = $(s);
    if (el && el.files && el.files[0]) return el.files[0];
  }
  return null;
}

/* =========================
 * Subida de documento
 * ========================= */
async function uploadDocument(e) {
  if (e && typeof e.preventDefault === "function") e.preventDefault();

  try {
    // 1) Leer campos (tolerante a distintos IDs)
    const name =
      getVal("#name", "#nombre", "input[name='name']", "input[name='nombre']") ||
      "";
    const dateRaw = getVal("#date", "input[name='date']", "input[name='fecha']");
    const codes =
      getVal("#codes", "#codigos", "textarea[name='codes']", "textarea[name='codigos']") ||
      "";
    const pdf = getFile("#pdf", "input[type='file']");

    if (!name.trim()) {
      showToast("El nombre es obligatorio.", "error");
      return;
    }
    if (!pdf) {
      showToast("Debes seleccionar un PDF.", "error");
      return;
    }

    // 2) Normalizar fecha a ISO (YYYY-MM-DD)
    const dateISO = normalizeDate(dateRaw);
    if (!dateISO) {
      showToast(
        "Formato de fecha no válido; utilice YYYY-MM-DD o DD/MM/YYYY.",
        "error"
      );
      return;
    }

    // 3) Construir FormData
    const fd = new FormData();
    fd.append("name", name);
    fd.append("date", dateISO);     // clave 'date' (preferida)
    fd.append("fecha", dateISO);    // y 'fecha' por compatibilidad backend
    fd.append("codigos", codes);
    fd.append("pdf", pdf);

    // 4) POST al backend
    // Si tu backend está detrás de un path /api, mantenlo.
    const url = `${API_BASE}/api/documentos/upload`.replace(/\/{2,}/g, "/");
    const resp = await fetch(url, {
      method: "POST",
      body: fd,
    });

    // 5) Manejo de respuesta
    const isJson = resp.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await resp.json() : await resp.text();

    if (!resp.ok) {
      // Mensaje legible
      const msg =
        (data && data.error) ||
        (typeof data === "string" && data) ||
        `Error ${resp.status}`;
      showToast(`Error al subir: ${msg}`, "error");
      return;
    }

    // Éxito
    showToast("Documento subido correctamente.", "success");

    // 6) Opcional: limpiar formulario
    const form = $("#upload-form");
    if (form) form.reset();
  } catch (err) {
    console.error(err);
    showToast("Error inesperado al subir el documento.", "error");
  }
}

/* =========================
 * Enlazar eventos
 * =========================
 * - Botón Guardar con id #btn-upload (si existe).
 * - Submit del form con id #upload-form (si existe).
 */
function bindUploadEvents() {
  const form = $("#upload-form");
  if (form) {
    form.addEventListener("submit", uploadDocument);
  }

  const btn = $("#btn-upload");
  if (btn) {
    btn.addEventListener("click", uploadDocument);
  }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindUploadEvents);
} else {
  bindUploadEvents();
}

/* ============================================================
 * Fin de upload.js
 * ============================================================ */
