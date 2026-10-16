import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Roles } from 'src/auth/decorators/role.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiProduces,
} from '@nestjs/swagger';
import { maxImageSize, type ImageFile } from 'src/common/images';
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

  @Get(':id/avatar')
  @Throttle({ default: { limit: 60, ttl: 6000 } })
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  @ApiOkResponse({ schema: { type: 'string', format: 'binary' } })
  async getAvatar(@Param('id') id: string, @Res() response: Response) {
    const avatar = await this.service.findAvatarByUserId(id);
    response.setHeader('Content-Type', avatar.mimeType);
    response.setHeader('Cache-Control', 'private, max-age=86400');
    response.send(Buffer.from(avatar.data));
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

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: maxImageSize } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: { image: { type: 'string', format: 'binary' } },
    },
  })
  async uploadMyAvatar(
    @CurrentUser('sub') sub: string,
    @UploadedFile() image?: ImageFile,
  ) {
    return this.service.updateAvatar(sub, image);
  }

  @Delete('me/avatar')
  async removeMyAvatar(@CurrentUser('sub') sub: string) {
    return this.service.removeAvatar(sub);
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
