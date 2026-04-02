import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthTokenGuard } from './auth/guards/auth-token.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { FollowsModule } from './follows/follows.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, FollowsModule, PostsModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
