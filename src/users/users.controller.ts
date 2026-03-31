import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserDTO } from './dto/current-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post('follow/:id')
  async follow(
    @CurrentUser() user: CurrentUserDTO,
    @Param('id') followerId: string,
  ) {
    return this.service.followUser(followerId, user.sub);
  }

  @Post('unfollow/:id')
  @HttpCode(200)
  async unfollow(
    @CurrentUser() user: CurrentUserDTO,
    @Param('id') followerId: string,
  ) {
    return this.service.unfollowUser(followerId, user.sub);
  }

  @Get('me')
  async getMeProfile(@CurrentUser() user: CurrentUserDTO) {
    return this.service.findById(user.sub);
  }

  @Get('followers/:id')
  async getUserFollowers(@Param('id') id: string) {
    return this.service.getUserFollowers(id);
  }

  @Get('following/:id')
  async getUserFollowing(@Param('id') id: string) {
    return this.service.getUserFollowing(id);
  }
}
