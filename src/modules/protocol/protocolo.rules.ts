import { ProtocoloRevisionHcIncompletaException } from './exceptions/protocolo-revision-hc-incompleta.exception';
import { ProtocoloInvestigadorDuplicadoException } from './exceptions/protocolo-investigador-duplicado.exception';
import { ProtocoloLugarEjecucionInconsistenteException } from './exceptions/protocolo-lugar-ejecucion-inconsistente.exception';
import { ProtocoloMemosNoAplicablesException } from './exceptions/protocolo-memos-no-aplicables.exception';
import { ProtocoloConstanciaEticaIncompletaException } from './exceptions/protocolo-constancia-etica-incompleta.exception';
import { ProtocoloComprobanteInvalidoException } from './exceptions/protocolo-comprobante-invalido.exception';
import { isValidComprobante } from './comprobante.util';

function normalizeAlnum(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export type ProtocoloRulesInput = {
  convenioId: string | null;
  esEnmienda: boolean;
  pagoRevision: number | null;
  tipoComprobante: string | null;
  comprobanteRevision: string | null;
  tieneConstanciaEtica: boolean;
  idConstanciaEtica: string | null;
  fechaConstancia: Date | null;
  certificadoBuenasPracticas: boolean;
  requiereRevisionHc: boolean;
  montoHc: number | null;
  tipoComprobanteHc: string | null;
  nroComprobanteHc: string | null;
  esInstitucional: boolean;
  destinoIds: string[];
  investigadorPrincipalId: string;
  coinvestigadorIds: string[];
  asesorIds: string[];
  lugarEjecucion: string;
};

export type ProtocoloRulesResult = {
  pagoRevision: number | null;
  tipoComprobante: string | null;
  comprobanteRevision: string | null;
  idConstanciaEtica: string | null;
  fechaConstancia: Date | null;
  certificadoBuenasPracticas: boolean;
  montoHc: number | null;
  tipoComprobanteHc: string | null;
  nroComprobanteHc: string | null;
  destinoIds: string[];
};

export type ProtocoloRulesOptions = {
  /**
   * Valida el formato de los comprobantes (pago y HC). El PATCH solo lo activa cuando la corrección toca esos
   * campos, para no bloquear correcciones ajenas en protocolos antiguos con comprobantes que no cumplen el formato.
   */
  checkComprobantes?: boolean;
};

export function applyProtocoloRules(
  input: ProtocoloRulesInput,
  options: ProtocoloRulesOptions = {},
): ProtocoloRulesResult {
  const checkComprobantes = options.checkComprobantes ?? true;
  // Un protocolo de convenio (referencia un Agreement) o una enmienda no paga revisión.
  const exonerado = input.convenioId !== null || input.esEnmienda;
  const pagoRevision = exonerado ? 0 : input.pagoRevision;

  // El comprobante del pago de revisión (si el protocolo no está exonerado) debe ser una boleta o factura válida.
  if (checkComprobantes && !exonerado && (input.tipoComprobante || input.comprobanteRevision)) {
    if (!input.tipoComprobante || !input.comprobanteRevision) {
      throw new ProtocoloComprobanteInvalidoException('el tipo y el número del comprobante de revisión van juntos');
    }
    if (!isValidComprobante(input.tipoComprobante, input.comprobanteRevision)) {
      throw new ProtocoloComprobanteInvalidoException('el comprobante de revisión no cumple el formato');
    }
  }

  if (input.requiereRevisionHc) {
    if (!input.montoHc || !input.tipoComprobanteHc || !input.nroComprobanteHc) {
      throw new ProtocoloRevisionHcIncompletaException();
    }
    if (checkComprobantes && !isValidComprobante(input.tipoComprobanteHc, input.nroComprobanteHc)) {
      throw new ProtocoloComprobanteInvalidoException('el comprobante de historia clínica no cumple el formato');
    }
  }

  // La constancia ética se registra al crear el protocolo: si se declara, debe traer su código y su fecha.
  if (input.tieneConstanciaEtica && (!input.idConstanciaEtica || !input.fechaConstancia)) {
    throw new ProtocoloConstanciaEticaIncompletaException();
  }

  if (
    input.coinvestigadorIds.includes(input.investigadorPrincipalId) ||
    input.asesorIds.includes(input.investigadorPrincipalId) ||
    input.coinvestigadorIds.some((id) => input.asesorIds.includes(id))
  ) {
    throw new ProtocoloInvestigadorDuplicadoException();
  }

  if (!input.esInstitucional && normalizeAlnum(input.lugarEjecucion).includes('hospitalregional')) {
    throw new ProtocoloLugarEjecucionInconsistenteException();
  }

  if (!input.esInstitucional && input.destinoIds.length > 0) {
    throw new ProtocoloMemosNoAplicablesException();
  }

  return {
    pagoRevision,
    tipoComprobante: exonerado ? null : input.tipoComprobante,
    comprobanteRevision: exonerado ? null : input.comprobanteRevision,
    idConstanciaEtica: input.tieneConstanciaEtica ? input.idConstanciaEtica : null,
    fechaConstancia: input.tieneConstanciaEtica ? input.fechaConstancia : null,
    // El certificado de buenas prácticas solo se pide si el protocolo requiere revisión de historia clínica.
    certificadoBuenasPracticas: input.requiereRevisionHc ? input.certificadoBuenasPracticas : false,
    montoHc: input.requiereRevisionHc ? input.montoHc : null,
    tipoComprobanteHc: input.requiereRevisionHc ? input.tipoComprobanteHc : null,
    nroComprobanteHc: input.requiereRevisionHc ? input.nroComprobanteHc : null,
    destinoIds: input.destinoIds,
  };
}
