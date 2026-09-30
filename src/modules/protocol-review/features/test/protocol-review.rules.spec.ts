import { Committee, ProtocolStatus, ReviewOutcome, RiskLevel } from '@prisma/client';
import {
  assertReviewRequest,
  resolveEthicsUpdate,
  resolveNextProtocolStatus,
} from '../../protocol-review.rules';
import { ProtocolReviewInvalidOutcomeForCommitteeException } from '../../exceptions/protocol-review-invalid-outcome-for-committee.exception';
import { ProtocolReviewObservationsRequiredException } from '../../exceptions/protocol-review-observations-required.exception';
import { ProtocolReviewEthicsFieldsNotAllowedException } from '../../exceptions/protocol-review-ethics-fields-not-allowed.exception';
import { ProtocolReviewConstanciaIncompleteException } from '../../exceptions/protocol-review-constancia-incomplete.exception';
import { ProtocolReviewFinalizationIncompleteException } from '../../exceptions/protocol-review-finalization-incomplete.exception';
import { ProtocolReviewCommitteeClosedException } from '../../exceptions/protocol-review-committee-closed.exception';
import { ProtocolReviewCicApprovalRequiredException } from '../../exceptions/protocol-review-cic-approval-required.exception';
import { ProtocolReviewObservationPendingException } from '../../exceptions/protocol-review-observation-pending.exception';

describe('assertReviewRequest', () => {
  it('does not throw for a valid CIC OBSERVED review with observations', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIC,
        outcome: ReviewOutcome.OBSERVED,
        observations: 'Falta el certificado',
      }),
    ).not.toThrow();
  });

  it('does not throw for a valid CIC APPROVED review without observations', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
      }),
    ).not.toThrow();
  });

  it('does not throw for a valid CIEI OBSERVED review with observations', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIEI,
        outcome: ReviewOutcome.OBSERVED,
        observations: 'Ajustar el consentimiento',
      }),
    ).not.toThrow();
  });

  it('does not throw for a valid CIEI FINALIZED review with all required ethics fields', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIEI,
        outcome: ReviewOutcome.FINALIZED,
        tieneConstanciaEtica: true,
        idConstanciaEtica: 'constancia-1',
        fechaConstancia: new Date('2026-01-01'),
        catalogadoRiesgo: RiskLevel.MINIMAL_RISK,
        consentimientoInformado: true,
      }),
    ).not.toThrow();
  });

  it('throws ProtocolReviewInvalidOutcomeForCommitteeException for a CIC FINALIZED outcome', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIC,
        outcome: ReviewOutcome.FINALIZED,
      }),
    ).toThrow(ProtocolReviewInvalidOutcomeForCommitteeException);
  });

  it('throws ProtocolReviewInvalidOutcomeForCommitteeException for a CIEI APPROVED outcome', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIEI,
        outcome: ReviewOutcome.APPROVED,
      }),
    ).toThrow(ProtocolReviewInvalidOutcomeForCommitteeException);
  });

  it('throws ProtocolReviewObservationsRequiredException for OBSERVED without observations', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIC,
        outcome: ReviewOutcome.OBSERVED,
        observations: '   ',
      }),
    ).toThrow(ProtocolReviewObservationsRequiredException);
  });

  it('throws ProtocolReviewEthicsFieldsNotAllowedException when a CIC review sends an ethics field', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        tieneConstanciaEtica: true,
      }),
    ).toThrow(ProtocolReviewEthicsFieldsNotAllowedException);
  });

  it('allows a CIC review when ethics fields are null or undefined', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        tieneConstanciaEtica: undefined,
        idConstanciaEtica: null,
        fechaConstancia: null,
        catalogadoRiesgo: null,
        consentimientoInformado: undefined,
        departamentoDirigidoPermiso: null,
      }),
    ).not.toThrow();
  });

  it('throws ProtocolReviewConstanciaIncompleteException when tieneConstanciaEtica is true but idConstanciaEtica is missing', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIEI,
        outcome: ReviewOutcome.OBSERVED,
        observations: 'Observacion',
        tieneConstanciaEtica: true,
        fechaConstancia: new Date('2026-01-01'),
      }),
    ).toThrow(ProtocolReviewConstanciaIncompleteException);
  });

  it('throws ProtocolReviewFinalizationIncompleteException when a CIEI FINALIZED review misses catalogadoRiesgo', () => {
    expect(() =>
      assertReviewRequest({
        committee: Committee.CIEI,
        outcome: ReviewOutcome.FINALIZED,
        tieneConstanciaEtica: true,
        idConstanciaEtica: 'constancia-1',
        fechaConstancia: new Date('2026-01-01'),
        consentimientoInformado: true,
      }),
    ).toThrow(ProtocolReviewFinalizationIncompleteException);
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
    expect(
      resolveEthicsUpdate(Committee.CIC, {
        tieneConstanciaEtica: true,
        idConstanciaEtica: 'constancia-1',
      }),
    ).toEqual({});
  });

  it('returns only the defined ethics keys that were sent for CIEI', () => {
    const fecha = new Date('2026-01-01');
    expect(
      resolveEthicsUpdate(Committee.CIEI, {
        tieneConstanciaEtica: true,
        idConstanciaEtica: 'constancia-1',
        fechaConstancia: fecha,
      }),
    ).toEqual({
      tieneConstanciaEtica: true,
      idConstanciaEtica: 'constancia-1',
      fechaConstancia: fecha,
    });
  });

  it('nulls out idConstanciaEtica and fechaConstancia when tieneConstanciaEtica is false for CIEI', () => {
    expect(
      resolveEthicsUpdate(Committee.CIEI, {
        tieneConstanciaEtica: false,
      }),
    ).toEqual({
      tieneConstanciaEtica: false,
      idConstanciaEtica: null,
      fechaConstancia: null,
    });
  });
});
