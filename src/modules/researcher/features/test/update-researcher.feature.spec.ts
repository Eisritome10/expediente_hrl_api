import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateResearcherFeature } from '../update-researcher.feature';
import { FindResearcherByIdFeature } from '../find-researcher-by-id.feature';
import { ResearcherEmailAlreadyExistsException } from '../../exceptions/researcher-email-already-exists.exception';

describe('UpdateResearcherFeature', () => {
  const prisma = { researcher: { update: jest.fn() } } as unknown as PrismaService;
  const findResearcherByIdFeature = { execute: jest.fn() } as unknown as FindResearcherByIdFeature;
  const feature = new UpdateResearcherFeature(prisma, findResearcherByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the researcher after checking it exists', async () => {
    const existing = { id: 'r1' };
    const updated = { id: 'r1', firstName: 'Grace' };
    (findResearcherByIdFeature.execute as jest.Mock).mockResolvedValue(existing);
    (prisma.researcher.update as jest.Mock).mockResolvedValue(updated);

    await expect(feature.execute('r1', { firstName: 'Grace' })).resolves.toEqual(updated);
    expect(findResearcherByIdFeature.execute).toHaveBeenCalledWith('r1');
  });

  it('throws ResearcherEmailAlreadyExistsException on a duplicate email', async () => {
    (findResearcherByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'r1' });
    (prisma.researcher.update as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'researchers_email_key' } } } },
      }),
    );

    await expect(
      feature.execute('r1', { email: 'dup@example.com' }),
    ).rejects.toBeInstanceOf(ResearcherEmailAlreadyExistsException);
  });
});
