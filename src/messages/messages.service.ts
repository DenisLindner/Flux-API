import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDTO } from 'src/common/dto/pagination.dto';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { CreateMessageDTO } from './dto/create-message.dto';

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
  sender: { select: participantSelect },
  receiver: { select: participantSelect },
} satisfies Prisma.MessageSelect;

type MessageWithParticipants = Prisma.MessageGetPayload<{
  select: typeof messageSelect;
}>;

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

    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
      select: messageSelect,
    });

    return {
      items: messages.reverse(),
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

    const items = Array.from(conversations.values())
      .slice(pagination.skip, pagination.skip + pagination.take)
      .map((message) => this.toConversationSummary(message, userId));

    return {
      items,
      pagination: {
        take: pagination.take,
        skip: pagination.skip,
      },
    };
  }

  private toConversationSummary(
    message: MessageWithParticipants,
    userId: string,
  ) {
    const user =
      message.senderId === userId ? message.receiver : message.sender;

    return {
      user,
      lastMessage: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt,
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
