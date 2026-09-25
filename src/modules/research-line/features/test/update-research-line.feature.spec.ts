import { Prisma, LineType } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateResearchLineFeature } from '../update-research-line.feature';
import { FindResearchLineByIdFeature } from '../find-research-line-by-id.feature';
import { ResearchLineNameAndTypeAlreadyExistsException } from '../../exceptions/research-line-name-and-type-already-exists.exception';

describe('UpdateResearchLineFeature', () => {
  const prisma = { researchLine: { update: jest.fn() } } as unknown as PrismaService;
  const findResearchLineByIdFeature = { execute: jest.fn() } as unknown as FindResearchLineByIdFeature;
  const feature = new UpdateResearchLineFeature(prisma, findResearchLineByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the research line after checking it exists', async () => {
    const existing = { id: 'rl1' };
    const updated = {
      id: 'rl1',
      name: 'Nueva línea',
      type: LineType.HRL,
    };

    (findResearchLineByIdFeature.execute as jest.Mock).mockResolvedValue(existing);
    (prisma.researchLine.update as jest.Mock).mockResolvedValue(updated);

    await expect(
      feature.execute('rl1', {
        name: 'Nueva línea',
        type: LineType.HRL,
      }),
    ).resolves.toEqual(updated);

    expect(findResearchLineByIdFeature.execute).toHaveBeenCalledWith('rl1');
  });

  it('throws ResearchLineNameAndTypeAlreadyExistsException on a duplicate name and type', async () => {
    (findResearchLineByIdFeature.execute as jest.Mock).mockResolvedValue({
      id: 'rl1',
    });

    (prisma.researchLine.update as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: {
          driverAdapterError: {
            cause: {
              constraint: {
                index: 'research_lines_name_type_key',
              },
            },
          },
        },
      }),
    );

    await expect(
      feature.execute('rl1', {
        name: 'Duplicado',
        type: LineType.HRL,
      }),
    ).rejects.toBeInstanceOf(
      ResearchLineNameAndTypeAlreadyExistsException,
    );
  });
});