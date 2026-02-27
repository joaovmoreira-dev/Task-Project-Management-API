# API Backend com Node.js, TypeScript e Express

Projeto base de uma API backend desenvolvida com **Node.js**, **TypeScript** e **Express**.

O objetivo deste projeto é consolidar os fundamentos de TypeScript no backend, estruturar corretamente uma aplicação Node.js e preparar a base para evoluções futuras como autenticação, integração com banco de dados e testes automatizados.

---

## 🚀 Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL (Docker)
- dotenv
- Helmet
- CORS

---

## 📂 Estrutura do Projeto

Task-Project-Management-API/
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── database/
│   │   └── prisma.ts
│   ├── repositories/
│   ├── routes/
│   ├── controllers/
│   ├── middlewares/
│   ├── errors/
│   └── utils/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── docker-compose.yml
├── prisma.config.ts
├── .env
├── .gitignore
├── package.json
└── tsconfig.json

---

## ⚙️ Como Executar o Projeto

### 1) Pré-requisitos

- Node.js (versão LTS recomendada)
- Docker + Docker Compose

---

### 2) Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

PORT=3000 

DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=api_ts_db

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/api_ts_db?schema=public"

> Se estiver usando outra porta (ex: 5433), ajuste na DATABASE_URL.

---

### 3) Subir o banco de dados (Postgres)

docker compose up -d

Verificar containers ativos:

docker ps

---

### 4) Instalar dependências

npm install

---

### 5) Rodar migrations (criar/atualizar tabelas)

npx prisma migrate dev

---

### 6) Rodar seed (inserir dados iniciais)

npx prisma db seed

O seed insere automaticamente as roles:
- ADMIN
- MANAGER
- MEMBER

---

### 7) Rodar aplicação em desenvolvimento

npm run dev

Servidor disponível em:

http://localhost:3000

---

## 🔍 Endpoint Disponível

### Health Check

GET /health

Resposta esperada:

{
  "status": "OK"
}

---

## 🗄️ Banco de Dados

O banco é versionado via **Prisma Migrate**.

### Estrutura atual:

- Role
- User
- Relação User → Role
- email único
- passwordHash obrigatório

### Dados iniciais (Seed):

- ADMIN
- MANAGER
- MEMBER

---

## 🧠 Conceitos Aplicados

- Separação de responsabilidades (routes, controllers, repositories)
- Camada de acesso ao banco isolada (Repository Pattern)
- Prisma Client centralizado
- Tratamento global de erros
- Hardening básico com Helmet e CORS
- Banco isolado via Docker
- Versionamento de schema com migrations
- Seed idempotente para dados obrigatórios

---

## 🎯 Objetivo do Projeto

- Consolidar backend com TypeScript
- Estruturar arquitetura organizada e escalável
- Aplicar boas práticas desde o início
- Preparar base sólida para autenticação e autorização (RBAC)

---

## 📌 Próximos Passos

- Implementar autenticação com JWT
- Implementar hash de senha com bcrypt
- Criar middleware de autorização (RBAC)
- Adicionar testes automatizados
- Preparar ambiente de produção
- Implementar deploy

---

Desenvolvido por João Moreira.