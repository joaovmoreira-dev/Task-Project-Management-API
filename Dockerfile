FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

RUN ls -la dist/ || echo "dist não encontrado"

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]