// Comprobantes de pago electrónicos de SUNAT: la serie tiene 4 caracteres (B = boleta, F = factura, seguidos de
// 3 alfanuméricos, p. ej. B001, F001, BA01) y el correlativo hasta 8 dígitos, separados por guion.
export const COMPROBANTE_PATTERNS: Record<string, RegExp> = {
  BOLETA: /^B[A-Z0-9]{3}-\d{1,8}$/,
  FACTURA: /^F[A-Z0-9]{3}-\d{1,8}$/,
};

export function isValidComprobante(tipo: string, numero: string): boolean {
  const pattern = COMPROBANTE_PATTERNS[tipo.trim().toUpperCase()];
  return pattern !== undefined && pattern.test(numero.trim().toUpperCase());
}
