import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Flux API')
    .setDescription('Documentação Oficial da API do sistema Flux')
    .setVersion('1.0.0')
    .addCookieAuth('auth-token')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      requestInterceptor: (req) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        req.credentials = 'include'; // Permite o envio de cookies em requisições cross-origin
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return req;
      },
      persistAuthorization: true, // Mantém o estado de login ao atualizar a página
    },
  });

  const originString = process.env.ORIGIN || '';
  const originsArray = originString.split(',').map((item) => item.trim());
  app.enableCors({
    origin: originsArray,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use(helmet());

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
