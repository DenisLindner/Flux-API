import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Roles } from 'src/auth/decorators/role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SearchUsersDTO } from './dto/search-users.dto';

@Controller('users')
@ApiBearerAuth('token')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  async getMeProfile(@CurrentUser('sub') sub: string) {
    return this.service.findMeById(sub);
  }

  @Get('search')
  async searchUsers(@Query() query: SearchUsersDTO) {
    return this.service.search(query);
  }

  @Get(':id')
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
