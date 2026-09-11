# Flux API

Backend educacional de uma rede social interna. A API oferece autenticação, perfis, pesquisa de usuários, publicações, comentários, curtidas, seguidores e mensagens diretas.

## Stack

- TypeScript e NestJS
- PostgreSQL e Prisma ORM
- JWT Bearer e bcrypt
- Swagger em `/api`

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

A API fica disponível em `http://localhost:3333` e a documentação em `http://localhost:3333/api`.

## Autenticação

Faça cadastro ou login e envie o token retornado em todas as rotas protegidas:

```http
Authorization: Bearer <access_token>
```

## Rotas principais

| Recurso             | Rotas                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Autenticação        | `POST /auth/register`, `POST /auth/login`                                                      |
| Perfil e pesquisa   | `GET /users/me`, `GET /users/search?q=ana`, `GET /users/:id`, `PATCH /users/me`                |
| Feed e posts        | `GET /posts/feed`, `POST /posts`, `GET /posts/:id`, `PATCH /posts/:id`, `DELETE /posts/me/:id` |
| Comentários e likes | `GET /posts/comments/:id`, `POST /posts/like/:id`, `DELETE /posts/unlike/:id`                  |
| Seguidores          | `POST /follow/:id`, `POST /unfollow/:id`, `GET /followers/:id`, `GET /following/:id`           |
| Mensagens           | `GET /messages`, `GET /messages/:userId`, `POST /messages/:userId`                             |

Listagens aceitam `take` e `skip`. O limite máximo de `take` é 50.

## Dados de demonstração

O seed cria `admin@flux.local`, `ana@flux.local` e `bruno@flux.local`. A senha para todas as contas é `Flux@123`.
