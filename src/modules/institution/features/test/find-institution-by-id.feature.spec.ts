import { PrismaService } from '../../../../prisma/prisma.service';
import { FindInstitutionByIdFeature } from '../find-institution-by-id.feature';
import { InstitutionNotFoundException } from '../../exceptions/institution-not-found.exception';

describe('FindInstitutionByIdFeature', () => {
  const prisma = { institution: { findUnique: jest.fn() } } as unknown as PrismaService;
  const feature = new FindInstitutionByIdFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the institution when found', async () => {
    const institution = { id: 'i1', name: 'Hospital Regional de Loreto' };
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue(institution);

    await expect(feature.execute('i1')).resolves.toEqual(institution);
  });

  it('throws InstitutionNotFoundException when missing', async () => {
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(InstitutionNotFoundException);
  });
});
