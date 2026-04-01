import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserDTO } from './dto/current-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Roles } from 'src/auth/decorators/role.decorator';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  async getMeProfile(@CurrentUser() user: CurrentUserDTO) {
    return this.service.findById(user.sub);
  }

  @Get(':id')
  @IsPublic()
  async getProfile(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch('me')
  async updateMeProfile(
    @CurrentUser() user: CurrentUserDTO,
    @Body() dto: UpdateUserDTO,
  ) {
    return this.service.updateUser(user.sub, dto);
  }

  @Delete('me')
  async deleteMeProfile(@CurrentUser() user: CurrentUserDTO) {
    return this.service.deleteUser(user.sub);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deleteById(@Param('id') id: string) {
    return this.service.deleteUser(id);
  }
}
