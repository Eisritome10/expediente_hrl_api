import { PrismaService } from '../../../../prisma/prisma.service';
import { DeleteInstitutionFacultyFeature } from '../delete-institution-faculty.feature';
import { FacultyNotFoundException } from '../../exceptions/faculty-not-found.exception';
import { FacultyInUseByProtocolException } from '../../exceptions/faculty-in-use-by-protocol.exception';

describe('DeleteInstitutionFacultyFeature', () => {
  const prisma = {
    faculty: { findFirst: jest.fn(), delete: jest.fn() },
    protocol: { count: jest.fn() },
  } as unknown as PrismaService;
  const feature = new DeleteInstitutionFacultyFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes a faculty of the university that no protocol uses', async () => {
    (prisma.faculty.findFirst as jest.Mock).mockResolvedValue({ id: 'f1', institutionId: 'i1' });
    (prisma.protocol.count as jest.Mock).mockResolvedValue(0);

    await feature.execute('i1', 'f1');

    expect(prisma.faculty.findFirst).toHaveBeenCalledWith({ where: { id: 'f1', institutionId: 'i1' } });
    expect(prisma.faculty.delete).toHaveBeenCalledWith({ where: { id: 'f1' } });
  });

  it('throws FacultyNotFoundException when the faculty does not belong to that university', async () => {
    (prisma.faculty.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('i1', 'other')).rejects.toBeInstanceOf(FacultyNotFoundException);
    expect(prisma.faculty.delete).not.toHaveBeenCalled();
  });

  it('throws FacultyInUseByProtocolException when a protocol uses the faculty', async () => {
    (prisma.faculty.findFirst as jest.Mock).mockResolvedValue({ id: 'f1', institutionId: 'i1' });
    (prisma.protocol.count as jest.Mock).mockResolvedValue(2);

    await expect(feature.execute('i1', 'f1')).rejects.toBeInstanceOf(FacultyInUseByProtocolException);
    expect(prisma.faculty.delete).not.toHaveBeenCalled();
  });
});
