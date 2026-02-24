# API Backend com Node.js, TypeScript e Express

Projeto base de uma API backend desenvolvida com **Node.js**, **TypeScript** e **Express**.

O objetivo deste projeto é consolidar os fundamentos de TypeScript no backend, estruturar corretamente uma aplicação Node.js e preparar a base para evoluções futuras como autenticação, integração com banco de dados e testes automatizados.

---

## 🚀 Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- dotenv
- Helmet
- CORS
- Docker (Postgres)

---

## 📂 Estrutura do Projeto

```text
Task-Project-Management-API/
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── routes/
│   ├── controllers/
│   ├── middlewares/
│   ├── errors/
│   └── utils/
│
├── docker-compose.yml
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## ⚙️ Como Executar o Projeto

### 1) Pré-requisitos

- Node.js (versão LTS recomendada)
- Docker + Docker Compose

---

### 2) Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=api_ts_db
```

---

### 3) Subir o banco de dados (Postgres)

```bash
docker compose up -d
```

Verificar se está rodando:

```bash
docker ps
```

---

### 4) Instalar dependências

```bash
npm install
```

---

### 5) Rodar em ambiente de desenvolvimento

```bash
npm run dev
```

Servidor disponível em:

```text
http://localhost:3000
```

---

## 🔍 Endpoint Disponível

### Health Check

```text
GET /health
```

Resposta esperada:

```json
{
  "status": "OK"
}
```

---

## 🧠 Conceitos Aplicados

- Separação de responsabilidades (routes, controllers, middlewares)
- Logger de requisições
- Tratamento global de erros
- Hardening inicial com Helmet e CORS
- Banco de dados isolado via Docker
- Configuração via variáveis de ambiente

---

## 🎯 Objetivo do Projeto

- Aprender configuração de TypeScript no backend
- Entender a estrutura básica do Express
- Organizar corretamente a inicialização do servidor
- Aplicar boas práticas desde o início
- Preparar base para evolução arquitetural

---

## 📌 Próximos Passos

- Implementar autenticação com JWT
- Integrar ORM (Prisma ou Sequelize)
- Criar sistema de usuários e permissões
- Adicionar testes automatizados
- Preparar deploy

---

Desenvolvido por João Moreira.