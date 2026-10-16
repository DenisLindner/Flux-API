import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  const prismaMock = {
    message: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      groupBy: jest.fn(),
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

  it('conta mensagens não lidas por conversa', async () => {
    prismaMock.message.groupBy.mockResolvedValue([
      { senderId: 'a', _count: { _all: 2 } },
      { senderId: 'b', _count: { _all: 1 } },
    ] as never);

    await expect(service.countUnread('user-id')).resolves.toEqual({
      conversations: 2,
      messages: 3,
    });
  });

  it('marca como lidas apenas as mensagens recebidas até o marcador', async () => {
    const createdAt = new Date('2026-10-16T12:00:00Z');
    prismaMock.message.findUnique.mockResolvedValue({
      senderId: 'other-id',
      receiverId: 'user-id',
      createdAt,
    } as never);
    prismaMock.message.updateMany.mockResolvedValue({ count: 3 } as never);

    await expect(
      service.markAsRead('user-id', 'other-id', { throughId: 'msg-id' }),
    ).resolves.toEqual({ read: 3 });

    expect(prismaMock.message.updateMany).toHaveBeenCalledWith({
      where: {
        senderId: 'other-id',
        receiverId: 'user-id',
        readAt: null,
        createdAt: { lte: createdAt },
      },
      data: { readAt: expect.any(Date) as Date },
    });
  });

  it('rejeita marcador de outra conversa', async () => {
    prismaMock.message.findUnique.mockResolvedValue({
      senderId: 'stranger-id',
      receiverId: 'user-id',
      createdAt: new Date(),
    } as never);

    await expect(
      service.markAsRead('user-id', 'other-id', { throughId: 'msg-id' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.message.updateMany).not.toHaveBeenCalled();
  });

  it('exclui somente mensagens enviadas pelo usuário', async () => {
    prismaMock.message.findUnique.mockResolvedValue({
      senderId: 'other-id',
      deletedAt: null,
    } as never);

    await expect(service.remove('msg-id', 'user-id')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prismaMock.message.update).not.toHaveBeenCalled();
  });

  it('apaga o conteúdo e mantém o aviso de exclusão', async () => {
    const deletedAt = new Date();
    prismaMock.message.findUnique.mockResolvedValue({
      senderId: 'user-id',
      deletedAt: null,
    } as never);
    prismaMock.message.update.mockResolvedValue({
      id: 'msg-id',
      content: '',
      deletedAt,
    } as never);

    await expect(service.remove('msg-id', 'user-id')).resolves.toEqual({
      id: 'msg-id',
      content: '',
      deletedAt,
    });
    expect(prismaMock.message.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { content: '', deletedAt: expect.any(Date) as Date },
      }),
    );
  });
});
