import { Committee, ProtocolStatus, ReviewOutcome, RiskLevel, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateProtocolReviewFeature } from '../create-protocol-review.feature';
import { ProtocolNotFoundException } from '../../../protocol/exceptions/protocol-not-found.exception';
import { ProtocolReviewCicApprovalRequiredException } from '../../exceptions/protocol-review-cic-approval-required.exception';
import { ProtocolReviewCommitteeClosedException } from '../../exceptions/protocol-review-committee-closed.exception';
import { ProtocolReviewConcurrentUpdateException } from '../../exceptions/protocol-review-concurrent-update.exception';
import { ProtocolReviewEthicsFieldsNotAllowedException } from '../../exceptions/protocol-review-ethics-fields-not-allowed.exception';
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a CIC review with outcome OBSERVED and observations', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({
      id: 'p1',
      status: ProtocolStatus.CREATED,
      updatedAt: someDate,
    });
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
        observations: '  Falta certificado  ',
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
          observations: 'Falta certificado',
        }),
      }),
    );
  });

  it('creates a CIC review with outcome APPROVED without changing the protocol status', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({
      id: 'p1',
      status: ProtocolStatus.CIC_CORRECTED,
      updatedAt: someDate,
    });
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue(null);
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    const created = { id: 'rev2' };
    (tx.protocolReview.create as jest.Mock).mockResolvedValue(created);

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        observations: null,
      }),
    ).resolves.toEqual(created);

    expect(tx.protocol.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: ProtocolStatus.CIC_CORRECTED, updatedAt: someDate },
      data: { status: ProtocolStatus.CIC_CORRECTED },
    });
    expect(tx.protocolReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          committee: Committee.CIC,
          outcome: ReviewOutcome.APPROVED,
        }),
      }),
    );
  });

  it('creates a CIEI review with outcome OBSERVED after a CIC approval', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({
      id: 'p1',
      status: ProtocolStatus.CIC_CORRECTED,
      updatedAt: someDate,
    });
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue({ outcome: ReviewOutcome.APPROVED });
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    (tx.protocolReview.create as jest.Mock).mockResolvedValue({ id: 'rev3' });

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIEI,
        outcome: ReviewOutcome.OBSERVED,
        observations: 'Ajustar el consentimiento',
      }),
    ).resolves.toEqual({ id: 'rev3' });

    expect(tx.protocol.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: ProtocolStatus.CIC_CORRECTED, updatedAt: someDate },
      data: { status: ProtocolStatus.CIEI_OBSERVED },
    });
  });

  it('creates a CIEI FINALIZED review merging the ethics fields into the protocol update', async () => {
    const fechaConstancia = new Date('2026-02-01T00:00:00.000Z');
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({
      id: 'p1',
      status: ProtocolStatus.CIEI_CORRECTED,
      updatedAt: someDate,
    });
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
        observations: null,
        tieneConstanciaEtica: true,
        idConstanciaEtica: 'CE-1',
        fechaConstancia,
        catalogadoRiesgo: RiskLevel.MODERATE_RISK,
        consentimientoInformado: true,
      }),
    ).resolves.toEqual(created);

    expect(tx.protocol.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: ProtocolStatus.CIEI_CORRECTED, updatedAt: someDate },
      data: {
        status: ProtocolStatus.FINALIZED,
        tieneConstanciaEtica: true,
        idConstanciaEtica: 'CE-1',
        fechaConstancia,
        catalogadoRiesgo: RiskLevel.MODERATE_RISK,
        consentimientoInformado: true,
      },
    });
    expect(tx.protocolReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          committee: Committee.CIEI,
          outcome: ReviewOutcome.FINALIZED,
        }),
      }),
    );
  });

  it('throws ProtocolReviewInvalidReviewerException when the reviewer does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'missing',
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        observations: null,
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewInvalidReviewerException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewInvalidReviewerException when the reviewer is inactive', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', status: UserStatus.INACTIVE });

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        observations: null,
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewInvalidReviewerException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
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
        observations: null,
      }),
    ).rejects.toBeInstanceOf(ProtocolNotFoundException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewProtocolAlreadyFinalizedException when the protocol is already FINALIZED, without opening a transaction', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({
      id: 'p1',
      status: ProtocolStatus.FINALIZED,
      updatedAt: someDate,
    });

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        observations: null,
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewProtocolAlreadyFinalizedException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewObservationsRequiredException when OBSERVED has blank observations, before any prisma call', async () => {
    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.OBSERVED,
        observations: '   ',
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewObservationsRequiredException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.protocol.findUnique).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewInvalidOutcomeForCommitteeException when CIC is given FINALIZED, before any prisma call', async () => {
    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.FINALIZED,
        observations: null,
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewInvalidOutcomeForCommitteeException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewEthicsFieldsNotAllowedException when CIC sends ethics fields, before any prisma call', async () => {
    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        observations: null,
        tieneConstanciaEtica: true,
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewEthicsFieldsNotAllowedException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewCommitteeClosedException when CIC reviews a protocol already at CIEI, without opening a transaction', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({
      id: 'p1',
      status: ProtocolStatus.CIEI_OBSERVED,
      updatedAt: someDate,
    });
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.APPROVED,
        observations: null,
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewCommitteeClosedException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewCicApprovalRequiredException when CIEI reviews without a prior CIC approval, without opening a transaction', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({
      id: 'p1',
      status: ProtocolStatus.CREATED,
      updatedAt: someDate,
    });
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIEI,
        outcome: ReviewOutcome.OBSERVED,
        observations: 'Observación de CIEI',
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewCicApprovalRequiredException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewConcurrentUpdateException on a concurrent race, without creating the review', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({
      id: 'p1',
      status: ProtocolStatus.CREATED,
      updatedAt: someDate,
    });
    (prisma.protocolReview.findFirst as jest.Mock).mockResolvedValue(null);
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    await expect(
      feature.execute({
        protocolId: 'p1',
        reviewerId: 'u1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.OBSERVED,
        observations: 'Algo cambió',
      }),
    ).rejects.toBeInstanceOf(ProtocolReviewConcurrentUpdateException);
    expect(tx.protocolReview.create).not.toHaveBeenCalled();
  });
});
