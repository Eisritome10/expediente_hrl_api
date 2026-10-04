import { Committee, ObservationType, ProtocolStatus, ReviewOutcome, RiskLevel } from '@prisma/client';
import {
  assertCieiFinalizationRequirements,
  assertReviewRequest,
  resolveEthicsUpdate,
  resolveNextProtocolStatus,
} from '../../protocol-review.rules';
import { ProtocolReviewInvalidOutcomeForCommitteeException } from '../../exceptions/protocol-review-invalid-outcome-for-committee.exception';
import { ProtocolReviewObservationsRequiredException } from '../../exceptions/protocol-review-observations-required.exception';
import { ProtocolReviewEthicsFieldsNotAllowedException } from '../../exceptions/protocol-review-ethics-fields-not-allowed.exception';
import { ProtocolReviewFinalizationIncompleteException } from '../../exceptions/protocol-review-finalization-incomplete.exception';
import { ProtocolReviewCommitteeClosedException } from '../../exceptions/protocol-review-committee-closed.exception';
import { ProtocolReviewCicApprovalRequiredException } from '../../exceptions/protocol-review-cic-approval-required.exception';
import { ProtocolReviewObservationPendingException } from '../../exceptions/protocol-review-observation-pending.exception';
import { ProtocolReviewGoodPracticesCertificateRequiredException } from '../../exceptions/protocol-review-good-practices-certificate-required.exception';

const oneObservation = [{ type: ObservationType.ADMINISTRATIVE, text: 'Falta la boleta de pago' }];

describe('assertReviewRequest', () => {
  it('does not throw for a valid CIC OBSERVED review with a typed observation', () => {
    expect(() =>
      assertReviewRequest({ committee: Committee.CIC, outcome: ReviewOutcome.OBSERVED, observations: oneObservation }),
    ).not.toThrow();
  });

  it('does not throw for a CIC OBSERVED review with several observations of different types', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIC,
        outcome: ReviewOutcome.OBSERVED,
        observations: [
          { type: ObservationType.METHODOLOGICAL, text: 'Objetivo general ambiguo' },
          { type: ObservationType.INFORMED_CONSENT, text: 'Consentimiento mal redactado' },
        ],
      }),
    ).not.toThrow();
  });

  it('does not throw for a valid CIC APPROVED review without observations', () => {
    expect(() =>
      assertReviewRequest({ committee: Committee.CIC, outcome: ReviewOutcome.APPROVED, observations: [] }),
    ).not.toThrow();
  });

  it('does not throw for a valid CIEI OBSERVED review with an ETHICS_CONSTANCE observation', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIEI,
        outcome: ReviewOutcome.OBSERVED,
        observations: [{ type: ObservationType.ETHICS_CONSTANCE, text: 'La constancia tiene errores de redaccion' }],
      }),
    ).not.toThrow();
  });

  it('does not throw for a CIEI FINALIZED review that sets the risk level', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIEI,
        outcome: ReviewOutcome.FINALIZED,
        observations: [],
        catalogadoRiesgo: RiskLevel.MINIMAL_RISK,
      }),
    ).not.toThrow();
  });

  it('throws ProtocolReviewInvalidOutcomeForCommitteeException for a CIC FINALIZED outcome', () => {
    expect(() =>
      assertReviewRequest({ committee: Committee.CIC, outcome: ReviewOutcome.FINALIZED, observations: [] }),
    ).toThrow(ProtocolReviewInvalidOutcomeForCommitteeException);
  });

  it('throws ProtocolReviewInvalidOutcomeForCommitteeException for a CIEI APPROVED outcome', () => {
    expect(() =>
      assertReviewRequest({ committee: Committee.CIEI, outcome: ReviewOutcome.APPROVED, observations: [] }),
    ).toThrow(ProtocolReviewInvalidOutcomeForCommitteeException);
  });

  it('throws ProtocolReviewObservationsRequiredException for OBSERVED without observations', () => {
    expect(() =>
      assertReviewRequest({ committee: Committee.CIC, outcome: ReviewOutcome.OBSERVED, observations: [] }),
    ).toThrow(ProtocolReviewObservationsRequiredException);
  });

  it('throws ProtocolReviewObservationsRequiredException when an observation has blank text, whatever the outcome', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        observations: [{ type: ObservationType.LEGAL_INSTITUTIONAL, text: '   ' }],
      }),
    ).toThrow(ProtocolReviewObservationsRequiredException);
  });

  it('throws ProtocolReviewEthicsFieldsNotAllowedException when a CIC review sets the risk level', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIC,
        outcome: ReviewOutcome.OBSERVED,
        observations: oneObservation,
        catalogadoRiesgo: RiskLevel.HIGH_RISK,
      }),
    ).toThrow(ProtocolReviewEthicsFieldsNotAllowedException);
  });

  it('allows a CIC review when the risk level is null or undefined', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIC,
        outcome: ReviewOutcome.OBSERVED,
        observations: oneObservation,
        catalogadoRiesgo: null,
      }),
    ).not.toThrow();
  });
});

