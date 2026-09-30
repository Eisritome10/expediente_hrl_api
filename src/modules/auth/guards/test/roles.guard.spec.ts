import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../roles.guard';

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
  const guard = new RolesGuard(reflector);

  const createContext = (role: UserRole): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows access when no roles are required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    expect(guard.canActivate(createContext(UserRole.RESEARCHER))).toBe(true);
  });

  it('allows access when the required roles list is empty', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([]);

    expect(guard.canActivate(createContext(UserRole.RESEARCHER))).toBe(true);
  });

  it('denies a RESEARCHER when the class requires ADMIN', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([UserRole.ADMIN]);

    expect(guard.canActivate(createContext(UserRole.RESEARCHER))).toBe(false);
  });

  it('allows a RESEARCHER when a method-level RESEARCHER overrides the class-level ADMIN', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([UserRole.RESEARCHER]);

    expect(guard.canActivate(createContext(UserRole.RESEARCHER))).toBe(true);
  });

  it('denies an ADMIN when a method-level RESEARCHER overrides the class-level ADMIN', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([UserRole.RESEARCHER]);

    expect(guard.canActivate(createContext(UserRole.ADMIN))).toBe(false);
  });

  it('reads the required roles from the handler and the class', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    const context = createContext(UserRole.ADMIN);

    guard.canActivate(context);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
  });
});
