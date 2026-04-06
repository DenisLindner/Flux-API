# Flux API

Um projeto prático focado na construção da arquitetura back-end de uma rede social (baseada no X/Twitter) de forma estruturada e profissional.

## 📖 Contexto

Este projeto foi desenvolvido com o propósito de aprofundar os conhecimentos na criação de backends semi-profissionais utilizando o ecossistema **NestJS**. O desenvolvimento abordou a implementação de conceitos e padrões amplamente adotados no mercado, estruturando mecânicas robustas na proteção de rotas com a utilização de **Guardiões (Guards)** e controle de acesso por roles. Além disso, foram aplicados princípios do **SOLID** e a construção de relacionamentos SQL profundos para suportar fluxos de dados complexos de uma rede social.

## 🎯 Objetivos

- **Autenticação Segura:** Tratamento e hash de senhas utilizando o `bcrypt`.
- **Autorização com JWT:** Geração e validação de tokens para controlar os acessos através do `@nestjs/jwt`.
- **Proteção de Rotas:** Criação e aplicação de Guards no NestJS para impedir o acesso de usuários não autorizados aos endpoints protegidos.
- **Relacionamentos Complexos:** Modelagem de banco de dados avançada (comentários aninhados, likes e seguidores) utilizando o Prisma ORM.
- **Validação de Dados:** Uso de `class-validator` e `class-transformer` para assegurar a integridade dos dados trafegados nas requisições.

## 💻 Stack e Bibliotecas

- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Framework:** [NestJS](https://nestjs.com/)
- **Banco de Dados & ORM:** [Prisma ORM](https://www.prisma.io/) em conjunto com [PostgreSQL](https://www.postgresql.org/) (`pg` e `@prisma/adapter-pg`)
- **Segurança:** `bcrypt`, `@nestjs/jwt`
- **Validação:** `class-validator`, `class-transformer`
- **Documentação:** `@nestjs/swagger`

## 🔌 Endpoints

### Autenticação (`/auth`)
- `POST /auth/login` - Autenticação de usuário e retorno do token JWT.

### Usuários (`/users`)
*(As rotas podem exigir o token JWT no header `Authorization: Bearer <token>`)*
- Controle sobre os dados de perfil, atualizações e listagem do diretório de usuários.

### Seguir (`/follows`)
- Gerenciamento de relacionamentos, com a capacidade de seguir e deixar de seguir usuários na plataforma.

### Publicações (`/posts`)
- `POST /posts` - Criação de novos posts (tweets).
- Sistema de interações interligado (likes) e aninhamento de entidades para permitir respostas em cadeia (comentários).

## 🚀 Como Rodar

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado na máquina.
- Instância do [PostgreSQL](https://www.postgresql.org/) configurada.
- Gerenciador de pacotes (`npm` ou `yarn`).

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/DenisLindner/Flux-API.git
   cd Flux-API
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   - Crie um arquivo `.env` na raiz do projeto copiando a base do `.env.example`:
   ```bash
   cp .env.example .env
   ```
   - *Certifique-se de configurar a variável `DATABASE_URL` corretamente no seu arquivo `.env`.*

4. **Prepare o banco de dados (Prisma):**
   ```bash
   npx prisma migrate dev
   ```

5. **Inicie a aplicação:**
   ```bash
   npm run dev
   ```
   *A API estará rodando e disponível por padrão na porta configurada (geralmente http://localhost:3000).*

## 📞 Contato

Desenvolvido por **Denis Lindner**. Se quiser bater um papo, tirar dúvidas ou acompanhar meus estudos, sinta-se à vontade para entrar em contato:

- **GitHub:** [DenisLindner](https://github.com/DenisLindner)
- **LinkedIn:** [Denis Lindner](https://www.linkedin.com/in/denis-lindner)
- **E-mail:** [lindnerdenis19@gmail.com](mailto:lindnerdenis19@gmail.com)
