import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Roles } from 'src/auth/decorators/role.decorator';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { ApiCookieAuth } from '@nestjs/swagger';

@Controller('users')
@ApiCookieAuth('auth-token')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  async getMeProfile(@CurrentUser('sub') sub: string) {
    return this.service.findById(sub);
  }

  @Get(':id')
  @IsPublic()
  async getProfile(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch('me')
  async updateMeProfile(
    @CurrentUser('sub') sub: string,
    @Body() dto: UpdateUserDTO,
  ) {
    return this.service.updateUser(sub, dto);
  }

  @Delete('me')
  async deleteMeProfile(@CurrentUser('sub') sub: string) {
    return this.service.deleteMyUser(sub);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deleteById(@Param('id') id: string, @CurrentUser('sub') sub: string) {
    return this.service.deleteUser(id, sub);
  }
}
