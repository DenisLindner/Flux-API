import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreatePostDTO } from './dto/create-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDTO } from './dto/pagination.dto';
import { UpdatePostDTO } from './dto/update-user.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreatePostDTO, authorId: string) {
    const user = await this.usersService.existsById(authorId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.parentId) {
      const post = await this.existsById(dto.parentId);

      if (!post) {
        throw new NotFoundException('Parent post not found');
      }
    }

    return this.prisma.post.create({
      data: {
        ...dto,
        authorId,
      },
      select: {
        id: true,
        content: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });
  }

  async find30posts() {
    const posts = await this.prisma.post.findMany({
      take: 30,
      orderBy: { createdAt: 'desc' },
      where: { parentId: null },
      select: {
        id: true,
        content: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    const postsWithCommentsAndLikes = await Promise.all(
      posts.map(async (item) => ({
        ...item,
        comments: await this.countCommentars(item.id),
        likes: await this.countLikesByPostId(item.id),
      })),
    );

    return postsWithCommentsAndLikes;
  }

  async findById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        content: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comments = await this.countCommentars(id);
    const likes = await this.countLikesByPostId(id);

    return { ...post, comments, likes };
  }

  async findCommentsById(id: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        parentId: id,
      },
      select: {
        id: true,
        content: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    const postsWithCommentsAndLikes = await Promise.all(
      posts.map(async (item) => ({
        ...item,
        comments: await this.countCommentars(item.id),
        likes: await this.countLikesByPostId(item.id),
      })),
    );

    return postsWithCommentsAndLikes;
  }

  async findPostsByUserId(id: string, pagination: PaginationDTO) {
    const user = await this.usersService.existsById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const posts = await this.prisma.post.findMany({
      take: pagination.take,
      skip: pagination.skip,
      where: { authorId: id, parentId: null },
      select: {
        id: true,
        content: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    const postsWithCommentsAndLikes = await Promise.all(
      posts.map(async (item) => ({
        ...item,
        comments: await this.countCommentars(item.id),
        likes: await this.countLikesByPostId(item.id),
      })),
    );

    return postsWithCommentsAndLikes;
  }

  async findCommentsByUserId(id: string, pagination: PaginationDTO) {
    const user = await this.usersService.existsById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const posts = await this.prisma.post.findMany({
      take: pagination.take,
      skip: pagination.skip,
      where: { authorId: id, parentId: { not: null } },
      select: {
        id: true,
        content: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
          },
        },
        createdAt: true,
      },
    });

    const postsWithCommentsAndLikes = await Promise.all(
      posts.map(async (item) => ({
        ...item,
        comments: await this.countCommentars(item.id),
        likes: await this.countLikesByPostId(item.id),
      })),
    );

    return postsWithCommentsAndLikes;
  }

  async updateMyPostById(
    postId: string,
    authorRequestId: string,
    dto: UpdatePostDTO,
  ) {
    const user = await this.usersService.existsById(authorRequestId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = await this.existsById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const compare = post.authorId === user.id;

    if (!compare) {
      throw new ForbiddenException('This post is not your');
    }

    return await this.prisma.post.update({
      where: { id: postId },
      data: { content: dto.content ?? undefined },
      select: {
        id: true,
        content: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });
  }

  async deleteMyPostById(postId: string, authorRequestId: string) {
    const user = await this.usersService.existsById(authorRequestId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = await this.existsById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const compare = post.authorId === user.id;

    if (!compare) {
      throw new ForbiddenException('This post is not your');
    }

    await this.prisma.post.delete({ where: { id: postId } });
  }

  async deleteById(postId: string, authorRequestId: string) {
    const user = await this.usersService.existsById(authorRequestId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = await this.existsById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.post.delete({ where: { id: postId } });
  }

  async countCommentars(id: string): Promise<number> {
    return await this.prisma.post.count({ where: { parentId: id } });
  }

  async existsById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    });
  }

  async like(postId: string, userId: string) {
    const user = await this.usersService.existsById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = await this.existsById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const like = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (like) {
      throw new ConflictException('User has already liked the post');
    }

    await this.prisma.like.create({ data: { userId, postId } });
  }

  async countLikesByPostId(postId: string) {
    const post = await this.existsById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return await this.prisma.like.count({ where: { postId } });
  }

  async unlike(postId: string, userId: string) {
    const user = await this.usersService.existsById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = await this.existsById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const like = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });
  }
}
