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
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiProduces,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { PostsService, type PostImageFile } from './posts.service';
import { CreatePostDTO } from './dto/create-post.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { PaginationDTO } from 'src/common/dto/pagination.dto';
import { UpdatePostDTO } from './dto/update-user.dto';

@Controller('posts')
@ApiBearerAuth('token')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      oneOf: [
        {
          type: 'object',
          required: ['image'],
          properties: {
            image: { type: 'string', format: 'binary' },
            content: { type: 'string', maxLength: 255 },
          },
        },
        {
          type: 'object',
          required: ['parentId', 'content'],
          properties: {
            parentId: { type: 'string' },
            content: { type: 'string', maxLength: 255 },
          },
        },
      ],
    },
  })
  async create(
    @Body() dto: CreatePostDTO,
    @CurrentUser('sub') sub: string,
    @UploadedFile() image?: PostImageFile,
  ) {
    return this.service.create(dto, sub, image);
  }

  @Get('feed')
  async findFeed(
    @CurrentUser('sub') userId: string,
    @Query() pagination: PaginationDTO,
  ) {
    return this.service.findFeed(userId, pagination);
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
    @Query() pagination: PaginationDTO,
  ) {
    return this.service.findCommentsById(id, userId, pagination);
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

  @Get(':id/image')
  @Throttle({ default: { limit: 60, ttl: 6000 } })
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  @ApiOkResponse({ schema: { type: 'string', format: 'binary' } })
  async getImage(@Param('id') id: string, @Res() response: Response) {
    const image = await this.service.findImageByPostId(id);
    response.setHeader('Content-Type', image.mimeType);
    response.send(Buffer.from(image.data));
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
