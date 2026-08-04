FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY packages/core ./packages/core
COPY packages/api-server ./packages/api-server

RUN npm install

# Build the shared core package so it is always in sync
RUN npm run build -w packages/core

WORKDIR /app/packages/api-server
RUN npx prisma generate
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
