FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./
COPY prisma ./prisma/
COPY .env.example .env

RUN bun install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src/
COPY prisma.config.ts ./
COPY index.ts ./
COPY core.ts ./
COPY lang ./lang/
COPY assets ./assets/
COPY storage ./storage/
COPY sessions ./sessions/

RUN bun run build

EXPOSE 3000

CMD ["node", "dist/index.js"]