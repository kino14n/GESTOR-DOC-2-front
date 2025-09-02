/* ============================================================
 * upload.js - Gestor de Documentos (frontend)
 * ------------------------------------------------------------
 * - Lee nombre, fecha, archivo PDF y códigos.
 * - Normaliza la fecha a YYYY-MM-DD (acepta múltiples formatos).
 * - Envía FormData al backend /api/documentos/upload.
 * - Muestra toasts de éxito/error.
 * - EXPONE: export function initUploadForm()
 * ============================================================ */

/* =========================
 * Configuración del API
 * ========================= */
const API_BASE =
  window.API_BASE ||
  (typeof getApiBase === "function" ? getApiBase() : "") ||
  "";

/* =========================
 * Utilidades UI (toasts)
 * ========================= */
function ensureToastContainer() {
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

function toast(msg, type = "error", ms = 4000) {
  const c = ensureToastContainer();
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
  box.textContent = msg;
  c.appendChild(box);
  setTimeout(() => {
    box.style.transition = "opacity .25s ease";
    box.style.opacity = "0";
    setTimeout(() => c.removeChild(box), 300);
  }, ms);
}

/* =========================
 * Normalización de fechas
 * =========================
 * Devuelve YYYY-MM-DD o null si no puede convertir.
 */
function normalizeDate(value) {
  if (!value) return null;
  const raw = String(value).trim();

  // ISO nativo de <input type="date">
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const tryParse = (str, order) => {
    const sep = str.includes("/") ? "/" : "-";
    const parts = str.split(sep).map((x) => x.trim());
    if (parts.length !== 3) return null;

    let d, m, y;
    if (order === "DMY") [d, m, y] = parts;
    else if (order === "MDY") [m, d, y] = parts;
    else return null;

    if (!/^\d{1,2}$/.test(d) || !/^\d{1,2}$/.test(m) || !/^\d{4}$/.test(y)) return null;

    const dd = d.padStart(2, "0");
    const mm = m.padStart(2, "0");
    const nY = +y, nM = +mm, nD = +dd;
    if (nY < 1900 || nY > 9999 || nM < 1 || nM > 12 || nD < 1 || nD > 31) return null;

    const dt = new Date(`${y}-${mm}-${dd}T00:00:00Z`);
    if (!dt || Number.isNaN(dt.getTime())) return null;
    if (dt.getUTCFullYear() !== nY || dt.getUTCMonth() + 1 !== nM || dt.getUTCDate() !== nD) return null;

    return `${y}-${mm}-${dd}`;
  };

  if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(raw)) {
    return tryParse(raw, "DMY") || tryParse(raw, "MDY");
  }

  return null;
}

/* =========================
 * Helpers DOM
 * ========================= */
const $ = (sel) => document.querySelector(sel);
function getVal(...selectors) {
  for (const s of selectors) {
    const el = $(s);
    if (el && "value" in el) return el.value;
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
 * Lógica principal de subida
 * ========================= */
async function handleUpload(e) {
  if (e?.preventDefault) e.preventDefault();

  try {
    const name =
      getVal("#name", "#nombre", "input[name='name']", "input[name='nombre']") || "";
    const dateRaw = getVal("#date", "input[name='date']", "input[name='fecha']");
    const codes =
      getVal("#codes", "#codigos", "textarea[name='codes']", "textarea[name='codigos']") || "";
    const pdf = getFile("#pdf", "input[type='file']");

    if (!name.trim()) {
      toast("El nombre es obligatorio.", "error");
      return;
    }
    if (!pdf) {
      toast("Debes seleccionar un PDF.", "error");
      return;
    }

    const dateISO = normalizeDate(dateRaw);
    if (!dateISO) {
      toast("Formato de fecha no válido; utilice YYYY-MM-DD o DD/MM/YYYY.", "error");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("date", dateISO);   // clave preferida
    fd.append("fecha", dateISO);  // compatibilidad
    fd.append("codigos", codes);
    fd.append("pdf", pdf);

    const url = `${API_BASE}/api/documentos/upload`.replace(/\/{2,}/g, "/");
    const resp = await fetch(url, { method: "POST", body: fd });

    const isJson = resp.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await resp.json() : await resp.text();

    if (!resp.ok) {
      const msg =
        (data && data.error) ||
        (typeof data === "string" && data) ||
        `Error ${resp.status}`;
      toast(`Error al subir: ${msg}`, "error");
      return;
    }

    toast("Documento subido correctamente.", "success");
    $("#upload-form")?.reset();
  } catch (err) {
    console.error(err);
    toast("Error inesperado al subir el documento.", "error");
  }
}

/* =========================
 * Enlace de eventos
 * =========================
 * Exportamos initUploadForm para que main.js pueda importarlo.
 */
export function initUploadForm() {
  const form = $("#upload-form");
  if (form && !form.__uploadBound) {
    form.addEventListener("submit", handleUpload);
    form.__uploadBound = true;
  }
  const btn = $("#btn-upload");
  if (btn && !btn.__uploadBound) {
    btn.addEventListener("click", handleUpload);
    btn.__uploadBound = true;
  }
  return { handleUpload };
}

/* Export por defecto opcional */
export default { initUploadForm };
