import { ProtocoloConvenioSinNombreException } from './exceptions/protocolo-convenio-sin-nombre.exception';
import { ProtocoloRevisionHcIncompletaException } from './exceptions/protocolo-revision-hc-incompleta.exception';
import { ProtocoloInvestigadorDuplicadoException } from './exceptions/protocolo-investigador-duplicado.exception';
import { ProtocoloLugarEjecucionInconsistenteException } from './exceptions/protocolo-lugar-ejecucion-inconsistente.exception';
import { ProtocoloMemosNoAplicablesException } from './exceptions/protocolo-memos-no-aplicables.exception';

function normalizeAlnum(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export type ProtocoloRulesInput = {
  esConvenio: boolean;
  nombreConvenio: string | null;
  esEnmienda: boolean;
  pagoRevision: number | null;
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
  nombreConvenio: string | null;
  montoHc: number | null;
  tipoComprobanteHc: string | null;
  nroComprobanteHc: string | null;
  destinoIds: string[];
};

export function applyProtocoloRules(input: ProtocoloRulesInput): ProtocoloRulesResult {
  if (input.esConvenio && !input.nombreConvenio) {
    throw new ProtocoloConvenioSinNombreException();
  }

  const pagoRevision = input.esConvenio || input.esEnmienda ? 0 : input.pagoRevision;

  if (input.requiereRevisionHc) {
    if (!input.montoHc || !input.tipoComprobanteHc || !input.nroComprobanteHc) {
      throw new ProtocoloRevisionHcIncompletaException();
    }
  }

  if (
    input.coinvestigadorIds.includes(input.investigadorPrincipalId) ||
    input.asesorIds.includes(input.investigadorPrincipalId)
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
    nombreConvenio: input.esConvenio ? input.nombreConvenio : null,
    montoHc: input.requiereRevisionHc ? input.montoHc : null,
    tipoComprobanteHc: input.requiereRevisionHc ? input.tipoComprobanteHc : null,
    nroComprobanteHc: input.requiereRevisionHc ? input.nroComprobanteHc : null,
    destinoIds: input.destinoIds,
  };
}
