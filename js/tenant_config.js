// js/tenant_config.js

// Configuración específica del cliente para el frontend multi-cliente.
// Modifica estos valores para cada nuevo cliente.

export const tenantConfig = {
  /**
   * ID único del cliente.
   * Este valor DEBE coincidir con una de las claves en el archivo tenants.json del backend.
   */
  id: 'Cliente-Kino',

  /**
   * URL pública de tu bucket de Cloudflare R2 donde se guardan los PDFs.
   */
  r2PublicUrl: 'https://pub-03dc9d85fa204a128576fed743324f3d.r2.dev'
};