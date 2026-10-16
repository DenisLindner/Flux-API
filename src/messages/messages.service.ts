import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDTO } from 'src/common/dto/pagination.dto';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { CreateMessageDTO } from './dto/create-message.dto';
import { MarkReadDTO } from './dto/mark-read.dto';

const participantSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
};

const messageSelect = {
  id: true,
  content: true,
  senderId: true,
  receiverId: true,
  createdAt: true,
  readAt: true,
  deletedAt: true,
  sender: { select: participantSelect },
  receiver: { select: participantSelect },
} satisfies Prisma.MessageSelect;

type MessageWithParticipants = Prisma.MessageGetPayload<{
  select: typeof messageSelect;
}>;

// Quantidade de exclusões recentes devolvidas na primeira página da conversa,
// para que o app atualize mensagens antigas que já estavam carregadas.
const deletedMessagesLimit = 200;

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(receiverId: string, senderId: string, dto: CreateMessageDTO) {
    if (receiverId === senderId) {
      throw new ConflictException(
        'Não é possível enviar mensagem para si mesmo',
      );
    }

    await this.ensureUserExists(senderId);
    await this.ensureUserExists(receiverId);

    return this.prisma.message.create({
      data: {
        content: dto.content,
        senderId,
        receiverId,
      },
      select: messageSelect,
    });
  }

  async findConversation(
    currentUserId: string,
    otherUserId: string,
    pagination: PaginationDTO,
  ) {
    await this.ensureUserExists(otherUserId);

    const conversation = this.conversationWhere(currentUserId, otherUserId);
    const messages = await this.prisma.message.findMany({
      where: conversation,
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
      select: messageSelect,
    });

    const deletedMessages =
      pagination.skip === 0
        ? await this.prisma.message.findMany({
            where: { AND: [conversation, { deletedAt: { not: null } }] },
            orderBy: { deletedAt: 'desc' },
            take: deletedMessagesLimit,
            select: { id: true, deletedAt: true },
          })
        : undefined;

    return {
      items: messages.reverse().map((message) => this.toMessage(message)),
      ...(deletedMessages && { deletedMessages }),
      pagination: {
        take: pagination.take,
        skip: pagination.skip,
      },
    };
  }

  async findRecentConversations(userId: string, pagination: PaginationDTO) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: messageSelect,
    });

    const conversations = new Map<string, MessageWithParticipants>();

    for (const message of messages) {
      const participantId =
        message.senderId === userId ? message.receiverId : message.senderId;

      if (!conversations.has(participantId)) {
        conversations.set(participantId, message);
      }
    }

    const unread = await this.countUnreadBySender(userId);

    const items = Array.from(conversations.values())
      .slice(pagination.skip, pagination.skip + pagination.take)
      .map((message) => this.toConversationSummary(message, userId, unread));

    return {
      items,
      pagination: {
        take: pagination.take,
        skip: pagination.skip,
      },
    };
  }

  async countUnread(userId: string) {
    const unread = await this.countUnreadBySender(userId);
    let messages = 0;
    for (const count of unread.values()) messages += count;

    return { conversations: unread.size, messages };
  }

  async markAsRead(
    currentUserId: string,
    otherUserId: string,
    dto: MarkReadDTO,
  ) {
    const marker = await this.prisma.message.findUnique({
      where: { id: dto.throughId },
      select: { senderId: true, receiverId: true, createdAt: true },
    });

    if (
      !marker ||
      !(
        (marker.senderId === otherUserId &&
          marker.receiverId === currentUserId) ||
        (marker.senderId === currentUserId && marker.receiverId === otherUserId)
      )
    ) {
      throw new NotFoundException('Mensagem não encontrada nesta conversa');
    }

    // Marca somente as mensagens recebidas até o marcador, para não confirmar
    // a leitura de algo que chegou depois da última atualização do app.
    const { count } = await this.prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: currentUserId,
        readAt: null,
        createdAt: { lte: marker.createdAt },
      },
      data: { readAt: new Date() },
    });

    return { read: count };
  }

  async remove(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: { senderId: true, deletedAt: true },
    });

    if (!message) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Só é possível excluir suas mensagens');
    }

    if (message.deletedAt) {
      throw new ConflictException('A mensagem já foi excluída');
    }

    // O registro é mantido como aviso de exclusão, mas o conteúdo é apagado.
    const deleted = await this.prisma.message.update({
      where: { id: messageId },
      data: { content: '', deletedAt: new Date() },
      select: messageSelect,
    });

    return this.toMessage(deleted);
  }

  private conversationWhere(
    currentUserId: string,
    otherUserId: string,
  ): Prisma.MessageWhereInput {
    return {
      OR: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    };
  }

  private async countUnreadBySender(userId: string) {
    const groups = await this.prisma.message.groupBy({
      by: ['senderId'],
      where: { receiverId: userId, readAt: null, deletedAt: null },
      _count: { _all: true },
    });

    return new Map(groups.map((group) => [group.senderId, group._count._all]));
  }

  private toMessage(message: MessageWithParticipants) {
    return message.deletedAt ? { ...message, content: '' } : message;
  }

  private toConversationSummary(
    message: MessageWithParticipants,
    userId: string,
    unread: Map<string, number>,
  ) {
    const user =
      message.senderId === userId ? message.receiver : message.sender;

    return {
      user,
      unreadCount: unread.get(user.id) ?? 0,
      lastMessage: {
        id: message.id,
        content: message.deletedAt ? '' : message.content,
        senderId: message.senderId,
        createdAt: message.createdAt,
        readAt: message.readAt,
        deletedAt: message.deletedAt,
      },
    };
  }

  private async ensureUserExists(id: string) {
    const user = await this.usersService.existsById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }
}
