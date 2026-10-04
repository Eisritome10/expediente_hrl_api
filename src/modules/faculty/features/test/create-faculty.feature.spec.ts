import { InstitutionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateFacultyFeature } from '../create-faculty.feature';
import { FacultyNameAlreadyExistsException } from '../../exceptions/faculty-name-already-exists.exception';
import { FacultyInstitutionNotUniversityException } from '../../exceptions/faculty-institution-not-university.exception';
import { InstitutionNotFoundException } from '../../../institution/exceptions/institution-not-found.exception';
import { FACULTY_INCLUDE } from '../../faculty.include';

describe('CreateFacultyFeature', () => {
  const prisma = {
    institution: { findUnique: jest.fn() },
    faculty: { create: jest.fn() },
  } as unknown as PrismaService;
  const feature = new CreateFacultyFeature(prisma);

  const input = { name: 'Facultad de Medicina Humana', institutionId: 'i1' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a faculty for a university', async () => {
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: 'i1', type: InstitutionType.UNIVERSITY });
    const created = { id: 'f1', ...input, createdAt: new Date(), updatedAt: new Date() };
    (prisma.faculty.create as jest.Mock).mockResolvedValue(created);

    await expect(feature.execute(input)).resolves.toEqual(created);
    expect(prisma.faculty.create).toHaveBeenCalledWith({ data: input, include: FACULTY_INCLUDE });
  });

  it('throws InstitutionNotFoundException when the institution does not exist', async () => {
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute(input)).rejects.toBeInstanceOf(InstitutionNotFoundException);
    expect(prisma.faculty.create).not.toHaveBeenCalled();
  });

  it.each([InstitutionType.HOSPITAL, InstitutionType.OTHER])(
    'throws FacultyInstitutionNotUniversityException when the institution is of type %s',
    async (type) => {
      (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: 'i1', type });

      await expect(feature.execute(input)).rejects.toBeInstanceOf(FacultyInstitutionNotUniversityException);
      expect(prisma.faculty.create).not.toHaveBeenCalled();
    },
  );

  it('throws FacultyNameAlreadyExistsException when the university already has that faculty', async () => {
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: 'i1', type: InstitutionType.UNIVERSITY });
    (prisma.faculty.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'faculties_institutionId_name_key' } } } },
      }),
    );

    await expect(feature.execute(input)).rejects.toBeInstanceOf(FacultyNameAlreadyExistsException);
  });
});
