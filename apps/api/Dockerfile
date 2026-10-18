FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

# Apply any pending migrations before starting the server.
# prisma migrate deploy is idempotent — it is safe to run on every start.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]