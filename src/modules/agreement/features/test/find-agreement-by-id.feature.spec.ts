import { PrismaService } from '../../../../prisma/prisma.service';
import { FindAgreementByIdFeature } from '../find-agreement-by-id.feature';
import { AgreementNotFoundException } from '../../exceptions/agreement-not-found.exception';

describe('FindAgreementByIdFeature', () => {
  const prisma = { agreement: { findUnique: jest.fn() } } as unknown as PrismaService;
  const feature = new FindAgreementByIdFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the agreement when found', async () => {
    const agreement = { id: 'a1', name: 'Universidad Nacional de la Amazonía Peruana' };
    (prisma.agreement.findUnique as jest.Mock).mockResolvedValue(agreement);

    await expect(feature.execute('a1')).resolves.toEqual(agreement);
  });

  it('throws AgreementNotFoundException when missing', async () => {
    (prisma.agreement.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(AgreementNotFoundException);
  });
});
