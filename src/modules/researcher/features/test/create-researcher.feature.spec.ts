import { Prisma, UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateResearcherFeature } from '../create-researcher.feature';
import { ResearcherDniAlreadyExistsException } from '../../exceptions/researcher-dni-already-exists.exception';
import { ResearcherEmailAlreadyExistsException } from '../../exceptions/researcher-email-already-exists.exception';
import { UserUsernameAlreadyExistsException } from '../../../user/exceptions/user-username-already-exists.exception';
import { UserEmailAlreadyExistsException } from '../../../user/exceptions/user-email-already-exists.exception';

jest.mock('argon2');

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

  // @prisma/adapter-pg doesn't populate `meta.target`; the constraint name only
  // shows up nested under `meta.driverAdapterError`.
  const uniqueViolation = (index: string) =>
    new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: '7.10.0',
      meta: { driverAdapterError: { cause: { constraint: { index } } } },
    });

  beforeEach(() => {
    jest.clearAllMocks();
    (argon2.hash as jest.Mock).mockResolvedValue('hashed-dni');
  });

  it('creates a researcher with a nested user account (username = dni, initial password = dni)', async () => {
    const created = { id: 'r1', ...input, createdAt: new Date(), updatedAt: new Date() };
    (prisma.researcher.create as jest.Mock).mockResolvedValue(created);

    await expect(feature.execute(input)).resolves.toEqual(created);

    expect(argon2.hash).toHaveBeenCalledWith(input.dni);
    expect(prisma.researcher.create).toHaveBeenCalledWith({
      data: {
        ...input,
        user: {
          create: {
            username: input.dni,
            email: input.email,
            fullName: 'Ada Lovelace',
            passwordHash: 'hashed-dni',
            role: UserRole.RESEARCHER,
            status: UserStatus.ACTIVE,
          },
        },
      },
    });
  });

  it('leaves the user email null when the researcher has no email', async () => {
    const withoutEmail = { ...input, email: null };
    const created = { id: 'r1', ...withoutEmail, createdAt: new Date(), updatedAt: new Date() };
    (prisma.researcher.create as jest.Mock).mockResolvedValue(created);

    await feature.execute(withoutEmail);

    const callArgs = (prisma.researcher.create as jest.Mock).mock.calls[0][0];
    expect(callArgs.data.user.create.email).toBeNull();
  });

  it('throws ResearcherDniAlreadyExistsException on a duplicate dni', async () => {
    (prisma.researcher.create as jest.Mock).mockRejectedValue(uniqueViolation('researchers_dni_key'));

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ResearcherDniAlreadyExistsException);
  });

  it('throws ResearcherEmailAlreadyExistsException on a duplicate researcher email', async () => {
    (prisma.researcher.create as jest.Mock).mockRejectedValue(uniqueViolation('researchers_email_key'));

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ResearcherEmailAlreadyExistsException);
  });

  it('throws UserUsernameAlreadyExistsException on a duplicate username', async () => {
    (prisma.researcher.create as jest.Mock).mockRejectedValue(uniqueViolation('users_username_key'));

    await expect(feature.execute(input)).rejects.toBeInstanceOf(UserUsernameAlreadyExistsException);
  });

  it('throws UserEmailAlreadyExistsException on a duplicate user email', async () => {
    (prisma.researcher.create as jest.Mock).mockRejectedValue(uniqueViolation('users_email_key'));

    await expect(feature.execute(input)).rejects.toBeInstanceOf(UserEmailAlreadyExistsException);
  });

  it('re-throws errors that are not a unique constraint violation', async () => {
    const error = new Error('unexpected');
    (prisma.researcher.create as jest.Mock).mockRejectedValue(error);

    await expect(feature.execute(input)).rejects.toBe(error);
  });
});
