# Flux API

Backend educacional de uma rede social interna. A API oferece autenticação, perfis, pesquisa de usuários, publicações, comentários, curtidas, seguidores e mensagens diretas.

## Stack

- TypeScript e NestJS
- PostgreSQL e Prisma ORM
- JWT Bearer e bcrypt
- Swagger em `/docs`

## Executar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` para o seu PostgreSQL local.

3. Crie as tabelas e os dados de demonstração:

   ```bash
   npm run db:migrate
   npm run db:seed
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
| Feed e posts        | `GET /api/posts/feed`, `POST /api/posts`, `GET /api/posts/:id`, `PATCH /api/posts/:id`, `DELETE /api/posts/me/:id` |
| Comentários e likes | `GET /api/posts/comments/:id`, `POST /api/posts/like/:id`, `DELETE /api/posts/unlike/:id`                          |
| Seguidores          | `POST /api/follow/:id`, `POST /api/unfollow/:id`, `GET /api/followers/:id`, `GET /api/following/:id`               |
| Mensagens           | `GET /api/messages`, `GET /api/messages/:userId`, `POST /api/messages/:userId`                                     |

Listagens aceitam `take` e `skip`. O limite máximo de `take` é 50.

## Dados de demonstração

O seed cria `admin@flux.local`, `ana@flux.local` e `bruno@flux.local`. A senha para todas as contas é `Flux@123`.
