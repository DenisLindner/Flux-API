import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from 'src/users/dto/create-user.dto';
import { LoginDTO } from './dto/login.dto';
import { IsPublic } from './decorators/is-public.decorator';

@Controller('auth')
@IsPublic()
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDTO) {
    const registerResult = await this.service.register(dto);

    const token = registerResult.accessToken;

    return {
      message: 'Registrado com sucesso',
      statusCode: 201,
      data: {
        access_token: token,
      },
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDTO) {
    const loginResult = await this.service.login(dto);

    const token = loginResult.accessToken;

    return {
      message: 'Logado com sucesso',
      statusCode: 200,
      data: {
        access_token: token,
      },
    };
  }
}
