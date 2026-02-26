FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm install && pnpm --filter monitoring-service build

EXPOSE 3000

CMD ["sh", "-c", "echo $DATABASE_URL && pnpm --filter monitoring-service db:push && pnpm --filter monitoring-service db:seed && node apps/monitoring-service/dist/index.js"]
