import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { PaginationDTO } from 'src/common/dto/pagination.dto';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/update-user.dto';

const postSelect = {
  id: true,
  content: true,
  parentId: true,
  authorId: true,
  author: {
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
    },
  },
  parent: {
    select: {
      id: true,
      content: true,
    },
  },
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      children: true,
      likes: true,
    },
  },
} satisfies Prisma.PostSelect;

type PostWithDetails = Prisma.PostGetPayload<{ select: typeof postSelect }>;

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreatePostDTO, authorId: string) {
    await this.ensureUserExists(authorId);

    if (dto.parentId) {
      await this.ensurePostExists(dto.parentId, 'Postagem pai não encontrada');
    }

    const post = await this.prisma.post.create({
      data: {
        content: dto.content,
        parentId: dto.parentId,
        authorId,
      },
      select: postSelect,
    });

    return this.toPostResponse(post, new Set());
  }

  async findFeed(userId: string, pagination: PaginationDTO) {
    const posts = await this.prisma.post.findMany({
      where: { parentId: null },
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
      select: postSelect,
    });

    return this.toPaginatedResponse(posts, userId, pagination);
  }

  async findById(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: postSelect,
    });

    if (!post) {
      throw new NotFoundException('Postagem não encontrada');
    }

    const likedPostIds = await this.findLikedPostIds([post.id], userId);

    return this.toPostResponse(post, likedPostIds);
  }

  async findCommentsById(
    id: string,
    userId: string,
    pagination: PaginationDTO,
  ) {
    await this.ensurePostExists(id);

    const comments = await this.prisma.post.findMany({
      where: { parentId: id },
      orderBy: { createdAt: 'asc' },
      take: pagination.take,
      skip: pagination.skip,
      select: postSelect,
    });

    return this.toPaginatedResponse(comments, userId, pagination);
  }

  async findPostsByUserId(
    id: string,
    pagination: PaginationDTO,
    userId: string,
  ) {
    await this.ensureUserExists(id);

    const posts = await this.prisma.post.findMany({
      where: { authorId: id, parentId: null },
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
      select: postSelect,
    });

    return this.toPaginatedResponse(posts, userId, pagination);
  }

  async findMyPosts(id: string, pagination: PaginationDTO) {
    return this.findPostsByUserId(id, pagination, id);
  }

  async findCommentsByUserId(
    id: string,
    pagination: PaginationDTO,
    userId: string,
  ) {
    await this.ensureUserExists(id);

    const comments = await this.prisma.post.findMany({
      where: { authorId: id, parentId: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
      select: postSelect,
    });

    return this.toPaginatedResponse(comments, userId, pagination);
  }

  async findMyComments(id: string, pagination: PaginationDTO) {
    return this.findCommentsByUserId(id, pagination, id);
  }

  async updateMyPostById(postId: string, authorId: string, dto: UpdatePostDTO) {
    const post = await this.ensurePostExists(postId);

    if (post.authorId !== authorId) {
      throw new ForbiddenException('A postagem não é sua');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: { content: dto.content },
      select: postSelect,
    });

    return this.toPostResponse(updatedPost, new Set());
  }

  async deleteMyPostById(postId: string, authorId: string) {
    const post = await this.ensurePostExists(postId);

    if (post.authorId !== authorId) {
      throw new ForbiddenException('A postagem não é sua');
    }

    await this.prisma.post.delete({ where: { id: postId } });

    return { id: postId };
  }

  async deleteById(postId: string) {
    await this.ensurePostExists(postId);
    await this.prisma.post.delete({ where: { id: postId } });

    return { id: postId };
  }

  async like(postId: string, userId: string) {
    await this.ensureUserExists(userId);
    await this.ensurePostExists(postId);

    const existingLike = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      throw new ConflictException('Usuário já curtiu esta postagem');
    }

    await this.prisma.like.create({ data: { userId, postId } });

    return { liked: true };
  }

  async unlike(postId: string, userId: string) {
    const like = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (!like) {
      throw new NotFoundException('Curtida não encontrada');
    }

    await this.prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });

    return { liked: false };
  }

  private async toPaginatedResponse(
    posts: PostWithDetails[],
    userId: string,
    pagination: PaginationDTO,
  ) {
    const likedPostIds = await this.findLikedPostIds(
      posts.map((post) => post.id),
      userId,
    );

    return {
      items: posts.map((post) => this.toPostResponse(post, likedPostIds)),
      pagination: {
        take: pagination.take,
        skip: pagination.skip,
      },
    };
  }

  private async findLikedPostIds(postIds: string[], userId: string) {
    if (postIds.length === 0) {
      return new Set<string>();
    }

    const likes = await this.prisma.like.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
      select: { postId: true },
    });

    return new Set(likes.map((like) => like.postId));
  }

  private toPostResponse(post: PostWithDetails, likedPostIds: Set<string>) {
    const { _count, ...postData } = post;

    return {
      ...postData,
      comments: _count.children,
      likes: _count.likes,
      isLiked: likedPostIds.has(post.id),
    };
  }

  private async ensureUserExists(id: string) {
    const user = await this.usersService.existsById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  private async ensurePostExists(
    id: string,
    message = 'Postagem não encontrada',
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!post) {
      throw new NotFoundException(message);
    }

    return post;
  }
}
