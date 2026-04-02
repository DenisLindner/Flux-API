import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDTO } from './dto/create-post.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { PaginationDTO } from './dto/pagination.dto';
import { UpdatePostDTO } from './dto/update-user.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Post()
  async create(@Body() dto: CreatePostDTO, @CurrentUser('sub') sub: string) {
    return this.service.create(dto, sub);
  }

  @Get('feed/recent-posts')
  @IsPublic()
  async findLast30Posts() {
    return this.service.find30posts();
  }

  @Get(':id')
  @IsPublic()
  async findByPostId(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get('comments/:id')
  @IsPublic()
  async getCommentsByPostId(@Param('id') id: string) {
    return this.service.findCommentsById(id);
  }

  @Get('users/me')
  async getMyPosts(
    @CurrentUser('sub') sub: string,
    @Query() pagination: PaginationDTO,
  ) {
    return this.service.findPostsByUserId(sub, pagination);
  }

  @Get('users/:id')
  @IsPublic()
  async getPostsByUserId(
    @Param('id') id: string,
    @Query() pagination: PaginationDTO,
  ) {
    return this.service.findPostsByUserId(id, pagination);
  }

  @Get('users/comments/me')
  async getMyComments(
    @CurrentUser('sub') sub: string,
    @Query() pagination: PaginationDTO,
  ) {
    return this.service.findCommentsByUserId(sub, pagination);
  }

  @Get('users/comments/:id')
  @IsPublic()
  async getCommentsByUserId(
    @Param('id') id: string,
    @Query() pagination: PaginationDTO,
  ) {
    return this.service.findCommentsByUserId(id, pagination);
  }

  @Patch(':id')
  async updatePost(
    @Param('id') id: string,
    @CurrentUser('sub') sub: string,
    @Body() dto: UpdatePostDTO,
  ) {
    return this.service.updateMyPostById(id, sub, dto);
  }

  @Delete('/me/:id')
  async deleteMyPost(@Param('id') id: string, @CurrentUser('sub') sub: string) {
    return this.service.deleteMyPostById(id, sub);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deletePost(@Param('id') id: string, @CurrentUser('sub') sub: string) {
    return this.service.deleteById(id, sub);
  }
}