describe('assertCieiFinalizationRequirements', () => {
  const completeProtocol = {
    tieneConstanciaEtica: true,
    consentimientoInformado: true,
    requiereRevisionHc: false,
    certificadoBuenasPracticas: false,
  };

  const finalize = (overrides: Partial<Parameters<typeof assertCieiFinalizationRequirements>[0]> = {}) =>
    assertCieiFinalizationRequirements({
      committee: Committee.CIEI,
      outcome: ReviewOutcome.FINALIZED,
      catalogadoRiesgo: RiskLevel.MINIMAL_RISK,
      protocol: completeProtocol,
      ...overrides,
    });

  it('does not throw when the risk level is set and the documentation is registered', () => {
    expect(() => finalize()).not.toThrow();
  });

  it('throws ProtocolReviewFinalizationIncompleteException when the risk level is missing', () => {
    expect(() => finalize({ catalogadoRiesgo: undefined })).toThrow(ProtocolReviewFinalizationIncompleteException);
  });

  it('throws ProtocolReviewFinalizationIncompleteException when the protocol has no constancia registered', () => {
    expect(() => finalize({ protocol: { ...completeProtocol, tieneConstanciaEtica: false } })).toThrow(
      ProtocolReviewFinalizationIncompleteException,
    );
  });

  it('throws ProtocolReviewFinalizationIncompleteException when the protocol has no informed consent registered', () => {
    expect(() => finalize({ protocol: { ...completeProtocol, consentimientoInformado: false } })).toThrow(
      ProtocolReviewFinalizationIncompleteException,
    );
  });

  it('throws ProtocolReviewGoodPracticesCertificateRequiredException when HC is required and the certificate is missing', () => {
    expect(() =>
      finalize({ protocol: { ...completeProtocol, requiereRevisionHc: true, certificadoBuenasPracticas: false } }),
    ).toThrow(ProtocolReviewGoodPracticesCertificateRequiredException);
  });

  it('does not throw when HC is required and the certificate is registered', () => {
    expect(() =>
      finalize({ protocol: { ...completeProtocol, requiereRevisionHc: true, certificadoBuenasPracticas: true } }),
    ).not.toThrow();
  });

  it('does not require the certificate when the protocol does not need HC review', () => {
    expect(() => finalize({ protocol: { ...completeProtocol, certificadoBuenasPracticas: false } })).not.toThrow();
  });

  it('does not apply to CIEI OBSERVED nor to CIC reviews', () => {
    const incomplete = { ...completeProtocol, tieneConstanciaEtica: false };
    expect(() => finalize({ outcome: ReviewOutcome.OBSERVED, catalogadoRiesgo: undefined, protocol: incomplete })).not.toThrow();
    expect(() =>
      finalize({ committee: Committee.CIC, outcome: ReviewOutcome.APPROVED, catalogadoRiesgo: undefined, protocol: incomplete }),
    ).not.toThrow();
  });
});

