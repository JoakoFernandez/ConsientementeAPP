FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY packages/core ./packages/core
COPY packages/app ./packages/app

RUN npm install

WORKDIR /app/packages/app
RUN npx expo install --fix

# Patch expo-sqlite build files to add .js extensions to relative imports
RUN node patch-expo-sqlite.js

EXPOSE 8081

ENV CHOKIDAR_USEPOLLING=true
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

RUN npx expo export --platform web --output-dir dist
RUN npm install -g serve
CMD ["serve", "dist", "-l", "8081", "--cors"]
