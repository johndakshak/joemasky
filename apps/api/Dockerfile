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
COPY --from=builder /app/prisma7.config.ts ./prisma7.config.ts
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 5000

# start.sh validates DIRECT_URL, applies pending Prisma migrations, and
# starts the API server only after migrations succeed.
CMD ["sh", "./start.sh"]
