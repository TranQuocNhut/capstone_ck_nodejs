# Build stage
FROM node:18-alpine AS builder

# Install build tools for native dependencies like bcrypt & openssl
RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --legacy-peer-deps

COPY . .

RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine

# Install openssl for Prisma runtime compatibility on alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
