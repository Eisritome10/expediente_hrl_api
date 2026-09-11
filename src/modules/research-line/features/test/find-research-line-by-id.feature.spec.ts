import { PrismaService } from '../../../../prisma/prisma.service';
import { FindResearchLineByIdFeature } from '../find-research-line-by-id.feature';
import { ResearchLineNotFoundException } from '../../exceptions/research-line-not-found.exception';

describe('FindResearchLineByIdFeature', () => {
  const prisma = { researchLine: { findUnique: jest.fn() } } as unknown as PrismaService;
  const feature = new FindResearchLineByIdFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the research line when found', async () => {
    const researchLine = { id: 'l1', name: 'Cardiología' };
    (prisma.researchLine.findUnique as jest.Mock).mockResolvedValue(researchLine);

    await expect(feature.execute('l1')).resolves.toEqual(researchLine);
  });

  it('throws ResearchLineNotFoundException when missing', async () => {
    (prisma.researchLine.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(ResearchLineNotFoundException);
  });
});
