FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm install && pnpm --filter device-emulator build

EXPOSE 3000

CMD ["node", "apps/device-emulator/dist/index.js"]
