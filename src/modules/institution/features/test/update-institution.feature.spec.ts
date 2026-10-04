import { InstitutionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateInstitutionFeature } from '../update-institution.feature';
import { FindInstitutionByIdFeature } from '../find-institution-by-id.feature';
import { InstitutionNameAlreadyExistsException } from '../../exceptions/institution-name-already-exists.exception';
import { InstitutionHasFacultiesException } from '../../exceptions/institution-has-faculties.exception';

describe('UpdateInstitutionFeature', () => {
  const prisma = { institution: { update: jest.fn() }, faculty: { count: jest.fn() } } as unknown as PrismaService;
  const findInstitutionByIdFeature = { execute: jest.fn() } as unknown as FindInstitutionByIdFeature;
  const feature = new UpdateInstitutionFeature(prisma, findInstitutionByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the institution after checking it exists', async () => {
    const existing = { id: 'i1' };
    const updated = { id: 'i1', name: 'Nuevo Nombre' };
    (findInstitutionByIdFeature.execute as jest.Mock).mockResolvedValue(existing);
    (prisma.institution.update as jest.Mock).mockResolvedValue(updated);

    await expect(feature.execute('i1', { name: 'Nuevo Nombre' })).resolves.toEqual(updated);
    expect(findInstitutionByIdFeature.execute).toHaveBeenCalledWith('i1');
  });

  it('throws InstitutionNameAlreadyExistsException on a duplicate name', async () => {
    (findInstitutionByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'i1' });
    (prisma.institution.update as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'institutions_name_key' } } } },
      }),
    );

    await expect(
      feature.execute('i1', { name: 'Duplicado' }),
    ).rejects.toBeInstanceOf(InstitutionNameAlreadyExistsException);
  });

  it('throws InstitutionHasFacultiesException when a university with faculties changes type', async () => {
    (findInstitutionByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'i1', type: InstitutionType.UNIVERSITY });
    (prisma.faculty.count as jest.Mock).mockResolvedValue(3);

    await expect(feature.execute('i1', { type: InstitutionType.OTHER })).rejects.toBeInstanceOf(
      InstitutionHasFacultiesException,
    );
    expect(prisma.institution.update).not.toHaveBeenCalled();
  });

  it('lets a university without faculties change type', async () => {
    (findInstitutionByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'i1', type: InstitutionType.UNIVERSITY });
    (prisma.faculty.count as jest.Mock).mockResolvedValue(0);
    (prisma.institution.update as jest.Mock).mockResolvedValue({ id: 'i1', type: InstitutionType.OTHER });

    await expect(feature.execute('i1', { type: InstitutionType.OTHER })).resolves.toEqual({
      id: 'i1',
      type: InstitutionType.OTHER,
    });
  });

  it('does not count faculties when the type does not change', async () => {
    (findInstitutionByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'i1', type: InstitutionType.UNIVERSITY });
    (prisma.institution.update as jest.Mock).mockResolvedValue({ id: 'i1' });

    await feature.execute('i1', { type: InstitutionType.UNIVERSITY, name: 'NUEVO' });

    expect(prisma.faculty.count).not.toHaveBeenCalled();
  });
});
