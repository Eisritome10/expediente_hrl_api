import { Committee, ProtocolStatus, ReviewOutcome, RiskLevel } from '@prisma/client';
import { ProtocolReviewInvalidOutcomeForCommitteeException } from './exceptions/protocol-review-invalid-outcome-for-committee.exception';
import { ProtocolReviewObservationsRequiredException } from './exceptions/protocol-review-observations-required.exception';
import { ProtocolReviewEthicsFieldsNotAllowedException } from './exceptions/protocol-review-ethics-fields-not-allowed.exception';
import { ProtocolReviewConstanciaIncompleteException } from './exceptions/protocol-review-constancia-incomplete.exception';
import { ProtocolReviewFinalizationIncompleteException } from './exceptions/protocol-review-finalization-incomplete.exception';
import { ProtocolReviewCommitteeClosedException } from './exceptions/protocol-review-committee-closed.exception';
import { ProtocolReviewCicApprovalRequiredException } from './exceptions/protocol-review-cic-approval-required.exception';
import { ProtocolReviewObservationPendingException } from './exceptions/protocol-review-observation-pending.exception';

export interface AssertReviewRequestInput {
  committee: Committee;
  outcome: ReviewOutcome;
  observations?: string | null;
  tieneConstanciaEtica?: boolean;
  idConstanciaEtica?: string | null;
  fechaConstancia?: Date | null;
  catalogadoRiesgo?: RiskLevel | null;
  consentimientoInformado?: boolean;
  departamentoDirigidoPermiso?: string | null;
}

export interface EthicsFieldsInput {
  tieneConstanciaEtica?: boolean;
  idConstanciaEtica?: string | null;
  fechaConstancia?: Date | null;
  catalogadoRiesgo?: RiskLevel | null;
  consentimientoInformado?: boolean;
  departamentoDirigidoPermiso?: string | null;
}

export interface EthicsFieldsUpdate {
  tieneConstanciaEtica?: boolean;
  idConstanciaEtica?: string | null;
  fechaConstancia?: Date | null;
  catalogadoRiesgo?: RiskLevel | null;
  consentimientoInformado?: boolean;
  departamentoDirigidoPermiso?: string | null;
}

const CIC_ALLOWED_OUTCOMES: ReviewOutcome[] = [ReviewOutcome.OBSERVED, ReviewOutcome.APPROVED];
const CIEI_ALLOWED_OUTCOMES: ReviewOutcome[] = [ReviewOutcome.OBSERVED, ReviewOutcome.FINALIZED];

export function assertReviewRequest(input: AssertReviewRequestInput): void {
  const allowedOutcomes =
    input.committee === Committee.CIC ? CIC_ALLOWED_OUTCOMES : CIEI_ALLOWED_OUTCOMES;
  if (!allowedOutcomes.includes(input.outcome)) {
    throw new ProtocolReviewInvalidOutcomeForCommitteeException(input.committee, input.outcome);
  }

  if (
    input.outcome === ReviewOutcome.OBSERVED &&
    (input.observations === null ||
      input.observations === undefined ||
      input.observations.trim() === '')
  ) {
    throw new ProtocolReviewObservationsRequiredException();
  }

  if (
    input.committee === Committee.CIC &&
    (input.tieneConstanciaEtica != null ||
      input.idConstanciaEtica != null ||
      input.fechaConstancia != null ||
      input.catalogadoRiesgo != null ||
      input.consentimientoInformado != null ||
      input.departamentoDirigidoPermiso != null)
  ) {
    throw new ProtocolReviewEthicsFieldsNotAllowedException();
  }

  if (
    input.committee === Committee.CIEI &&
    input.tieneConstanciaEtica === true &&
    (!input.idConstanciaEtica || !input.fechaConstancia)
  ) {
    throw new ProtocolReviewConstanciaIncompleteException();
  }

  if (
    input.committee === Committee.CIEI &&
    input.outcome === ReviewOutcome.FINALIZED &&
    (input.tieneConstanciaEtica !== true ||
      !input.catalogadoRiesgo ||
      input.consentimientoInformado !== true)
  ) {
    throw new ProtocolReviewFinalizationIncompleteException();
  }
}

export function resolveNextProtocolStatus(
  currentStatus: ProtocolStatus,
  committee: Committee,
  outcome: ReviewOutcome,
  lastCicOutcome: ReviewOutcome | null,
  protocolId: string,
): ProtocolStatus {
  if (committee === Committee.CIC) {
    const cicClosed =
      currentStatus === ProtocolStatus.CIEI_OBSERVED ||
      currentStatus === ProtocolStatus.CIEI_CORRECTED ||
      currentStatus === ProtocolStatus.FINALIZED ||
      lastCicOutcome === ReviewOutcome.APPROVED;
    if (cicClosed) {
      throw new ProtocolReviewCommitteeClosedException(protocolId);
    }
    return outcome === ReviewOutcome.OBSERVED ? ProtocolStatus.CIC_OBSERVED : currentStatus;
  }

  if (lastCicOutcome !== ReviewOutcome.APPROVED) {
    throw new ProtocolReviewCicApprovalRequiredException(protocolId);
  }

  if (outcome === ReviewOutcome.FINALIZED && currentStatus === ProtocolStatus.CIEI_OBSERVED) {
    throw new ProtocolReviewObservationPendingException(protocolId);
  }

  return outcome === ReviewOutcome.OBSERVED ? ProtocolStatus.CIEI_OBSERVED : ProtocolStatus.FINALIZED;
}

export function resolveEthicsUpdate(
  committee: Committee,
  input: EthicsFieldsInput,
): EthicsFieldsUpdate {
  if (committee !== Committee.CIEI) {
    return {};
  }

  const result: EthicsFieldsUpdate = {};
  if (input.tieneConstanciaEtica !== undefined) {
    result.tieneConstanciaEtica = input.tieneConstanciaEtica;
  }
  if (input.idConstanciaEtica !== undefined) {
    result.idConstanciaEtica = input.idConstanciaEtica;
  }
  if (input.fechaConstancia !== undefined) {
    result.fechaConstancia = input.fechaConstancia;
  }
  if (input.catalogadoRiesgo !== undefined) {
    result.catalogadoRiesgo = input.catalogadoRiesgo;
  }
  if (input.consentimientoInformado !== undefined) {
    result.consentimientoInformado = input.consentimientoInformado;
  }
  if (input.departamentoDirigidoPermiso !== undefined) {
    result.departamentoDirigidoPermiso = input.departamentoDirigidoPermiso;
  }

  if (input.tieneConstanciaEtica === false) {
    result.idConstanciaEtica = null;
    result.fechaConstancia = null;
  }

  return result;
}
