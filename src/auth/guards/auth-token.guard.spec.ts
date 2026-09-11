import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthTokenGuard } from './auth-token.guard';

describe('AuthTokenGuard', () => {
  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  };
  const reflector = reflectorMock as unknown as Reflector;

  const jwtServiceMock = {
    verifyAsync: jest.fn(),
  };
  const jwtService = jwtServiceMock as unknown as JwtService;

  const guard = new AuthTokenGuard(jwtService, reflector);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('aceita um token Bearer válido', async () => {
    const request = {
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as Request & { user?: unknown };
    const context = createContext(request);

    reflectorMock.getAllAndOverride.mockReturnValue(false);
    jwtServiceMock.verifyAsync.mockResolvedValue({ sub: 'user-id' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual({ sub: 'user-id' });
  });

  it('rejeita requisições sem Bearer token', async () => {
    const request = { headers: {} } as Request;
    const context = createContext(request);

    reflectorMock.getAllAndOverride.mockReturnValue(false);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  function createContext(request: Request): ExecutionContext {
    return {
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }
});
