import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateFacultyFeature } from '../update-faculty.feature';
import { FindFacultyByIdFeature } from '../find-faculty-by-id.feature';
import { FacultyNameAlreadyExistsException } from '../../exceptions/faculty-name-already-exists.exception';

describe('UpdateFacultyFeature', () => {
  const prisma = { faculty: { update: jest.fn() } } as unknown as PrismaService;
  const findFacultyByIdFeature = { execute: jest.fn() } as unknown as FindFacultyByIdFeature;
  const feature = new UpdateFacultyFeature(prisma, findFacultyByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the faculty after checking it exists', async () => {
    const existing = { id: 'f1' };
    const updated = { id: 'f1', name: 'Nuevo Nombre' };
    (findFacultyByIdFeature.execute as jest.Mock).mockResolvedValue(existing);
    (prisma.faculty.update as jest.Mock).mockResolvedValue(updated);

    await expect(feature.execute('f1', { name: 'Nuevo Nombre' })).resolves.toEqual(updated);
    expect(findFacultyByIdFeature.execute).toHaveBeenCalledWith('f1');
  });

  it('throws FacultyNameAlreadyExistsException on a duplicate name', async () => {
    (findFacultyByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'f1' });
    (prisma.faculty.update as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'faculties_name_key' } } } },
      }),
    );

    await expect(
      feature.execute('f1', { name: 'Duplicado' }),
    ).rejects.toBeInstanceOf(FacultyNameAlreadyExistsException);
  });
});
