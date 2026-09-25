import { Prisma, LineType } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateResearchLineFeature } from '../create-research-line.feature';
import { ResearchLineNameAndTypeAlreadyExistsException } from '../../exceptions/research-line-name-and-type-already-exists.exception';

describe('CreateResearchLineFeature', () => {
  const prisma = { researchLine: { create: jest.fn() } } as unknown as PrismaService;
  const feature = new CreateResearchLineFeature(prisma);

  const input = {
    name: 'Inteligencia Artificial',
    type: LineType.HRL,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a research line', async () => {
    const created = {
      id: 'rl1',
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.researchLine.create as jest.Mock).mockResolvedValue(created);

    await expect(feature.execute(input)).resolves.toEqual(created);
    expect(prisma.researchLine.create).toHaveBeenCalledWith({
      data: input,
    });
  });

  it('throws ResearchLineNameAndTypeAlreadyExistsException on a duplicate name and type', async () => {
    (prisma.researchLine.create as jest.Mock).mockRejectedValue(
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

    await expect(feature.execute(input)).rejects.toBeInstanceOf(
      ResearchLineNameAndTypeAlreadyExistsException,
    );
  });
});