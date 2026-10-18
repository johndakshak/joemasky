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

# Apply pending migrations, then start the API server.
# DIRECT_URL must be set as an environment variable on this service;
# it is not present in the image and is never committed to source control.
CMD ["sh", "-c", "\
  if [ -z \"$DIRECT_URL\" ]; then \
    echo 'ERROR: DIRECT_URL environment variable is not set.'; \
    echo 'Set it in your Render service environment variables before deploying.'; \
    exit 1; \
  fi && \
  npx prisma migrate deploy && \
  node dist/server.js \
"]