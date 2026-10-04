import { Committee, ObservationType, ProtocolStatus, ReviewOutcome, RiskLevel } from '@prisma/client';
import { ProtocolReviewInvalidOutcomeForCommitteeException } from './exceptions/protocol-review-invalid-outcome-for-committee.exception';
import { ProtocolReviewObservationsRequiredException } from './exceptions/protocol-review-observations-required.exception';
import { ProtocolReviewEthicsFieldsNotAllowedException } from './exceptions/protocol-review-ethics-fields-not-allowed.exception';
import { ProtocolReviewFinalizationIncompleteException } from './exceptions/protocol-review-finalization-incomplete.exception';
import { ProtocolReviewCommitteeClosedException } from './exceptions/protocol-review-committee-closed.exception';
import { ProtocolReviewCicApprovalRequiredException } from './exceptions/protocol-review-cic-approval-required.exception';
import { ProtocolReviewObservationPendingException } from './exceptions/protocol-review-observation-pending.exception';
import { ProtocolReviewGoodPracticesCertificateRequiredException } from './exceptions/protocol-review-good-practices-certificate-required.exception';

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
  /** Documentación registrada en el protocolo al crearlo. */
  protocol: {
    tieneConstanciaEtica: boolean;
    consentimientoInformado: boolean;
    requiereRevisionHc: boolean;
    certificadoBuenasPracticas: boolean;
  };
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

// La documentación ética (constancia, consentimiento, certificado) se registra al crear el protocolo;
// el CIEI solo puede finalizar si ya está registrada y si él mismo fija el nivel de riesgo.
export function assertCieiFinalizationRequirements(input: AssertCieiFinalizationInput): void {
  if (input.committee !== Committee.CIEI || input.outcome !== ReviewOutcome.FINALIZED) {
    return;
  }

  if (
    !input.catalogadoRiesgo ||
    !input.protocol.tieneConstanciaEtica ||
    !input.protocol.consentimientoInformado
  ) {
    throw new ProtocolReviewFinalizationIncompleteException();
  }

  if (input.protocol.requiereRevisionHc && !input.protocol.certificadoBuenasPracticas) {
    throw new ProtocolReviewGoodPracticesCertificateRequiredException();
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
