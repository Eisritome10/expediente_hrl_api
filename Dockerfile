# syntax=docker/dockerfile:1

# ---- build: instala todo, genera el cliente Prisma y compila Nest ----
FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
# prisma.config.ts lee DATABASE_URL; para generate basta un valor ficticio
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build yarn prisma generate \
  && yarn build

# ---- runtime ----
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000
RUN corepack enable
# Se conservan las devDependencies porque `prisma migrate deploy` (CLI) corre al arrancar
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json prisma.config.ts ./
USER node
EXPOSE 3000
# Aplica migraciones pendientes y levanta la API (el seeder crea el ADMIN inicial al arrancar)
CMD ["sh", "-c", "yarn prisma migrate deploy && node dist/main.js"]
