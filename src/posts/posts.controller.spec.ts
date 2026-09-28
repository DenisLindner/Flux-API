import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'node:http';
import request from 'supertest';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const httpRequest = context.switchToHttp().getRequest<{
      user?: { sub: string };
    }>();
    httpRequest.user = { sub: 'author-id' };
    return true;
  }
}

describe('PostsController upload', () => {
  const serviceMock = {
    create: jest.fn(),
    findImageByPostId: jest.fn(),
  };
  const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]);
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: serviceMock }],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalGuards(new TestAuthGuard());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    server = app.getHttpServer() as Server;
  });

  beforeEach(() => {
    jest.resetAllMocks();
    serviceMock.create.mockResolvedValue({ id: 'post-id' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('aceita uma imagem multipart na criação de post', async () => {
    await request(server)
      .post('/api/posts')
      .field('content', 'Legenda')
      .attach('image', png, 'foto.png')
      .expect(201);

    expect(serviceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'Legenda' }),
      'author-id',
      expect.objectContaining({ mimetype: 'image/png' }),
    );
  });

  it('mantém comentários em JSON no mesmo endpoint', async () => {
    await request(server)
      .post('/api/posts')
      .send({ parentId: 'post-id', content: 'Comentário' })
      .expect(201);

    expect(serviceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ parentId: 'post-id', content: 'Comentário' }),
      'author-id',
      undefined,
    );
  });

  it('limita uploads a 5 MB', async () => {
    await request(server)
      .post('/api/posts')
      .attach('image', Buffer.alloc(5 * 1024 * 1024 + 1), 'grande.png')
      .expect(413);

    expect(serviceMock.create).not.toHaveBeenCalled();
  });

  it('entrega a imagem com o tipo correto', async () => {
    serviceMock.findImageByPostId.mockResolvedValue({
      data: Uint8Array.from(png),
      mimeType: 'image/png',
    });

    const response = await request(server)
      .get('/api/posts/post-id/image')
      .expect(200);

    expect(response.headers['content-type']).toMatch(/^image\/png/);
    expect(response.body).toEqual(png);
  });
});
