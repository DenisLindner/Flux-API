import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

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
      throw new NotFoundException('Usuário não Encontrado');
    }

    const followers = await this.prisma.follow.count({
      where: { followingId: user.id },
    });
    const following = await this.prisma.follow.count({
      where: { followerId: user.id },
    });

    return { ...user, followers, following };
  }

  async updateUser(id: string, dto: UpdateUserDTO) {
    const user = await this.existsById(id);

    if (!user) {
      throw new NotFoundException('Usuário não Encontrado');
    }

    if (dto.username) {
      const userWithSameUsername = await this.findByUsername(dto.username);

      if (userWithSameUsername && userWithSameUsername.id !== id) {
        throw new ConflictException(
          'Usuário já existente com esse Nome de Usuário',
        );
      }
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        username: dto?.username ?? undefined,
        name: dto?.name ?? undefined,
      },
    });
  }

  async deleteMyUser(id: string) {
    const user = await this.existsById(id);

    if (!user) {
      throw new NotFoundException('Usuário não Encontrado');
    }

    await this.prisma.user.delete({ where: { id } });
  }

  async deleteUser(id: string, sub: string) {
    const authorRequest = await this.existsById(sub);

    if (!authorRequest) {
      throw new NotFoundException('Usuário não Encontrado');
    }

    const user = await this.existsById(id);

    if (!user) {
      throw new NotFoundException('Usuário não Encontrado');
    }

    await this.prisma.user.delete({ where: { id } });
  }

  async existsById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });
  }
}
