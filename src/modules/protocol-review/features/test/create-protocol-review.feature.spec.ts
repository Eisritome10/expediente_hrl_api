import { Committee, ObservationType, ProtocolStatus, ReviewOutcome, RiskLevel, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateProtocolReviewFeature } from '../create-protocol-review.feature';
import { ProtocolNotFoundException } from '../../../protocol/exceptions/protocol-not-found.exception';
import { ProtocolReviewCicApprovalRequiredException } from '../../exceptions/protocol-review-cic-approval-required.exception';
import { ProtocolReviewCommitteeClosedException } from '../../exceptions/protocol-review-committee-closed.exception';
import { ProtocolReviewConcurrentUpdateException } from '../../exceptions/protocol-review-concurrent-update.exception';
import { ProtocolReviewEthicsFieldsNotAllowedException } from '../../exceptions/protocol-review-ethics-fields-not-allowed.exception';
import { ProtocolReviewFinalizationIncompleteException } from '../../exceptions/protocol-review-finalization-incomplete.exception';
import { ProtocolReviewInvalidOutcomeForCommitteeException } from '../../exceptions/protocol-review-invalid-outcome-for-committee.exception';
import { ProtocolReviewInvalidReviewerException } from '../../exceptions/protocol-review-invalid-reviewer.exception';
import { ProtocolReviewObservationsRequiredException } from '../../exceptions/protocol-review-observations-required.exception';
import { ProtocolReviewProtocolAlreadyFinalizedException } from '../../exceptions/protocol-review-protocol-already-finalized.exception';

