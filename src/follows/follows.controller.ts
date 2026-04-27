import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserDTO } from 'src/users/dto/current-user.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
@ApiBearerAuth('token')
export class FollowsController {
  constructor(private readonly service: FollowsService) {}

  @Post('follow/:id')
  async follow(
    @CurrentUser() user: CurrentUserDTO,
    @Param('id') followingId: string,
  ) {
    return this.service.followUser(user.sub, followingId);
  }

  @Post('unfollow/:id')
  @HttpCode(200)
  async unfollow(
    @CurrentUser() user: CurrentUserDTO,
    @Param('id') followingId: string,
  ) {
    return this.service.unfollowUser(user.sub, followingId);
  }

  @Get('followers/me')
  async getMeFollowers(@CurrentUser() user: CurrentUserDTO) {
    return this.service.getUserFollowers(user.sub);
  }

  @Get('followers/:id')
  @IsPublic()
  async getUserFollowers(@Param('id') id: string) {
    return this.service.getUserFollowers(id);
  }

  @Get('following/me')
  async getMeFollowing(@CurrentUser() user: CurrentUserDTO) {
    return this.service.getUserFollowing(user.sub);
  }

  @Get('following/:id')
  @IsPublic()
  async getUserFollowing(@Param('id') id: string) {
    return this.service.getUserFollowing(id);
  }
}
