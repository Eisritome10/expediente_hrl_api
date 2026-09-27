import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { DeleteAgreementFeature } from '../delete-agreement.feature';
import { FindAgreementByIdFeature } from '../find-agreement-by-id.feature';
import { AgreementNotFoundException } from '../../exceptions/agreement-not-found.exception';
import { AgreementInUseByProtocolException } from '../../exceptions/agreement-in-use-by-protocol.exception';

describe('DeleteAgreementFeature', () => {
  const prisma = { agreement: { delete: jest.fn() } } as unknown as PrismaService;
  const findAgreementByIdFeature = { execute: jest.fn() } as unknown as FindAgreementByIdFeature;
  const feature = new DeleteAgreementFeature(prisma, findAgreementByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the agreement after checking it exists', async () => {
    (findAgreementByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'a1' });
    (prisma.agreement.delete as jest.Mock).mockResolvedValue({ id: 'a1' });

    await feature.execute('a1');

    expect(findAgreementByIdFeature.execute).toHaveBeenCalledWith('a1');
    expect(prisma.agreement.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
  });

  it('propagates the not-found error without deleting', async () => {
    (findAgreementByIdFeature.execute as jest.Mock).mockRejectedValue(new AgreementNotFoundException('missing'));

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(AgreementNotFoundException);
    expect(prisma.agreement.delete).not.toHaveBeenCalled();
  });

  it('throws AgreementInUseByProtocolException when the agreement is being used by a protocol', async () => {
    (findAgreementByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'a1' });

    const foreignKeyError = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
      code: 'P2003',
      clientVersion: '7.10.0',
    });

    (prisma.agreement.delete as jest.Mock).mockRejectedValue(foreignKeyError);

    await expect(feature.execute('a1')).rejects.toBeInstanceOf(AgreementInUseByProtocolException);
    expect(prisma.agreement.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
  });
});
