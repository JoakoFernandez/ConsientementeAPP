FROM node:20-alpine

WORKDIR /app

COPY package.json tsconfig.json ./
COPY packages/core ./packages/core
COPY packages/api-server ./packages/api-server

RUN npm install -g npm@latest
RUN npm install

WORKDIR /app/packages/api-server
RUN npx prisma generate
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
