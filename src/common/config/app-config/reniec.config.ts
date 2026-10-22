import { registerAs } from '@nestjs/config';

// Acepta los nombres RENIEC_* y también DNI_* (los que usa el proyecto del botón de pánico con el mismo proveedor),
// para poder reutilizar las mismas variables en Coolify. RENIEC_* tiene prioridad si están ambas.
// El default de RENIEC_BASE_URL vive en el Joi schema (validation.schema.ts), que lo aplica sobre process.env.
export const reniecConfig = registerAs('reniec', () => ({
  baseUrl: process.env.RENIEC_BASE_URL || process.env.DNI_BASE_URL,
  token: process.env.RENIEC_TOKEN || process.env.DNI_TOKEN || '',
}));