describe('CreateProtocolReviewFeature', () => {
  const tx = {
    protocol: { updateMany: jest.fn() },
    protocolReview: { create: jest.fn() },
  };

  const prisma = {
    user: { findUnique: jest.fn() },
    protocol: { findUnique: jest.fn() },
    protocolReview: { findFirst: jest.fn() },
    $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(tx)),
  } as unknown as PrismaService;

  const feature = new CreateProtocolReviewFeature(prisma);

  const activeReviewer = { id: 'u1', status: UserStatus.ACTIVE };
  const someDate = new Date('2026-01-15T10:00:00.000Z');

  const protocolWith = (overrides: Record<string, unknown> = {}) => ({
    id: 'p1',
    status: ProtocolStatus.CREATED,
    updatedAt: someDate,
    requiereRevisionHc: false,
    tieneConstanciaEtica: true,
    consentimientoInformado: true,
    certificadoBuenasPracticas: false,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a CIC OBSERVED review storing every typed observation, trimmed, and never touching the legacy column', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(protocolWith());
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue(null);
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    const created = { id: 'rev1' };
    (tx.protocolReview.create as jest.Mock).mockResolvedValue(created);

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.OBSERVED,
        observations: [
          { type: ObservationType.ADMINISTRATIVE, text: '  Falta la boleta  ' },
          { type: ObservationType.METHODOLOGICAL, text: 'Objetivo ambiguo' },
        ],
      }),
    ).resolves.toEqual(created);

    expect(tx.protocol.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: ProtocolStatus.CREATED, updatedAt: someDate },
      data: { status: ProtocolStatus.CIC_OBSERVED },
    });
    expect(tx.protocolReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          protocolId: 'p1',
          reviewerId: 'u1',
          committee: Committee.CIC,
          outcome: ReviewOutcome.OBSERVED,
          observations: null,
          observationItems: {
            create: [
              { type: ObservationType.ADMINISTRATIVE, text: 'Falta la boleta' },
              { type: ObservationType.METHODOLOGICAL, text: 'Objetivo ambiguo' },
            ],
          },
        }),
      }),
    );
  });

  it('creates a CIC APPROVED review without payment and without observations', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(
      protocolWith({ status: ProtocolStatus.CIC_CORRECTED }),
    );
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue(null);
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    (tx.protocolReview.create as jest.Mock).mockResolvedValue({ id: 'rev2' });

    await feature.execute({
      protocolId: 'p1',
      reviewerId: 'u1',
      committee: Committee.CIC,
      outcome: ReviewOutcome.APPROVED,
      observations: [],
    });

    expect(tx.protocol.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: ProtocolStatus.CIC_CORRECTED, updatedAt: someDate },
      data: { status: ProtocolStatus.CIC_CORRECTED },
    });
    const data = (tx.protocolReview.create as jest.Mock).mock.calls[0][0].data;
    expect(data.observationItems).toEqual({ create: [] });
    expect(data.pagoRevision).toBeUndefined();
  });

  it('creates a CIEI review with outcome OBSERVED after a CIC approval', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(
      protocolWith({ status: ProtocolStatus.CIC_CORRECTED }),
    );
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue({ outcome: ReviewOutcome.APPROVED });
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    (tx.protocolReview.create as jest.Mock).mockResolvedValue({ id: 'rev3' });

    await feature.execute({
      protocolId: 'p1',
      reviewerId: 'u1',
      committee: Committee.CIEI,
      outcome: ReviewOutcome.OBSERVED,
      observations: [{ type: ObservationType.ETHICS_CONSTANCE, text: 'Constancia mal redactada' }],
    });

    expect(tx.protocol.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: ProtocolStatus.CIC_CORRECTED, updatedAt: someDate },
      data: { status: ProtocolStatus.CIEI_OBSERVED },
    });
  });

  it('creates a CIEI FINALIZED review writing only the risk level into the protocol update', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(
      protocolWith({
        status: ProtocolStatus.CIEI_CORRECTED,
        requiereRevisionHc: true,
        certificadoBuenasPracticas: true,
      }),
    );
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue({ outcome: ReviewOutcome.APPROVED });
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    const created = { id: 'rev4' };
    (tx.protocolReview.create as jest.Mock).mockResolvedValue(created);

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIEI,
        outcome: ReviewOutcome.FINALIZED,
        observations: [],
        catalogadoRiesgo: RiskLevel.MODERATE_RISK,
      }),
    ).resolves.toEqual(created);

    expect(tx.protocol.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: ProtocolStatus.CIEI_CORRECTED, updatedAt: someDate },
      data: { status: ProtocolStatus.FINALIZED, catalogadoRiesgo: RiskLevel.MODERATE_RISK },
    });
  });

  it('throws ProtocolReviewFinalizationIncompleteException when CIEI finalizes without the risk level, without opening a transaction', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(
      protocolWith({ status: ProtocolStatus.CIEI_CORRECTED }),
    );
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue({ outcome: ReviewOutcome.APPROVED });

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIEI,
        outcome: ReviewOutcome.FINALIZED,
        observations: [],
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewFinalizationIncompleteException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('lets the CIEI finalize a protocol that has no constancia, consent nor good practices certificate registered', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(
      protocolWith({
        status: ProtocolStatus.CIEI_CORRECTED,
        requiereRevisionHc: true,
        tieneConstanciaEtica: false,
        consentimientoInformado: false,
        certificadoBuenasPracticas: false,
      }),
    );
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue({ outcome: ReviewOutcome.APPROVED });
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    (tx.protocolReview.create as jest.Mock).mockResolvedValue({ id: 'rev5' });

    await feature.execute({
      protocolId: 'p1',
      reviewerId: 'u1',
      committee: Committee.CIEI,
      outcome: ReviewOutcome.FINALIZED,
      observations: [],
      catalogadoRiesgo: RiskLevel.NO_RISK,
    });

    expect(tx.protocol.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: ProtocolStatus.CIEI_CORRECTED, updatedAt: someDate },
      data: { status: ProtocolStatus.FINALIZED, catalogadoRiesgo: RiskLevel.NO_RISK },
    });
  });

  it('throws ProtocolReviewInvalidReviewerException when the reviewer does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'ghost',
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        observations: [],
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewInvalidReviewerException);
    expect(prisma.protocol.findUnique).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewInvalidReviewerException when the reviewer is inactive', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', status: UserStatus.INACTIVE });

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        observations: [],
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewInvalidReviewerException);
  });

  it('throws ProtocolNotFoundException when the protocol does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      feature.execute({
        protocolId: 'missing',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        observations: [],
      }),
    ).rejects.toBeInstanceOf(ProtocolNotFoundException);
  });

  it('throws ProtocolReviewProtocolAlreadyFinalizedException when the protocol is already FINALIZED, without opening a transaction', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(protocolWith({ status: ProtocolStatus.FINALIZED }));

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIEI,
        outcome: ReviewOutcome.OBSERVED,
        observations: [{ type: ObservationType.METHODOLOGICAL, text: 'Algo' }],
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewProtocolAlreadyFinalizedException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewObservationsRequiredException when OBSERVED has no observations, before any prisma call', async () => {
    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.OBSERVED,
        observations: [],
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewObservationsRequiredException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewObservationsRequiredException when an observation has blank text after trimming', async () => {
    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.OBSERVED,
        observations: [{ type: ObservationType.ADMINISTRATIVE, text: '   ' }],
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewObservationsRequiredException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewInvalidOutcomeForCommitteeException when CIC is given FINALIZED, before any prisma call', async () => {
    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.FINALIZED,
        observations: [],
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewInvalidOutcomeForCommitteeException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewEthicsFieldsNotAllowedException when CIC sends the risk level, before any prisma call', async () => {
    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        observations: [],
        catalogadoRiesgo: RiskLevel.HIGH_RISK,
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewEthicsFieldsNotAllowedException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewCommitteeClosedException when CIC reviews a protocol already at CIEI, without opening a transaction', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(protocolWith({ status: ProtocolStatus.CIEI_OBSERVED }));
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        observations: [],
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewCommitteeClosedException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewCicApprovalRequiredException when CIEI reviews without a prior CIC approval, without opening a transaction', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(protocolWith());
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIEI,
        outcome: ReviewOutcome.OBSERVED,
        observations: [{ type: ObservationType.INFORMED_CONSENT, text: 'Observación de CIEI' }],
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewCicApprovalRequiredException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewConcurrentUpdateException on a concurrent race, without creating the review', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(protocolWith());
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue(null);
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.OBSERVED,
        observations: [{ type: ObservationType.LEGAL_INSTITUTIONAL, text: 'Algo cambió' }],
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewConcurrentUpdateException);
    expect(tx.protocolReview.create).not.toHaveBeenCalled();
  });
});
