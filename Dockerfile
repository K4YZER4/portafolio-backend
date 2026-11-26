# ========================================================
# STAGE 1: BUILDER RITMO
# ========================================================
FROM node:22-alpine AS builder-ritmo

WORKDIR /app/ritmo

# Dependencias nativas para compilación de módulos C++/TypeScript
RUN apk add --no-cache openssl python3 make g++
RUN corepack enable && corepack prepare pnpm@11.5.3 --activate

COPY RITMO/package.json RITMO/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY RITMO/ .
RUN npx prisma generate
RUN pnpm run build
RUN pnpm prune --prod


# ========================================================
# STAGE 2: BUILDER PDF-FILLER
# ========================================================
FROM node:22-alpine AS builder-pdf

WORKDIR /app/pdf-filler

RUN apk add --no-cache openssl python3 make g++

COPY PDF-FILLER/package.json PDF-FILLER/package-lock.json ./
RUN npm ci --ignore-scripts

COPY PDF-FILLER/ .
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev


# ========================================================
# STAGE 3: RUNTIME PRODUCTION IMAGE
# ========================================================
FROM node:22-alpine AS production

# Dependencias del sistema en runtime:
# - postgresql & postgresql-contrib: motor de base de datos efímero
# - su-exec: ejecución segura del daemon de PostgreSQL
# - openssl: query engine nativo de Prisma
# - nginx: reverse proxy interno para ruteo por prefijos (/ritmo y /pdf)
RUN apk add --no-cache postgresql postgresql-contrib su-exec openssl nginx

# Usuario de sistema no-root
RUN addgroup -S nodejs && adduser -S app -G nodejs

WORKDIR /app

# Copiar scripts de configuración y orquestador
COPY config/ /app/config/
RUN chmod +x /app/config/entrypoint.sh

# Copiar artefactos y dependencias de producción de RITMO
COPY --from=builder-ritmo /app/ritmo/node_modules /app/ritmo/node_modules
COPY --from=builder-ritmo /app/ritmo/dist /app/ritmo/dist
COPY --from=builder-ritmo /app/ritmo/package.json /app/ritmo/package.json
COPY --from=builder-ritmo /app/ritmo/prisma /app/ritmo/prisma

# Copiar artefactos y dependencias de producción de PDF-FILLER
COPY --from=builder-pdf /app/pdf-filler/node_modules /app/pdf-filler/node_modules
COPY --from=builder-pdf /app/pdf-filler/dist /app/pdf-filler/dist
COPY --from=builder-pdf /app/pdf-filler/package.json /app/pdf-filler/package.json
COPY --from=builder-pdf /app/pdf-filler/prisma /app/pdf-filler/prisma
COPY --from=builder-pdf /app/pdf-filler/prisma.config.ts /app/pdf-filler/prisma.config.ts
COPY --from=builder-pdf /app/pdf-filler/contrato_demo.pdf /app/pdf-filler/contrato_demo.pdf
COPY --from=builder-pdf /app/pdf-filler/tablas /app/pdf-filler/tablas
COPY --from=builder-pdf /app/pdf-filler/spa.traineddata* /app/pdf-filler/

# Variables de entorno base
ENV NODE_ENV=production
ENV PORT=10000

# Exponer el puerto asignado por Render
EXPOSE 10000

# Verificación de salud periódica
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||10000)+'/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

ENTRYPOINT ["/app/config/entrypoint.sh"]
