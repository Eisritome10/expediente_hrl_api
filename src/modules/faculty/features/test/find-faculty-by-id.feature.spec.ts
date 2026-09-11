import { PrismaService } from '../../../../prisma/prisma.service';
import { FindFacultyByIdFeature } from '../find-faculty-by-id.feature';
import { FacultyNotFoundException } from '../../exceptions/faculty-not-found.exception';

describe('FindFacultyByIdFeature', () => {
  const prisma = { faculty: { findUnique: jest.fn() } } as unknown as PrismaService;
  const feature = new FindFacultyByIdFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the faculty when found', async () => {
    const faculty = { id: 'f1', name: 'Facultad de Medicina Humana' };
    (prisma.faculty.findUnique as jest.Mock).mockResolvedValue(faculty);

    await expect(feature.execute('f1')).resolves.toEqual(faculty);
  });

  it('throws FacultyNotFoundException when missing', async () => {
    (prisma.faculty.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(FacultyNotFoundException);
  });
});
