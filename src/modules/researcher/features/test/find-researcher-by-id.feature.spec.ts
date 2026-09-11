import { PrismaService } from '../../../../prisma/prisma.service';
import { FindResearcherByIdFeature } from '../find-researcher-by-id.feature';
import { ResearcherNotFoundException } from '../../exceptions/researcher-not-found.exception';

describe('FindResearcherByIdFeature', () => {
  const prisma = { researcher: { findUnique: jest.fn() } } as unknown as PrismaService;
  const feature = new FindResearcherByIdFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the researcher when found', async () => {
    const researcher = { id: 'r1', dni: '12345678' };
    (prisma.researcher.findUnique as jest.Mock).mockResolvedValue(researcher);

    await expect(feature.execute('r1')).resolves.toEqual(researcher);
  });

  it('throws ResearcherNotFoundException when missing', async () => {
    (prisma.researcher.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(ResearcherNotFoundException);
  });
});
