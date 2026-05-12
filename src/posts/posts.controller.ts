import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDTO } from './dto/create-post.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { PaginationDTO } from './dto/pagination.dto';
import { UpdatePostDTO } from './dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('posts')
@ApiBearerAuth('token')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Post()
  async create(@Body() dto: CreatePostDTO, @CurrentUser('sub') sub: string) {
    return this.service.create(dto, sub);
  }

  @Get('feed/recent-posts')
  async findLast30Posts(@CurrentUser('sub') userId: string) {
    return this.service.find30posts(userId);
  }

  @Get('user/me')
  async getMyPosts(
    @CurrentUser('sub') sub: string,
    @Query() pagination: PaginationDTO,
  ) {
    return this.service.findMyPosts(sub, pagination);
  }

  @Get('comments/me')
  async getMyComments(
    @CurrentUser('sub') sub: string,
    @Query() pagination: PaginationDTO,
  ) {
    return this.service.findMyComments(sub, pagination);
  }

  @Get('comments/:id')
  async getCommentsByPostId(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.findCommentsById(id, userId);
  }

  @Get('user/:id')
  async getPostsByUserId(
    @Param('id') id: string,
    @Query() pagination: PaginationDTO,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.findPostsByUserId(id, pagination, userId);
  }

  @Get('comments/user/:id')
  async getCommentsByUserId(
    @Param('id') id: string,
    @Query() pagination: PaginationDTO,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.findCommentsByUserId(id, pagination, userId);
  }

  @Get(':id')
  async findByPostId(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.findById(id, userId);
  }

  @Patch(':id')
  async updatePost(
    @Param('id') id: string,
    @CurrentUser('sub') sub: string,
    @Body() dto: UpdatePostDTO,
  ) {
    return this.service.updateMyPostById(id, sub, dto);
  }

  @Delete('me/:id')
  async deleteMyPost(@Param('id') id: string, @CurrentUser('sub') sub: string) {
    return this.service.deleteMyPostById(id, sub);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deletePost(@Param('id') id: string) {
    return this.service.deleteById(id);
  }

  @Post('like/:id')
  @HttpCode(200)
  async like(@Param('id') postId: string, @CurrentUser('sub') sub: string) {
    return this.service.like(postId, sub);
  }

  @Delete('unlike/:id')
  @HttpCode(200)
  async unlike(@Param('id') postId: string, @CurrentUser('sub') sub: string) {
    return this.service.unlike(postId, sub);
  }
}
