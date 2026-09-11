import { PrismaService } from '../../../../prisma/prisma.service';
import { DeleteInstitutionFeature } from '../delete-institution.feature';
import { FindInstitutionByIdFeature } from '../find-institution-by-id.feature';
import { InstitutionNotFoundException } from '../../exceptions/institution-not-found.exception';

describe('DeleteInstitutionFeature', () => {
  const prisma = { institution: { delete: jest.fn() } } as unknown as PrismaService;
  const findInstitutionByIdFeature = { execute: jest.fn() } as unknown as FindInstitutionByIdFeature;
  const feature = new DeleteInstitutionFeature(prisma, findInstitutionByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the institution after checking it exists', async () => {
    (findInstitutionByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'i1' });
    (prisma.institution.delete as jest.Mock).mockResolvedValue({ id: 'i1' });

    await feature.execute('i1');

    expect(findInstitutionByIdFeature.execute).toHaveBeenCalledWith('i1');
    expect(prisma.institution.delete).toHaveBeenCalledWith({ where: { id: 'i1' } });
  });

  it('propagates the not-found error without deleting', async () => {
    (findInstitutionByIdFeature.execute as jest.Mock).mockRejectedValue(
      new InstitutionNotFoundException('missing'),
    );

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(InstitutionNotFoundException);
    expect(prisma.institution.delete).not.toHaveBeenCalled();
  });
});
