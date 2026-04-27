import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ConflictException('User cannot follow themselves');
    }

    const follower = await this.usersService.existsById(followerId);

    if (!follower) {
      throw new NotFoundException('Follower not found');
    }

    const following = await this.usersService.existsById(followingId);

    if (!following) {
      throw new NotFoundException('Following not found');
    }

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
    if (followerId === followingId) {
      throw new ConflictException('User cannot unfollow themselves');
    }

    const follower = await this.usersService.existsById(followerId);

    if (!follower) {
      throw new NotFoundException('Follower not found');
    }

    const following = await this.usersService.existsById(followingId);

    if (!following) {
      throw new NotFoundException('Following not found');
    }

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
    const user = await this.usersService.existsById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

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

  async getUserFollowing(id: string) {
    const user = await this.usersService.existsById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

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
}
