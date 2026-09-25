import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { DeleteResearchLineFeature } from '../delete-research-line.feature';
import { FindResearchLineByIdFeature } from '../find-research-line-by-id.feature';
import { ResearchLineNotFoundException } from '../../exceptions/research-line-not-found.exception';
import { ResearchLineInUseByProtocolException } from '../../exceptions/research-line-in-use-by-protocol.exception';

describe('DeleteResearchLineFeature', () => {
  const prisma = { researchLine: { delete: jest.fn() } } as unknown as PrismaService;
  const findResearchLineByIdFeature = { execute: jest.fn() } as unknown as FindResearchLineByIdFeature;
  const feature = new DeleteResearchLineFeature(prisma, findResearchLineByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the research line after checking it exists', async () => {
    (findResearchLineByIdFeature.execute as jest.Mock).mockResolvedValue({
      id: 'rl1',
    });

    (prisma.researchLine.delete as jest.Mock).mockResolvedValue({
      id: 'rl1',
    });

    await feature.execute('rl1');

    expect(findResearchLineByIdFeature.execute).toHaveBeenCalledWith('rl1');
    expect(prisma.researchLine.delete).toHaveBeenCalledWith({
      where: { id: 'rl1' },
    });
  });

  it('propagates the not-found error without deleting', async () => {
    (findResearchLineByIdFeature.execute as jest.Mock).mockRejectedValue(
      new ResearchLineNotFoundException('missing'),
    );

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(
      ResearchLineNotFoundException,
    );

    expect(prisma.researchLine.delete).not.toHaveBeenCalled();
  });

  it('throws ResearchLineInUseByProtocolException when the research line is being used by a protocol', async () => {
    (findResearchLineByIdFeature.execute as jest.Mock).mockResolvedValue({
      id: 'rl1',
    });

    const foreignKeyError = new Prisma.PrismaClientKnownRequestError(
      'Foreign key constraint failed',
      {
        code: 'P2003',
        clientVersion: '7.10.0',
      },
    );

    (prisma.researchLine.delete as jest.Mock).mockRejectedValue(
      foreignKeyError,
    );

    await expect(feature.execute('rl1')).rejects.toBeInstanceOf(
      ResearchLineInUseByProtocolException,
    );

    expect(prisma.researchLine.delete).toHaveBeenCalledWith({
      where: { id: 'rl1' },
    });
  });
});