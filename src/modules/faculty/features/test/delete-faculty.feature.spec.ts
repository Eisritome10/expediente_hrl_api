import { PrismaService } from '../../../../prisma/prisma.service';
import { DeleteFacultyFeature } from '../delete-faculty.feature';
import { FindFacultyByIdFeature } from '../find-faculty-by-id.feature';
import { FacultyNotFoundException } from '../../exceptions/faculty-not-found.exception';

describe('DeleteFacultyFeature', () => {
  const prisma = { faculty: { delete: jest.fn() } } as unknown as PrismaService;
  const findFacultyByIdFeature = { execute: jest.fn() } as unknown as FindFacultyByIdFeature;
  const feature = new DeleteFacultyFeature(prisma, findFacultyByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the faculty after checking it exists', async () => {
    (findFacultyByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'f1' });
    (prisma.faculty.delete as jest.Mock).mockResolvedValue({ id: 'f1' });

    await feature.execute('f1');

    expect(findFacultyByIdFeature.execute).toHaveBeenCalledWith('f1');
    expect(prisma.faculty.delete).toHaveBeenCalledWith({ where: { id: 'f1' } });
  });

  it('propagates the not-found error without deleting', async () => {
    (findFacultyByIdFeature.execute as jest.Mock).mockRejectedValue(
      new FacultyNotFoundException('missing'),
    );

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(FacultyNotFoundException);
    expect(prisma.faculty.delete).not.toHaveBeenCalled();
  });
});
