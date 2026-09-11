import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { SearchUsersDTO } from './dto/search-users.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

type ProfileWithCounts = {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  _count: {
    followers: number;
    following: number;
  };
};

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

  async findMeById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...this.profileSelect,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { email, role, ...profile } = user;

    return {
      ...this.toProfile(profile),
      email,
      role,
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.profileSelect,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.toProfile(user);
  }

  async search(query: SearchUsersDTO) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query.q, mode: 'insensitive' } },
          { username: { contains: query.q, mode: 'insensitive' } },
        ],
      },
      orderBy: [{ name: 'asc' }, { username: 'asc' }],
      take: query.take,
      skip: query.skip,
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
      },
    });

    return {
      items: users,
      pagination: {
        take: query.take,
        skip: query.skip,
      },
    };
  }

  async updateUser(id: string, dto: UpdateUserDTO) {
    await this.ensureUserExists(id);

    if (dto.username) {
      const userWithSameUsername = await this.findByUsername(dto.username);

      if (userWithSameUsername && userWithSameUsername.id !== id) {
        throw new ConflictException(
          'Já existe um usuário com esse nome de usuário',
        );
      }
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        username: dto.username,
        name: dto.name,
        avatarUrl: dto.avatarUrl,
        bio: dto.bio,
      },
    });

    return this.findMeById(id);
  }

  async deleteMyUser(id: string) {
    await this.ensureUserExists(id);
    await this.prisma.user.delete({ where: { id } });

    return { id };
  }

  async deleteUser(id: string, requesterId: string) {
    await this.ensureUserExists(requesterId);
    await this.ensureUserExists(id);
    await this.prisma.user.delete({ where: { id } });

    return { id };
  }

  async existsById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  private readonly profileSelect = {
    id: true,
    username: true,
    name: true,
    avatarUrl: true,
    bio: true,
    _count: {
      select: {
        followers: true,
        following: true,
      },
    },
  };

  private toProfile(user: ProfileWithCounts) {
    const { _count, ...profile } = user;

    return {
      ...profile,
      followers: _count.followers,
      following: _count.following,
    };
  }

  private async ensureUserExists(id: string) {
    const user = await this.existsById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }
}
