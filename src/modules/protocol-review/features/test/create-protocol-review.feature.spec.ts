import { ProtocolStatus, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateProtocolReviewFeature } from '../create-protocol-review.feature';
import { ProtocolNotFoundException } from '../../../protocol/exceptions/protocol-not-found.exception';
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
    $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(tx)),
  } as unknown as PrismaService;

  const feature = new CreateProtocolReviewFeature(prisma);

  const activeReviewer = { id: 'u1', status: UserStatus.ACTIVE };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a review with OBSERVED and observations', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({ id: 'p1', status: ProtocolStatus.CREATED });
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    const created = { id: 'rev1' };
    (tx.protocolReview.create as jest.Mock).mockResolvedValue(created);

    await expect(
      feature.execute({ protocolId: 'p1', reviewerId: 'u1', status: ProtocolStatus.OBSERVED, observations: '  Falta certificado  ' }),
    ).resolves.toEqual(created);

    expect(tx.protocol.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: { not: ProtocolStatus.FINALIZED } },
      data: { status: ProtocolStatus.OBSERVED },
    });
    expect(tx.protocolReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { protocolId: 'p1', reviewerId: 'u1', status: ProtocolStatus.OBSERVED, observations: 'Falta certificado' },
      }),
    );
  });

  it('creates a review with FINALIZED and no observations', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({ id: 'p1', status: ProtocolStatus.OBSERVED });
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    (tx.protocolReview.create as jest.Mock).mockResolvedValue({ id: 'rev2' });

    await feature.execute({ protocolId: 'p1', reviewerId: 'u1', status: ProtocolStatus.FINALIZED, observations: null });

    expect(tx.protocolReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: ProtocolStatus.FINALIZED, observations: null }),
      }),
    );
  });

  it('throws ProtocolReviewObservationsRequiredException when OBSERVED has no observations, without touching user or transaction', async () => {
    await expect(
      feature.execute({ protocolId: 'p1', reviewerId: 'u1', status: ProtocolStatus.OBSERVED, observations: undefined }),
    ).rejects.toBeInstanceOf(ProtocolReviewObservationsRequiredException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewObservationsRequiredException when observations is only whitespace', async () => {
    await expect(
      feature.execute({ protocolId: 'p1', reviewerId: 'u1', status: ProtocolStatus.OBSERVED, observations: '   ' }),
    ).rejects.toBeInstanceOf(ProtocolReviewObservationsRequiredException);
  });

  it('throws ProtocolReviewInvalidReviewerException when the reviewer does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      feature.execute({ protocolId: 'p1', reviewerId: 'missing', status: ProtocolStatus.FINALIZED, observations: null }),
    ).rejects.toBeInstanceOf(ProtocolReviewInvalidReviewerException);
  });

  it('throws ProtocolReviewInvalidReviewerException when the reviewer is inactive', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', status: UserStatus.INACTIVE });

    await expect(
      feature.execute({ protocolId: 'p1', reviewerId: 'u1', status: ProtocolStatus.FINALIZED, observations: null }),
    ).rejects.toBeInstanceOf(ProtocolReviewInvalidReviewerException);
  });

  it('throws ProtocolNotFoundException when the protocol does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      feature.execute({ protocolId: 'missing', reviewerId: 'u1', status: ProtocolStatus.FINALIZED, observations: null }),
    ).rejects.toBeInstanceOf(ProtocolNotFoundException);
  });

  it('throws ProtocolReviewProtocolAlreadyFinalizedException when the protocol is already FINALIZED, without opening a transaction', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({ id: 'p1', status: ProtocolStatus.FINALIZED });

    await expect(
      feature.execute({ protocolId: 'p1', reviewerId: 'u1', status: ProtocolStatus.OBSERVED, observations: 'x' }),
    ).rejects.toBeInstanceOf(ProtocolReviewProtocolAlreadyFinalizedException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ProtocolReviewProtocolAlreadyFinalizedException on a concurrent finalize race, without creating the review', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({ id: 'p1', status: ProtocolStatus.OBSERVED });
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    await expect(
      feature.execute({ protocolId: 'p1', reviewerId: 'u1', status: ProtocolStatus.FINALIZED, observations: null }),
    ).rejects.toBeInstanceOf(ProtocolReviewProtocolAlreadyFinalizedException);
    expect(tx.protocolReview.create).not.toHaveBeenCalled();
  });

  describe('allowed status transitions', () => {
    it.each([ProtocolStatus.CREATED, ProtocolStatus.OBSERVED, ProtocolStatus.CORRECTED])(
      'allows reviewing a protocol currently %s',
      async (currentStatus) => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeReviewer);
        (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({ id: 'p1', status: currentStatus });
        (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
        (tx.protocolReview.create as jest.Mock).mockResolvedValue({ id: 'rev' });

        await expect(
          feature.execute({ protocolId: 'p1', reviewerId: 'u1', status: ProtocolStatus.FINALIZED, observations: null }),
        ).resolves.toEqual({ id: 'rev' });
      },
    );
  });
});
