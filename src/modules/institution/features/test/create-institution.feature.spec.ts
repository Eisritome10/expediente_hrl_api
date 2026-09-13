import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateInstitutionFeature } from '../create-institution.feature';
import { InstitutionNameAlreadyExistsException } from '../../exceptions/institution-name-already-exists.exception';

describe('CreateInstitutionFeature', () => {
  const prisma = { institution: { create: jest.fn() } } as unknown as PrismaService;
  const feature = new CreateInstitutionFeature(prisma);

  const input = {
    name: 'Hospital Regional de Loreto',
    abbreviation: 'HRL',
    esUniversidad: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an institution', async () => {
    const created = { id: 'i1', ...input, createdAt: new Date(), updatedAt: new Date() };
    (prisma.institution.create as jest.Mock).mockResolvedValue(created);

    await expect(feature.execute(input)).resolves.toEqual(created);
    expect(prisma.institution.create).toHaveBeenCalledWith({ data: input });
  });

  it('throws InstitutionNameAlreadyExistsException on a duplicate name', async () => {
    (prisma.institution.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'institutions_name_key' } } } },
      }),
    );

    await expect(feature.execute(input)).rejects.toBeInstanceOf(InstitutionNameAlreadyExistsException);
  });
});
