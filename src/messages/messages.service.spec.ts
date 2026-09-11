import { ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  const prismaMock = {
    message: {
      create: jest.fn(),
    },
  };
  const prisma = prismaMock as unknown as PrismaService;

  const usersServiceMock = {
    existsById: jest.fn(),
  };
  const usersService = usersServiceMock as unknown as UsersService;

  const service = new MessagesService(prisma, usersService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cria uma mensagem com o remetente autenticado', async () => {
    usersServiceMock.existsById.mockResolvedValue({ id: 'receiver-id' });
    prismaMock.message.create.mockResolvedValue({
      id: 'message-id',
      content: 'Olá!',
    } as never);

    await expect(
      service.create('receiver-id', 'sender-id', { content: 'Olá!' }),
    ).resolves.toEqual({ id: 'message-id', content: 'Olá!' });

    expect(prismaMock.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          content: 'Olá!',
          senderId: 'sender-id',
          receiverId: 'receiver-id',
        },
      }),
    );
  });

  it('impede mensagem para o próprio usuário', async () => {
    await expect(
      service.create('user-id', 'user-id', { content: 'Olá!' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
