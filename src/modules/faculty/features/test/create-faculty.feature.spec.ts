import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateFacultyFeature } from '../create-faculty.feature';
import { FacultyNameAlreadyExistsException } from '../../exceptions/faculty-name-already-exists.exception';

describe('CreateFacultyFeature', () => {
  const prisma = { faculty: { create: jest.fn() } } as unknown as PrismaService;
  const feature = new CreateFacultyFeature(prisma);

  const input = { name: 'Facultad de Medicina Humana' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a faculty', async () => {
    const created = { id: 'f1', ...input, createdAt: new Date(), updatedAt: new Date() };
    (prisma.faculty.create as jest.Mock).mockResolvedValue(created);

    await expect(feature.execute(input)).resolves.toEqual(created);
    expect(prisma.faculty.create).toHaveBeenCalledWith({ data: input });
  });

  it('throws FacultyNameAlreadyExistsException on a duplicate name', async () => {
    (prisma.faculty.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'faculties_name_key' } } } },
      }),
    );

    await expect(feature.execute(input)).rejects.toBeInstanceOf(FacultyNameAlreadyExistsException);
  });
});
