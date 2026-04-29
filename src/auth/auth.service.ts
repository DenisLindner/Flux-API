import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { HashingService } from './hashing/hashing.service';
import { CreateUserDTO } from 'src/users/dto/create-user.dto';
import { Role } from 'src/generated/prisma/enums';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashingService,
  ) {}

  async register(dto: CreateUserDTO): Promise<{ accessToken: string }> {
    const existsWithEmail = await this.usersService.findByEmail(dto.email);

    if (existsWithEmail) {
      throw new ConflictException('Usuário já existe com esse Email');
    }

    const existsWithUsername = await this.usersService.findByUsername(
      dto.username,
    );

    if (existsWithUsername) {
      throw new ConflictException('Usuário já existe com esse Nome de Usuário');
    }

    const passwordHash = await this.hashService.hash(dto.password);
    const newUser = await this.usersService.create({
      ...dto,
      password: passwordHash,
    });
    const accessToken = await this.generateToken(
      newUser.id,
      newUser.email,
      newUser.role,
    );

    return {
      accessToken,
    };
  }

  async login(dto: LoginDTO): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Email ou Senha incorretos');
    }

    const compare = await this.hashService.compare(dto.password, user.password);

    if (!compare) {
      throw new UnauthorizedException('Email ou Senha incorretos');
    }

    const accessToken = await this.generateToken(
      user.id,
      user.email,
      user.role,
    );

    return {
      accessToken,
    };
  }

  private async generateToken(id: string, email: string, role: Role) {
    return this.jwtService.signAsync({
      sub: id,
      email,
      role,
    });
  }
}
