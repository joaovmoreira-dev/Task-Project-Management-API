# API Backend com Node.js, TypeScript e Express

Projeto base de uma API backend desenvolvida com Node.js, TypeScript e Express.

O objetivo deste projeto é consolidar os fundamentos de TypeScript no backend, estruturar corretamente uma aplicação Node.js e preparar a base para evoluções futuras como autenticação, banco de dados e testes automatizados.


## Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- dotenv
- ts-node-dev


## Estrutura do Projeto


api-ts/
│
├── src/
│ ├── app.ts
│ └── server.ts
│
├── .env
├── .gitignore
├── package.json
└── tsconfig.json

##  Como Executar o Projeto

1. Instalar as dependências:

    npm install

2. Criar o arquivo .env:

    Na raiz do projeto, crie um arquivo chamado .env com o seguinte conteúdo:

    PORT=3000

3. Rodar em ambiente de desenvolvimento:

    npm run dev

    O servidor iniciará em:

    http://localhost:3000

    Endpoint Disponível

    Health Check

    GET /health

    Resposta esperada:

        {
        "status": "OK"
        }

## Objetivo do Projeto

    Aprender configuração de TypeScript no backend

    Entender a estrutura básica do Express

    Organizar corretamente a inicialização do servidor

    Aplicar boas práticas desde o início

## Próximos Passos

    Estruturar rotas e controllers

    Criar middlewares personalizados

    Implementar tratamento global de erros

    Adicionar autenticação com JWT

    Integrar banco de dados

Desenvolvido por João Moreira.