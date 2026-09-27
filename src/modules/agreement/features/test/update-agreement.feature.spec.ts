import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateAgreementFeature } from '../update-agreement.feature';
import { FindAgreementByIdFeature } from '../find-agreement-by-id.feature';
import { AgreementNotFoundException } from '../../exceptions/agreement-not-found.exception';
import { AgreementNameAlreadyExistsException } from '../../exceptions/agreement-name-already-exists.exception';

describe('UpdateAgreementFeature', () => {
  const prisma = { agreement: { update: jest.fn() } } as unknown as PrismaService;
  const findAgreementByIdFeature = { execute: jest.fn() } as unknown as FindAgreementByIdFeature;
  const feature = new UpdateAgreementFeature(prisma, findAgreementByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the agreement after checking it exists', async () => {
    const existing = { id: 'a1' };
    const updated = { id: 'a1', name: 'Nuevo Nombre' };
    (findAgreementByIdFeature.execute as jest.Mock).mockResolvedValue(existing);
    (prisma.agreement.update as jest.Mock).mockResolvedValue(updated);

    await expect(feature.execute('a1', { name: 'Nuevo Nombre' })).resolves.toEqual(updated);
    expect(findAgreementByIdFeature.execute).toHaveBeenCalledWith('a1');
  });

  it('propagates AgreementNotFoundException without calling update', async () => {
    (findAgreementByIdFeature.execute as jest.Mock).mockRejectedValue(new AgreementNotFoundException('missing'));

    await expect(feature.execute('missing', { name: 'X' })).rejects.toBeInstanceOf(AgreementNotFoundException);
    expect(prisma.agreement.update).not.toHaveBeenCalled();
  });

  it('throws AgreementNameAlreadyExistsException on a duplicate name', async () => {
    (findAgreementByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'a1' });
    (prisma.agreement.update as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'agreements_name_key' } } } },
      }),
    );

    await expect(feature.execute('a1', { name: 'Duplicado' })).rejects.toBeInstanceOf(
      AgreementNameAlreadyExistsException,
    );
  });
});
