# Task & Project Management API

API backend desenvolvida com **Node.js**, **TypeScript** e **Express**, focada em boas práticas de arquitetura, segurança e escalabilidade.

Este projeto simula um ambiente real de aplicação corporativa, com controle de usuários, projetos, tarefas e regras de acesso baseadas em ownership e papéis (RBAC).

---

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL (Docker)
- JWT (autenticação)
- bcrypt
- dotenv
- Helmet
- CORS

---

## Estrutura do Projeto

    src/
    ├── app.ts
    ├── server.ts
    ├── database/
    │   └── prisma.ts
    ├── modules/
    │   ├── auth/
    │   ├── project/
    │   └── task/
    ├── middlewares/
    ├── errors/
    └── utils/

---

## Como Executar o Projeto

### 1) Pré-requisitos

- Node.js (LTS)
- Docker + Docker Compose

---

### 2) Variáveis de ambiente

Crie `.env`:

    PORT=3000

    DB_HOST=localhost
    DB_PORT=5433
    DB_USER=postgres
    DB_PASSWORD=postgres
    DB_NAME=api_ts_db

    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/api_ts_db?schema=public"

    JWT_SECRET=your_secret
    JWT_EXPIRES_IN=15m

---

### 3) Subir banco

    docker compose up -d

---

### 4) Instalar dependências

    npm install

---

### 5) Rodar migrations

    npx prisma migrate dev

---

### 6) Rodar seed

    npx prisma db seed

---

### 7) Rodar aplicação

    npm run dev

---

## Endpoints

### Health Check

    GET /health

Resposta:

    { "status": "OK" }

---

## Auth API

### Registrar usuário

    POST /auth/register

Body:

    {
      "name": "João Moreira",
      "email": "joao@email.com",
      "password": "senha123"
    }

> Novos usuários são registrados com a role **MEMBER** por padrão.

---

### Login

    POST /auth/login

Body:

    {
      "email": "joao@email.com",
      "password": "senha123"
    }

Resposta:

    {
      "accessToken": "JWT_TOKEN",
      "user": { ... }
    }

---

### Dados do usuário autenticado

    GET /auth/me

> Requer autenticação.

---

## Projects API

> Todas as rotas exigem autenticação (`Authorization: Bearer <token>`)

### Criar projeto

    POST /projects

Body:

    {
      "name": "Projeto Alpha",
      "description": "Descrição do projeto"
    }

---

### Listar projetos

    GET /projects

Retorna apenas projetos do usuário autenticado.

---

### Buscar projeto por ID

    GET /projects/:id

---

### Atualizar projeto

    PATCH /projects/:id

---

### Deletar projeto

    DELETE /projects/:id

---

## Tasks API

> Todas as rotas exigem autenticação (`Authorization: Bearer <token>`)

### Criar task

    POST /tasks

Restrito a **ADMIN** e **MANAGER**.

Body:

    {
      "title": "Criar tela de login",
      "description": "Implementar formulário",
      "projectId": "uuid-do-projeto",
      "assignedTo": "uuid-do-usuario"
    }

---

### Listar tasks

    GET /tasks
    GET /tasks?projectId=uuid
    GET /tasks?status=TODO
    GET /tasks?projectId=uuid&status=DOING

> **MEMBER** vê apenas tasks atribuídas a ele.

---

### Buscar task por ID

    GET /tasks/:id

> **MEMBER** só acessa tasks atribuídas a ele.

---

### Atualizar task

    PATCH /tasks/:id

Restrito a **ADMIN** e **MANAGER**.

---

### Atualizar status

    PATCH /tasks/:id/status

Body:

    { "status": "DOING" }

Status disponíveis: `TODO`, `DOING`, `DONE`

---

### Deletar task

    DELETE /tasks/:id

Restrito a **ADMIN** e **MANAGER**.

---

## Banco de Dados

Gerenciado com Prisma Migrate.

### Entidades principais

- User
- Role
- Project
- Task

### Seed inicial

- Roles: `ADMIN`, `MANAGER`, `MEMBER`

---

## Regras de Segurança

### Ownership de Projetos

- Todo projeto possui um `ownerId` definido automaticamente pelo backend
- O cliente não pode enviar `ownerId` no payload
- Usuários só visualizam, atualizam e deletam seus próprios projetos
- ADMIN tem acesso a qualquer projeto

### RBAC de Tasks

| Ação             | MEMBER               | MANAGER          | ADMIN |
|------------------|----------------------|------------------|-------|
| Criar task       | ✗                    | ✅               | ✅    |
| Listar tasks     | Só as suas           | ✅               | ✅    |
| Buscar task      | Só as suas           | ✅               | ✅    |
| Atualizar task   | ✗                    | ✅ (seu projeto) | ✅    |
| Atualizar status | ✅ (atribuída a ele) | ✅               | ✅    |
| Deletar task     | ✗                    | ✅ (seu projeto) | ✅    |

---

## Conceitos Aplicados

- Arquitetura em camadas (Controller / Service / Repository)
- Separação de responsabilidades
- Ownership (segurança multiusuário)
- RBAC com middleware `requireRole`
- Role embutida no JWT (sem consulta ao banco)
- Helpers de role centralizados (`roleHelpers.ts`)
- Validação de dados no service
- Middleware de autenticação (JWT Bearer)
- Tratamento global de erros
- Prisma como ORM
- Docker para isolamento do banco
- Migrations versionadas

---

## Objetivo do Projeto

- Simular backend corporativo real
- Aplicar boas práticas de arquitetura
- Demonstrar segurança em APIs multiusuário
- Servir como projeto âncora de portfólio

---

## Próximos Passos

- Validação de payload (Zod ou class-validator)
- Testes automatizados (Jest + Supertest)
- Logs estruturados
- Deploy (Docker + cloud)

---

## Autor

Desenvolvado por João Moreira