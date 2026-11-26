# ========================================================
# STAGE 1: BUILDER (Compilación y generación de código)
# ========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencias nativas para compilar herramientas
RUN apk add --no-cache openssl python3 make g++

# 1. Copiar manifiestos de dependencias
COPY package.json package-lock.json ./

# 2. Instalar TODAS las dependencias (producción + desarrollo)
RUN npm ci --ignore-scripts

# 3. Copiar código fuente
COPY . .

# 4. Generar el cliente de Prisma (@prisma/client en node_modules/.prisma)
RUN npx prisma generate

# 5. Compilar TypeScript a JavaScript en dist/
RUN npm run build


# ========================================================
# STAGE 2: PRUNED (Aislamiento de dependencias de producción)
# ========================================================
FROM node:20-alpine AS pruned

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./

# Traemos las node_modules generadas del builder (que ya contienen .prisma/client)
COPY --from=builder /app/node_modules ./node_modules

# Poda estricta: eliminamos TypeScript, Jest, ESLint, SWC, @types, etc.
RUN npm prune --omit=dev


# ========================================================
# STAGE 3: PRODUCTION RUNTIME (Imagen final mínima y limpia)
# ========================================================
FROM node:20-alpine AS production

# 1. Herramientas del sistema requeridas en runtime
#    - postgresql & postgresql-contrib: para la base de datos efímera local
#    - su-exec: para iniciar postgres como usuario postgres sin root
#    - openssl: para el query engine nativo de Prisma
RUN apk add --no-cache postgresql postgresql-contrib su-exec openssl

# 2. Crear usuario no-root del sistema para la app
RUN addgroup -S nodejs && \
    adduser -S app -G nodejs

WORKDIR /app

# 3. Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=10000
ENV DEMO_MODE=true
ENV DATABASE_URL="postgresql://postgres@127.0.0.1:5432/rellenador?schema=organizacion"

# 4. Copiar ÚNICAMENTE las node_modules podadas de producción desde el stage 'pruned'
COPY --from=pruned /app/node_modules ./node_modules

# 5. Copiar los artefactos compilados y estáticos desde el stage 'builder'
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/contrato_demo.pdf ./contrato_demo.pdf
COPY --from=builder /app/tablas ./tablas

# 6. Copiar script entrypoint y dar permisos de ejecución
COPY config/docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# 7. Crear directorios para persistencia en runtime y permisos de postgres
RUN mkdir -p /app/uploads /app/logs /run/postgresql /var/lib/postgresql/data && \
    chown -R app:nodejs /app/uploads /app/logs && \
    chown -R postgres:postgres /run/postgresql /var/lib/postgresql/data

# 8. Exponer puerto para Render (10000)
EXPOSE 10000

# 9. Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||10000)+'/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# 10. Iniciar con el orquestador
ENTRYPOINT ["/app/entrypoint.sh"]
