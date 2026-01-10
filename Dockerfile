# =========================
# Stage 1 — build
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем только файлы зависимостей
COPY package.json package-lock.json ./

# Чистая, воспроизводимая установка
RUN npm ci

# Копируем исходники
COPY tsconfig*.json ./
COPY src ./src

# Сборка NestJS
RUN npm run build


# =========================
# Stage 2 — runtime
# =========================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Создаём non-root пользователя
RUN addgroup -S app && adduser -S app -G app

# Копируем ТОЛЬКО runtime-части
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Права
RUN chown -R app:app /app

USER app

EXPOSE 7171

CMD ["node", "dist/main.js"]
