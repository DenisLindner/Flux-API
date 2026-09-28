# Flux API

Backend educacional de uma rede social interna. A API oferece autenticação, perfis, pesquisa de usuários, publicações, comentários, curtidas, seguidores e mensagens diretas.

## Stack

- TypeScript e NestJS
- PostgreSQL e Prisma ORM (inclusive para as imagens dos posts)
- JWT Bearer e bcrypt
- Swagger em `/docs`

## Executar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` para o seu PostgreSQL local.

3. Crie as tabelas:

   ```bash
   npm run db:migrate
   ```

4. Inicie a API:

   ```bash
   npm run dev
   ```

A API fica disponível em `http://localhost:3333/api` e a documentação em `http://localhost:3333/docs`.

## Autenticação

Faça cadastro ou login e envie o token retornado em todas as rotas protegidas:

```http
Authorization: Bearer <access_token>
```

## Rotas principais

| Recurso             | Rotas                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Autenticação        | `POST /api/auth/register`, `POST /api/auth/login`                                                                  |
| Perfil e pesquisa   | `GET /api/users/me`, `GET /api/users/search?q=ana`, `GET /api/users/:id`, `PATCH /api/users/me`                    |
| Feed e posts        | `GET /api/posts/feed`, `POST /api/posts`, `GET /api/posts/:id`, `GET /api/posts/:id/image`, `PATCH /api/posts/:id`, `DELETE /api/posts/me/:id` |
| Comentários e likes | `GET /api/posts/comments/:id`, `POST /api/posts/like/:id`, `DELETE /api/posts/unlike/:id`                          |
| Seguidores          | `POST /api/follow/:id`, `POST /api/unfollow/:id`, `GET /api/followers/:id`, `GET /api/following/:id`               |
| Mensagens           | `GET /api/messages`, `GET /api/messages/:userId`, `POST /api/messages/:userId`                                     |

Listagens aceitam `take` e `skip`. O limite máximo de `take` é 50.

## Publicações com imagem

Crie uma publicação com `POST /api/posts` usando `multipart/form-data`. Envie o arquivo no campo `image` e, se quiser, a legenda no campo `content` (até 255 caracteres). A API aceita uma imagem JPEG, PNG ou WebP de até 5 MB. A imagem é obrigatória para novas publicações.

```bash
curl -X POST http://localhost:3333/api/posts \
  -H "Authorization: Bearer <access_token>" \
  -F "image=@foto.jpg" \
  -F "content=Minha legenda"
```

O feed e as demais respostas de posts incluem `imageUrl`, por exemplo `/api/posts/01.../image`. O aplicativo deve juntar esse caminho à origem da API e enviar o mesmo token Bearer ao carregar a imagem. Imagens são armazenadas no PostgreSQL e removidas junto com o post.

Comentários continuam usando `POST /api/posts` em JSON, com `parentId` e `content` obrigatório. Comentários não aceitam imagem.

## Cadastro

O cadastro é permitido apenas para endereços de email que terminam em `@weg.net`.
