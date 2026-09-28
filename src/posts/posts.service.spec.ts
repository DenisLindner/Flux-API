import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { PostsService } from './posts.service';

describe('PostsService images', () => {
  const prismaMock = {
    post: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const usersMock = { existsById: jest.fn() };
  const service = new PostsService(
    prismaMock as unknown as PrismaService,
    usersMock as unknown as UsersService,
  );
  const image = {
    buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]),
    mimetype: 'image/png',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    usersMock.existsById.mockResolvedValue({ id: 'author-id' });
  });

  it('cria um post com imagem e legenda opcional', async () => {
    prismaMock.post.create.mockResolvedValue({
      id: 'post-id',
      content: '',
      imageMimeType: 'image/png',
      _count: { children: 0, likes: 0 },
    });

    await expect(service.create({}, 'author-id', image)).resolves.toEqual(
      expect.objectContaining({
        id: 'post-id',
        content: '',
        imageUrl: '/api/posts/post-id/image',
      }),
    );
    expect(prismaMock.post.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          content: '',
          parentId: undefined,
          authorId: 'author-id',
          imageData: Uint8Array.from(image.buffer),
          imageMimeType: 'image/png',
        },
      }),
    );
  });

  it('exige imagem em posts e texto em comentários', async () => {
    await expect(
      service.create({ content: 'Só texto' }, 'author-id'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create({ parentId: 'post-id', content: '   ' }, 'author-id'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create(
        { parentId: 'post-id', content: 'Comentário' },
        'author-id',
        image,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.post.create).not.toHaveBeenCalled();
  });

  it('rejeita arquivos cujo formato não corresponde aos bytes', async () => {
    await expect(
      service.create({}, 'author-id', { ...image, mimetype: 'image/jpeg' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.post.create).not.toHaveBeenCalled();
  });

  it('lê a imagem sem carregar o post completo', async () => {
    prismaMock.post.findUnique.mockResolvedValue({
      imageData: image.buffer,
      imageMimeType: 'image/png',
    });

    await expect(service.findImageByPostId('post-id')).resolves.toEqual({
      data: image.buffer,
      mimeType: 'image/png',
    });
    expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
      where: { id: 'post-id' },
      select: { imageData: true, imageMimeType: true },
    });
  });

  it('retorna 404 quando o post não tem imagem', async () => {
    prismaMock.post.findUnique.mockResolvedValue(null);
    await expect(service.findImageByPostId('post-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('permite remover a legenda, mas não esvaziar um comentário', async () => {
    prismaMock.post.findUnique.mockResolvedValue({
      id: 'post-id',
      authorId: 'author-id',
      parentId: null,
    });
    prismaMock.post.update.mockResolvedValue({
      id: 'post-id',
      content: '',
      imageMimeType: 'image/png',
      _count: { children: 0, likes: 0 },
    });

    await service.updateMyPostById('post-id', 'author-id', { content: '' });
    expect(prismaMock.post.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { content: '' } }),
    );

    prismaMock.post.findUnique.mockResolvedValue({
      id: 'comment-id',
      authorId: 'author-id',
      parentId: 'post-id',
    });
    await expect(
      service.updateMyPostById('comment-id', 'author-id', { content: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