describe('resolveNextProtocolStatus', () => {
  it('resolves CIC OBSERVED from CREATED to CIC_OBSERVED', () => {
    expect(
      resolveNextProtocolStatus(
        ProtocolStatus.CREATED,
        Committee.CIC,
        ReviewOutcome.OBSERVED,
        null,
        'p1',
      ),
    ).toBe(ProtocolStatus.CIC_OBSERVED);
  });

  it('keeps CIC_CORRECTED unchanged for CIC APPROVED', () => {
    expect(
      resolveNextProtocolStatus(
        ProtocolStatus.CIC_CORRECTED,
        Committee.CIC,
        ReviewOutcome.APPROVED,
        null,
        'p1',
      ),
    ).toBe(ProtocolStatus.CIC_CORRECTED);
  });

  it('throws ProtocolReviewCommitteeClosedException when currentStatus is CIEI_OBSERVED', () => {
    expect(() =>
      resolveNextProtocolStatus(
        ProtocolStatus.CIEI_OBSERVED,
        Committee.CIC,
        ReviewOutcome.APPROVED,
        null,
        'p1',
      ),
    ).toThrow(ProtocolReviewCommitteeClosedException);
  });

  it('throws ProtocolReviewCommitteeClosedException when lastCicOutcome is APPROVED', () => {
    expect(() =>
      resolveNextProtocolStatus(
        ProtocolStatus.CIC_CORRECTED,
        Committee.CIC,
        ReviewOutcome.OBSERVED,
        ReviewOutcome.APPROVED,
        'p1',
      ),
    ).toThrow(ProtocolReviewCommitteeClosedException);
  });

  it('throws ProtocolReviewCicApprovalRequiredException when lastCicOutcome is null', () => {
    expect(() =>
      resolveNextProtocolStatus(
        ProtocolStatus.CREATED,
        Committee.CIEI,
        ReviewOutcome.OBSERVED,
        null,
        'p1',
      ),
    ).toThrow(ProtocolReviewCicApprovalRequiredException);
  });

  it('throws ProtocolReviewCicApprovalRequiredException when lastCicOutcome is OBSERVED', () => {
    expect(() =>
      resolveNextProtocolStatus(
        ProtocolStatus.CIC_OBSERVED,
        Committee.CIEI,
        ReviewOutcome.OBSERVED,
        ReviewOutcome.OBSERVED,
        'p1',
      ),
    ).toThrow(ProtocolReviewCicApprovalRequiredException);
  });

  it('resolves CIEI OBSERVED from CIC_CORRECTED with lastCicOutcome APPROVED to CIEI_OBSERVED', () => {
    expect(
      resolveNextProtocolStatus(
        ProtocolStatus.CIC_CORRECTED,
        Committee.CIEI,
        ReviewOutcome.OBSERVED,
        ReviewOutcome.APPROVED,
        'p1',
      ),
    ).toBe(ProtocolStatus.CIEI_OBSERVED);
  });

  it('throws ProtocolReviewObservationPendingException for CIEI FINALIZED while currentStatus is CIEI_OBSERVED', () => {
    expect(() =>
      resolveNextProtocolStatus(
        ProtocolStatus.CIEI_OBSERVED,
        Committee.CIEI,
        ReviewOutcome.FINALIZED,
        ReviewOutcome.APPROVED,
        'p1',
      ),
    ).toThrow(ProtocolReviewObservationPendingException);
  });

  it('resolves CIEI FINALIZED from CIEI_CORRECTED with lastCicOutcome APPROVED to FINALIZED', () => {
    expect(
      resolveNextProtocolStatus(
        ProtocolStatus.CIEI_CORRECTED,
        Committee.CIEI,
        ReviewOutcome.FINALIZED,
        ReviewOutcome.APPROVED,
        'p1',
      ),
    ).toBe(ProtocolStatus.FINALIZED);
  });
});

describe('resolveEthicsUpdate', () => {
  it('always returns an empty object for CIC', () => {
    expect(resolveEthicsUpdate(Committee.CIC, { catalogadoRiesgo: RiskLevel.HIGH_RISK })).toEqual({});
  });

  it('returns only the risk level for CIEI', () => {
    expect(resolveEthicsUpdate(Committee.CIEI, { catalogadoRiesgo: RiskLevel.MODERATE_RISK })).toEqual({
      catalogadoRiesgo: RiskLevel.MODERATE_RISK,
    });
  });

  it('returns an empty object for CIEI when no risk level was sent', () => {
    expect(resolveEthicsUpdate(Committee.CIEI, {})).toEqual({});
  });
});
