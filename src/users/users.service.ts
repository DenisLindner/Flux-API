import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDTO) {
    return this.prisma.user.create({
      data: dto,
      select: { id: true, email: true, role: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, role: true },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: { id: true, email: true, role: true },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        posts: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const followers = await this.prisma.follow.count({
      where: { followerId: user.id },
    });
    const following = await this.prisma.follow.count({
      where: { followerId: user.id },
    });

    return { ...user, followers, following };
  }

  async followUser(followerId: string, followingId: string) {
    const isFollowed = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (isFollowed) {
      throw new ConflictException('User is already follewed by this user');
    }

    await this.prisma.follow.create({ data: { followerId, followingId } });
  }

  async unfollowUser(followerId: string, followingId: string) {
    const isFollowed = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!isFollowed) {
      throw new ConflictException('User not follewed this user');
    }

    await this.prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  }

  async getUserFollowers(id: string) {
    return await this.prisma.follow.findMany({
      where: { followerId: id },
      select: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });
  }

  async getUserFollowing(id: string) {
    return await this.prisma.follow.findMany({
      where: { followingId: id },
      select: {
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });
  }
}
