import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { PaginationDTO } from 'src/common/dto/pagination.dto';
import { CreateMessageDTO } from './dto/create-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
@ApiBearerAuth('token')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get()
  async findRecentConversations(
    @CurrentUser('sub') userId: string,
    @Query() pagination: PaginationDTO,
  ) {
    return this.service.findRecentConversations(userId, pagination);
  }

  @Get(':userId')
  async findConversation(
    @CurrentUser('sub') userId: string,
    @Param('userId') otherUserId: string,
    @Query() pagination: PaginationDTO,
  ) {
    return this.service.findConversation(userId, otherUserId, pagination);
  }

  @Post(':userId')
  async create(
    @CurrentUser('sub') userId: string,
    @Param('userId') receiverId: string,
    @Body() dto: CreateMessageDTO,
  ) {
    return this.service.create(receiverId, userId, dto);
  }
}
