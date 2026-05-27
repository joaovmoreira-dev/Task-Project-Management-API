# Task & Project Management API

API backend desenvolvida com **Node.js**, **TypeScript** e **Express**, focada em boas práticas de arquitetura, segurança e escalabilidade.

Este projeto simula um ambiente real de aplicação corporativa, com controle de usuários, projetos, tarefas e regras de acesso baseadas em ownership e papéis (RBAC).

---

## Links

- **API em produção:** https://task-project-management-api-production.up.railway.app
- **Documentação Swagger:** https://task-project-management-api-production.up.railway.app/api-docs
- **Health Check:** https://task-project-management-api-production.up.railway.app/health

---

## Tecnologias Utilizadas

- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL (Docker)
- JWT (autenticação)
- bcrypt
- Helmet + CORS
- express-rate-limit
- swagger-ui-express
- Jest + Supertest (testes)
- Docker + Docker Compose
- Railway (deploy)

---

## Arquitetura

O projeto segue arquitetura em camadas com separação clara de responsabilidades:

    src/
    ├── app.ts                  → configuração do Express
    ├── server.ts               → entrada da aplicação
    ├── database/
    │   └── prisma.ts           → instância do Prisma Client
    ├── docs/
    │   ├── swagger.ts          → configuração do Swagger
    │   └── routes/             → documentação dos endpoints
    ├── modules/
    │   ├── auth/               → autenticação (login, register, me)
    │   ├── project/            → CRUD de projetos
    │   ├── task/               → CRUD de tasks
    │   └── audit/              → logs de auditoria
    ├── middlewares/
    │   ├── authBearer.ts       → validação do JWT
    │   ├── requireRole.ts      → autorização por role
    │   ├── rateLimiter.ts      → rate limiting
    │   └── logger.ts           → log de requisições
    ├── errors/
    │   ├── AppErrors.ts        → classe de erro customizada
    │   └── errorHandler.ts     → handler global de erros
    └── utils/
        └── roleHelpers.ts      → helpers de verificação de role

**Fluxo de uma requisição:**

    Request → authMiddleware → requireRole → Controller → Service → Repository → Banco

---

## Segurança

### Autenticação
- JWT com expiração configurável via `JWT_EXPIRES_IN`
- Role embutida no token — sem consulta ao banco em cada request
- bcrypt com salt 10 para hash de senhas
- Mensagens neutras no login — não revela se email existe

### Autorização
- **Ownership** — projetos só podem ser acessados pelo owner ou ADMIN
- **RBAC** — roles controlam acesso a endpoints via middleware `requireRole`
- Role vem do JWT, não do banco

### Hardening
- Helmet configurando headers de segurança (XSS, clickjacking, MIME sniffing)
- CORS restrito por ambiente — em produção aceita apenas `CORS_ORIGIN`
- Rate limiting no login (10 tentativas / 10 min) e global (60 req / min)
- Nenhum stack trace exposto nas respostas

### Auditoria
- Todas as ações críticas são registradas no banco (login, CRUD de projetos e tasks)
- Endpoint `GET /audit-logs` exclusivo para ADMIN com filtros e paginação

---

## RBAC de Tasks

| Ação             | MEMBER               | MANAGER          | ADMIN |
|------------------|----------------------|------------------|-------|
| Criar task       | ✗                    | ✅               | ✅    |
| Listar tasks     | Só as suas           | ✅               | ✅    |
| Buscar task      | Só as suas           | ✅               | ✅    |
| Atualizar task   | ✗                    | ✅ (seu projeto) | ✅    |
| Atualizar status | ✅ (atribuída a ele) | ✅               | ✅    |
| Deletar task     | ✗                    | ✅ (seu projeto) | ✅    |

---

## Como Executar

### Modo local (sem Docker para a API)

**Pré-requisitos:** Node.js LTS + Docker

    # 1. Clone o repositório
    git clone https://github.com/Joao-Vitor-Moreira/Task-Project-Management-API.git
    cd Task-Project-Management-API

    # 2. Instale as dependências
    npm install

    # 3. Crie o .env baseado no .env.example
    cp .env.example .env

    # 4. Suba apenas o banco via Docker
    docker compose up -d postgres

    # 5. Rode as migrations
    npx prisma migrate dev

    # 6. Rode o seed (roles iniciais)
    npx prisma db seed

    # 7. Inicie a aplicação
    npm run dev

---

### Modo Docker completo

