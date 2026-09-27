import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateAgreementFeature } from '../create-agreement.feature';
import { AgreementNameAlreadyExistsException } from '../../exceptions/agreement-name-already-exists.exception';

describe('CreateAgreementFeature', () => {
  const prisma = { agreement: { create: jest.fn() } } as unknown as PrismaService;
  const feature = new CreateAgreementFeature(prisma);

  const input = { name: 'Universidad Nacional de la Amazonía Peruana' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an agreement', async () => {
    const created = { id: 'a1', ...input, createdAt: new Date(), updatedAt: new Date() };
    (prisma.agreement.create as jest.Mock).mockResolvedValue(created);

    await expect(feature.execute(input)).resolves.toEqual(created);
    expect(prisma.agreement.create).toHaveBeenCalledWith({ data: input });
  });

  it('throws AgreementNameAlreadyExistsException on a duplicate name', async () => {
    (prisma.agreement.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'agreements_name_key' } } } },
      }),
    );

    await expect(feature.execute(input)).rejects.toBeInstanceOf(AgreementNameAlreadyExistsException);
  });

  it('rethrows errors that are not a unique constraint violation', async () => {
    const error = new Error('unexpected');
    (prisma.agreement.create as jest.Mock).mockRejectedValue(error);

    await expect(feature.execute(input)).rejects.toBe(error);
  });
});
