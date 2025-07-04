FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]