**Pré-requisitos:** Docker + Docker Compose

    # 1. Clone o repositório
    git clone https://github.com/Joao-Vitor-Moreira/Task-Project-Management-API.git
    cd Task-Project-Management-API

    # 2. Crie o .env.docker baseado no .env.example
    # Altere DATABASE_URL para usar @postgres ao invés de @localhost

    # 3. Suba tudo
    docker compose up -d --build

A API estará disponível em `http://localhost:3000`.

---

### Variáveis de ambiente

Crie `.env` baseado no `.env.example`:

    PORT=3000
    NODE_ENV=development

    DB_PORT=5433
    DB_USER=postgres
    DB_PASSWORD=postgres
    DB_NAME=api_ts_db

    DATABASE_URL="postgresql://postgres:postgres@localhost:5433/api_ts_db?schema=public"

    JWT_SECRET=your_secret_here
    JWT_EXPIRES_IN=15m

    CORS_ORIGIN=http://localhost:5173

---

## Testes

    # Rodar todos os testes
    npm test

    # Rodar com cobertura
    npm run test:coverage

A suíte de testes cobre autenticação, projetos, tasks, RBAC e edge cases com Jest + Supertest.

---

## Endpoints

A documentação completa e interativa está disponível no Swagger:

**Local:** http://localhost:3000/api-docs

**Produção:** https://task-project-management-api-production.up.railway.app/api-docs

### Resumo

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | /health | Health check | — |
| POST | /auth/register | Registrar usuário | — |
| POST | /auth/login | Login | — |
| GET | /auth/me | Dados do usuário | ✅ |
| POST | /projects | Criar projeto | ✅ |
| GET | /projects | Listar projetos | ✅ |
| GET | /projects/:id | Buscar projeto | ✅ |
| PATCH | /projects/:id | Atualizar projeto | ✅ |
| DELETE | /projects/:id | Deletar projeto | ✅ |
| POST | /tasks | Criar task | ✅ MANAGER+ |
| GET | /tasks | Listar tasks | ✅ |
| GET | /tasks/:id | Buscar task | ✅ |
| PATCH | /tasks/:id | Atualizar task | ✅ MANAGER+ |
| PATCH | /tasks/:id/status | Atualizar status | ✅ |
| DELETE | /tasks/:id | Deletar task | ✅ MANAGER+ |
| GET | /audit-logs | Logs de auditoria | ✅ ADMIN |

---

## Banco de Dados

Gerenciado com Prisma Migrate.

### Entidades

- **User** — usuário com role
- **Role** — ADMIN, MANAGER, MEMBER
- **Project** — projeto com owner
- **Task** — task vinculada a projeto e usuário
- **AuditLog** — registro de ações críticas

### Seed inicial

    npx prisma db seed

Cria as roles: `ADMIN`, `MANAGER`, `MEMBER`

---

## Decisões e Trade-offs

**Por que Prisma?**
Type-safety nativa com TypeScript, migrations versionadas e developer experience superior ao Sequelize para projetos novos.

**Por que JWT stateless?**
Sem necessidade de consulta ao banco a cada request — a role já vem no token. Trade-off: não é possível invalidar tokens antes do vencimento sem uma blacklist.

**Por que endpoint separado para status?**
Status é uma regra de negócio diferente de update de dados — MEMBER pode alterar status de tasks atribuídas a ele mas não pode alterar title ou description. Separar os endpoints permite aplicar permissões distintas de forma limpa.

**Por que RBAC no middleware e ownership no service?**
RBAC é uma regra genérica aplicável a qualquer rota — pertence ao middleware. Ownership é uma regra de negócio específica que precisa consultar o banco — pertence ao service.

---

## Conceitos Aplicados

- Arquitetura em camadas (Controller / Service / Repository)
- Separação de responsabilidades
- Ownership (segurança multiusuário)
- RBAC com middleware `requireRole`
- Role embutida no JWT (sem consulta ao banco)
- Helpers de role centralizados
- Validação de dados no service
- Middleware de autenticação JWT Bearer
- Rate limiting por endpoint
- Auditoria de ações críticas
- Tratamento global de erros
- Docker para isolamento e deploy
- Testes de integração com Jest + Supertest
- Documentação interativa com Swagger

---

## Autor

Desenvolvido por João Moreira

[![GitHub](https://img.shields.io/badge/GitHub-Joao--Vitor--Moreira-181717?logo=github)](https://github.com/Joao-Vitor-Moreira)