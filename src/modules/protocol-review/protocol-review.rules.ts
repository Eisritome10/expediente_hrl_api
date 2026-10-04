import { Committee, ObservationType, ProtocolStatus, ReviewOutcome, RiskLevel } from '@prisma/client';
import { ProtocolReviewInvalidOutcomeForCommitteeException } from './exceptions/protocol-review-invalid-outcome-for-committee.exception';
import { ProtocolReviewObservationsRequiredException } from './exceptions/protocol-review-observations-required.exception';
import { ProtocolReviewEthicsFieldsNotAllowedException } from './exceptions/protocol-review-ethics-fields-not-allowed.exception';
import { ProtocolReviewFinalizationIncompleteException } from './exceptions/protocol-review-finalization-incomplete.exception';
import { ProtocolReviewCommitteeClosedException } from './exceptions/protocol-review-committee-closed.exception';
import { ProtocolReviewCicApprovalRequiredException } from './exceptions/protocol-review-cic-approval-required.exception';
import { ProtocolReviewObservationPendingException } from './exceptions/protocol-review-observation-pending.exception';

export interface ReviewObservationInput {
  type: ObservationType;
  text: string;
}

export interface AssertReviewRequestInput {
  committee: Committee;
  outcome: ReviewOutcome;
  /** Observaciones ya recortadas (trim). */
  observations: ReviewObservationInput[];
  catalogadoRiesgo?: RiskLevel | null;
}

export interface EthicsFieldsInput {
  catalogadoRiesgo?: RiskLevel | null;
}

export interface EthicsFieldsUpdate {
  catalogadoRiesgo?: RiskLevel | null;
}

export interface AssertCieiFinalizationInput {
  committee: Committee;
  outcome: ReviewOutcome;
  catalogadoRiesgo?: RiskLevel | null;
}

const CIC_ALLOWED_OUTCOMES: ReviewOutcome[] = [ReviewOutcome.OBSERVED, ReviewOutcome.APPROVED];
const CIEI_ALLOWED_OUTCOMES: ReviewOutcome[] = [ReviewOutcome.OBSERVED, ReviewOutcome.FINALIZED];

export function assertReviewRequest(input: AssertReviewRequestInput): void {
  const allowedOutcomes =
    input.committee === Committee.CIC ? CIC_ALLOWED_OUTCOMES : CIEI_ALLOWED_OUTCOMES;
  if (!allowedOutcomes.includes(input.outcome)) {
    throw new ProtocolReviewInvalidOutcomeForCommitteeException(input.committee, input.outcome);
  }

  // Un dictamen observado necesita al menos una observación; y ninguna observación puede venir sin texto.
  if (
    input.observations.some((observation) => observation.text.trim() === '') ||
    (input.outcome === ReviewOutcome.OBSERVED && input.observations.length === 0)
  ) {
    throw new ProtocolReviewObservationsRequiredException();
  }

  // El nivel de riesgo solo lo establece el comité de ética.
  if (input.committee === Committee.CIC && input.catalogadoRiesgo != null) {
    throw new ProtocolReviewEthicsFieldsNotAllowedException();
  }
}

// El CIEI evalúa la documentación registrada al crear el protocolo (constancia, consentimiento, certificado), pero
// su falta no impide finalizar: lo único que el CIEI debe fijar para finalizar es el nivel de riesgo.
export function assertCieiFinalizationRequirements(input: AssertCieiFinalizationInput): void {
  if (input.committee !== Committee.CIEI || input.outcome !== ReviewOutcome.FINALIZED) {
    return;
  }

  if (!input.catalogadoRiesgo) {
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
  if (committee !== Committee.CIEI || input.catalogadoRiesgo === undefined) {
    return {};
  }

  return { catalogadoRiesgo: input.catalogadoRiesgo };
}
