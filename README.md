# Task & Project Management API

API backend desenvolvida com **Node.js**, **TypeScript** e **Express**, focada em boas práticas de arquitetura, segurança e escalabilidade.

Este projeto simula um ambiente real de aplicação corporativa, com controle de usuários, projetos e regras de acesso baseadas em ownership.

---

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL (Docker)
- JWT (autenticação)
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
│   ├── project/
│   └── user/
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

## 🔍 Endpoints

### Health Check

GET /health

Resposta:

{
  "status": "OK"
}

---

## Projects API

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

✔ Retorna apenas projetos do usuário autenticado

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

## 🔐 Regras de Segurança (Ownership)

- Todo projeto possui um `ownerId`
- O `ownerId` é definido automaticamente pelo backend
- O cliente NÃO pode enviar `ownerId` no payload
- Usuários só podem:
  - visualizar seus próprios projetos
  - atualizar seus próprios projetos
  - deletar seus próprios projetos

---

## Banco de Dados

Gerenciado com Prisma Migrate.

### Entidades principais:

- User
- Role
- Project

### Seed inicial:

- ADMIN
- MANAGER
- MEMBER

---

## Conceitos Aplicados

- Arquitetura em camadas (Controller / Service / Repository)
- Separação de responsabilidades
- Ownership (segurança multiusuário)
- Validação de dados no service
- Middleware de autenticação (JWT)
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

- RBAC (Admin pode acessar qualquer recurso)
- Validação de payload (Zod ou class-validator)
- Testes automatizados (Jest + Supertest)
- Logs estruturados
- Deploy (Docker + cloud)

---

## Autor

Desenvolvido por João Moreira