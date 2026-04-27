import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Flux API')
    .setDescription('Documentação Oficial da API do sistema Flux')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT',
        in: 'header',
      },
      'token',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

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
