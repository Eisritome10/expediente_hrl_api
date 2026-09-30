import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateResearcherFeature } from '../update-researcher.feature';
import { FindResearcherByIdFeature } from '../find-researcher-by-id.feature';
import { ResearcherEmailAlreadyExistsException } from '../../exceptions/researcher-email-already-exists.exception';
import { ResearcherNotFoundException } from '../../exceptions/researcher-not-found.exception';
import { UserEmailAlreadyExistsException } from '../../../user/exceptions/user-email-already-exists.exception';

describe('UpdateResearcherFeature', () => {
  const prisma = {
    researcher: { update: jest.fn() },
    user: { updateMany: jest.fn() },
    $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
  } as unknown as PrismaService;
  const findResearcherByIdFeature = { execute: jest.fn() } as unknown as FindResearcherByIdFeature;
  const feature = new UpdateResearcherFeature(prisma, findResearcherByIdFeature);

  const current = { id: 'r1', firstName: 'Ada', lastName: 'Lovelace' };

  // @prisma/adapter-pg doesn't populate `meta.target`; the constraint name only
  // shows up nested under `meta.driverAdapterError`.
  const uniqueViolation = (index: string) =>
    new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: '7.10.0',
      meta: { driverAdapterError: { cause: { constraint: { index } } } },
    });

  beforeEach(() => {
    jest.clearAllMocks();
    (findResearcherByIdFeature.execute as jest.Mock).mockResolvedValue(current);
  });

  it('updates the researcher and the linked user in a transaction when the email changes', async () => {
    const updated = { id: 'r1', email: 'new@example.com' };
    (prisma.researcher.update as jest.Mock).mockResolvedValue(updated);
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    await expect(feature.execute('r1', { email: 'new@example.com' })).resolves.toEqual(updated);

    expect(findResearcherByIdFeature.execute).toHaveBeenCalledWith('r1');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.researcher.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { email: 'new@example.com' },
    });
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { researcherId: 'r1' },
      data: { email: 'new@example.com' },
    });
  });

  it('syncs fullName on the linked user when the name changes', async () => {
    (prisma.researcher.update as jest.Mock).mockResolvedValue({ id: 'r1' });
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    await feature.execute('r1', { firstName: 'Grace' });

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { researcherId: 'r1' },
      data: { fullName: 'Grace Lovelace' },
    });
  });

  it('does not touch the linked user when only the phone changes', async () => {
    (prisma.researcher.update as jest.Mock).mockResolvedValue({ id: 'r1' });

    await expect(feature.execute('r1', { phone: '999999999' })).resolves.toEqual({ id: 'r1' });

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
    expect(prisma.researcher.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { phone: '999999999' },
    });
  });

  it('throws UserEmailAlreadyExistsException on a duplicate user email', async () => {
    (prisma.researcher.update as jest.Mock).mockRejectedValue(uniqueViolation('users_email_key'));

    await expect(feature.execute('r1', { email: 'dup@example.com' })).rejects.toBeInstanceOf(
      UserEmailAlreadyExistsException,
    );
  });

  it('throws ResearcherEmailAlreadyExistsException on a duplicate researcher email', async () => {
    (prisma.researcher.update as jest.Mock).mockRejectedValue(uniqueViolation('researchers_email_key'));

    await expect(feature.execute('r1', { email: 'dup@example.com' })).rejects.toBeInstanceOf(
      ResearcherEmailAlreadyExistsException,
    );
  });

  it('propagates ResearcherNotFoundException without updating', async () => {
    (findResearcherByIdFeature.execute as jest.Mock).mockRejectedValue(
      new ResearcherNotFoundException('missing'),
    );

    await expect(feature.execute('missing', { phone: '999999999' })).rejects.toBeInstanceOf(
      ResearcherNotFoundException,
    );
    expect(prisma.researcher.update).not.toHaveBeenCalled();
  });
});
