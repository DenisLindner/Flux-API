import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL deve estar definida para executar o seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const password = await bcrypt.hash('Flux@123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@flux.local' },
    update: {},
    create: {
      username: 'admin.flux',
      name: 'Administrador Flux',
      email: 'admin@flux.local',
      password,
      role: Role.ADMIN,
      bio: 'Conta administrativa para demonstração.',
    },
  });

  const ana = await prisma.user.upsert({
    where: { email: 'ana@flux.local' },
    update: {},
    create: {
      username: 'ana.silva',
      name: 'Ana Silva',
      email: 'ana@flux.local',
      password,
      bio: 'Desenvolvedora na comunidade Flux.',
    },
  });

  const bruno = await prisma.user.upsert({
    where: { email: 'bruno@flux.local' },
    update: {},
    create: {
      username: 'bruno.souza',
      name: 'Bruno Souza',
      email: 'bruno@flux.local',
      password,
      bio: 'Participante da demonstração.',
    },
  });

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: ana.id,
        followingId: bruno.id,
      },
    },
    update: {},
    create: {
      followerId: ana.id,
      followingId: bruno.id,
    },
  });

  const post = await prisma.post.findFirst({ where: { authorId: ana.id } });

  if (!post) {
    const createdPost = await prisma.post.create({
      data: {
        authorId: ana.id,
        content: 'Bem-vindos ao Flux! Esta é uma publicação de demonstração.',
      },
    });

    await prisma.post.create({
      data: {
        authorId: bruno.id,
        parentId: createdPost.id,
        content: 'Que bom participar do projeto!',
      },
    });

    await prisma.like.upsert({
      where: {
        userId_postId: {
          userId: bruno.id,
          postId: createdPost.id,
        },
      },
      update: {},
      create: {
        userId: bruno.id,
        postId: createdPost.id,
      },
    });
  }

  const message = await prisma.message.findFirst({
    where: { senderId: ana.id, receiverId: bruno.id },
  });

  if (!message) {
    await prisma.message.createMany({
      data: [
        {
          senderId: ana.id,
          receiverId: bruno.id,
          content: 'Olá, Bruno! Você já viu o novo feed?',
        },
        {
          senderId: bruno.id,
          receiverId: ana.id,
          content: 'Vi sim, ficou muito bom!',
        },
      ],
    });
  }
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
