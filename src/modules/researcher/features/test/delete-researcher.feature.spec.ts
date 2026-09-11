import { PrismaService } from '../../../../prisma/prisma.service';
import { DeleteResearcherFeature } from '../delete-researcher.feature';
import { FindResearcherByIdFeature } from '../find-researcher-by-id.feature';
import { ResearcherNotFoundException } from '../../exceptions/researcher-not-found.exception';

describe('DeleteResearcherFeature', () => {
  const prisma = { researcher: { delete: jest.fn() } } as unknown as PrismaService;
  const findResearcherByIdFeature = { execute: jest.fn() } as unknown as FindResearcherByIdFeature;
  const feature = new DeleteResearcherFeature(prisma, findResearcherByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the researcher after checking it exists', async () => {
    (findResearcherByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'r1' });
    (prisma.researcher.delete as jest.Mock).mockResolvedValue({ id: 'r1' });

    await feature.execute('r1');

    expect(findResearcherByIdFeature.execute).toHaveBeenCalledWith('r1');
    expect(prisma.researcher.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
  });

  it('propagates the not-found error without deleting', async () => {
    (findResearcherByIdFeature.execute as jest.Mock).mockRejectedValue(
      new ResearcherNotFoundException('missing'),
    );

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(ResearcherNotFoundException);
    expect(prisma.researcher.delete).not.toHaveBeenCalled();
  });
});
