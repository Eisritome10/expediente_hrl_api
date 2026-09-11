import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateResearcherFeature } from '../create-researcher.feature';
import { ResearcherDniAlreadyExistsException } from '../../exceptions/researcher-dni-already-exists.exception';
import { ResearcherEmailAlreadyExistsException } from '../../exceptions/researcher-email-already-exists.exception';

describe('CreateResearcherFeature', () => {
  const prisma = { researcher: { create: jest.fn() } } as unknown as PrismaService;
  const feature = new CreateResearcherFeature(prisma);

  const input = {
    dni: '12345678',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a researcher', async () => {
    const created = { id: 'r1', ...input, createdAt: new Date(), updatedAt: new Date() };
    (prisma.researcher.create as jest.Mock).mockResolvedValue(created);

    await expect(feature.execute(input)).resolves.toEqual(created);
    expect(prisma.researcher.create).toHaveBeenCalledWith({ data: input });
  });

  it('throws ResearcherDniAlreadyExistsException on a duplicate dni', async () => {
    (prisma.researcher.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        // @prisma/adapter-pg doesn't populate `meta.target` — the constraint
        // name only shows up nested under `meta.driverAdapterError`.
        meta: { driverAdapterError: { cause: { constraint: { index: 'researchers_dni_key' } } } },
      }),
    );

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ResearcherDniAlreadyExistsException);
  });

  it('throws ResearcherEmailAlreadyExistsException on a duplicate email', async () => {
    (prisma.researcher.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'researchers_email_key' } } } },
      }),
    );

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ResearcherEmailAlreadyExistsException);
  });
});
