import { PrismaService } from '../../../../prisma/prisma.service';
import { ListInstitutionFacultiesFeature } from '../list-institution-faculties.feature';
import { FindInstitutionByIdFeature } from '../find-institution-by-id.feature';
import { InstitutionNotFoundException } from '../../exceptions/institution-not-found.exception';

describe('ListInstitutionFacultiesFeature', () => {
  const prisma = { faculty: { findMany: jest.fn() } } as unknown as PrismaService;
  const findInstitutionByIdFeature = { execute: jest.fn() } as unknown as FindInstitutionByIdFeature;
  const feature = new ListInstitutionFacultiesFeature(prisma, findInstitutionByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists the faculties of the university ordered by name', async () => {
    const data = [{ id: 'f1' }, { id: 'f2' }];
    (findInstitutionByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'i1' });
    (prisma.faculty.findMany as jest.Mock).mockResolvedValue(data);

    await expect(feature.execute('i1')).resolves.toEqual(data);
    expect(prisma.faculty.findMany).toHaveBeenCalledWith({ where: { institutionId: 'i1' }, orderBy: { name: 'asc' } });
  });

  it('propagates the not-found error when the institution does not exist', async () => {
    (findInstitutionByIdFeature.execute as jest.Mock).mockRejectedValue(new InstitutionNotFoundException('missing'));

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(InstitutionNotFoundException);
    expect(prisma.faculty.findMany).not.toHaveBeenCalled();
  });
});
