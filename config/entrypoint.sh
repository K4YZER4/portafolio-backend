#!/bin/sh
set -e

echo "========================================================"
echo "🚀 INICIANDO SERVICIOS DE PORTAFOLIO (RITMO + PDF-FILLER)"
echo "========================================================"

# 1. Configuración de carpetas y permisos para PostgreSQL efímero y uploads
mkdir -p /run/postgresql /var/lib/postgresql/data /app/pdf-filler/uploads /app/pdf-filler/logs
chown -R postgres:postgres /run/postgresql /var/lib/postgresql/data
chown -R app:nodejs /app/pdf-filler/uploads /app/pdf-filler/logs

# 2. Inicializar cluster de PostgreSQL si es primer arranque
if [ ! -f /var/lib/postgresql/data/PG_VERSION ]; then
  echo "📦 Inicializando nuevo cluster PostgreSQL local efímero..."
  su-exec postgres initdb -D /var/lib/postgresql/data -E UTF8 --locale=C

  # Configuración optimizada para mínimo consumo de memoria en Render (512MB RAM total)
  echo "host all all 127.0.0.1/32 trust" >> /var/lib/postgresql/data/pg_hba.conf
  echo "local all all trust" >> /var/lib/postgresql/data/pg_hba.conf
  echo "listen_addresses = '127.0.0.1'" >> /var/lib/postgresql/data/postgresql.conf
  echo "shared_buffers = 32MB" >> /var/lib/postgresql/data/postgresql.conf
  echo "work_mem = 2MB" >> /var/lib/postgresql/data/postgresql.conf
  echo "maintenance_work_mem = 16MB" >> /var/lib/postgresql/data/postgresql.conf
  echo "max_connections = 30" >> /var/lib/postgresql/data/postgresql.conf
fi

# 3. Arrancar servicio PostgreSQL local
echo "🐘 Arrancando PostgreSQL en background..."
su-exec postgres postgres -D /var/lib/postgresql/data &
PG_PID=$!

echo "⏳ Verificando disponibilidad de PostgreSQL..."
RETRIES=30
until pg_isready -h 127.0.0.1 -p 5432 -U postgres > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  sleep 1
  RETRIES=$((RETRIES - 1))
done

if [ $RETRIES -eq 0 ]; then
  echo "❌ Error: PostgreSQL no inició a tiempo."
  exit 1
fi
echo "✅ PostgreSQL disponible en 127.0.0.1:5432."

# 4. Crear bases de datos aisladas para cada proyecto
echo "🗄️ Verificando bases de datos..."
su-exec postgres psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'rellenador'" | grep -q 1 || \
  su-exec postgres psql -U postgres -c "CREATE DATABASE rellenador;"
echo "  ↳ Base de datos 'rellenador' lista."

su-exec postgres psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'ritmo'" | grep -q 1 || \
  su-exec postgres psql -U postgres -c "CREATE DATABASE ritmo;"
echo "  ↳ Base de datos 'ritmo' lista."

# 5. Migraciones y Seed de PDF-FILLER
echo "--------------------------------------------------------"
echo "📄 [PDF-FILLER] Ejecutando Prisma Migrate y Seed..."
export DATABASE_URL="postgresql://postgres@127.0.0.1:5432/rellenador?schema=organizacion"
echo "DATABASE_URL=\"postgresql://postgres@127.0.0.1:5432/rellenador?schema=organizacion\"" > /app/pdf-filler/.env
cd /app/pdf-filler
./node_modules/.bin/prisma migrate deploy
echo "🌱 [PDF-FILLER] Sembrando catálogos y empresa demo..."
node dist/prisma/seed.js || echo "⚠️ Seed de PDF-FILLER finalizado con avisos."

# 6. Migraciones y Seed de RITMO
echo "--------------------------------------------------------"
echo "🏋️ [RITMO] Ejecutando Prisma Migrate y Seed..."
export DATABASE_URL="postgresql://postgres@127.0.0.1:5432/ritmo"
export DIRECT_URL="postgresql://postgres@127.0.0.1:5432/ritmo"
echo "DATABASE_URL=\"postgresql://postgres@127.0.0.1:5432/ritmo\"" > /app/ritmo/.env
echo "DIRECT_URL=\"postgresql://postgres@127.0.0.1:5432/ritmo\"" >> /app/ritmo/.env
cd /app/ritmo
./node_modules/.bin/prisma migrate deploy
echo "🌱 [RITMO] Sembrando datos de prueba para reclutadores..."
node dist/prisma-seed/seed-demo.js || echo "⚠️ Seed de RITMO finalizado con avisos."

# 7. Configuración de Nginx con puerto dinámico de Render
TARGET_PORT=${PORT:-10000}
echo "--------------------------------------------------------"
echo "🌐 Configurando Nginx para recibir tráfico en puerto ${TARGET_PORT}..."
mkdir -p /etc/nginx/http.d
sed -e "s/__PORT__/${TARGET_PORT}/g" /app/config/nginx.conf > /etc/nginx/http.d/default.conf

# 8. Variables de entorno por defecto (Fallback para modo demo sin romper arranque)
export NODE_ENV=production
export DEMO_MODE=true
export JWT_SECRET=${JWT_SECRET:-"super_secret_jwt_demo_key_with_at_least_32_characters_12345"}
export JWT_EXPIRATION_TIME=${JWT_EXPIRATION_TIME:-86400}
export RATE_LIMIT_TTL=${RATE_LIMIT_TTL:-60}
export RATE_LIMIT_GLOBAL_LIMIT=${RATE_LIMIT_GLOBAL_LIMIT:-120}
export STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-"sk_test_demo_placeholder_for_portfolio_12345"}
export STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-"whsec_demo_placeholder_for_portfolio_12345"}
export FRONTEND_URL=${FRONTEND_URL:-"https://ritmo-demo.vercel.app"}

# 9. Iniciar procesos Node.js con memoria controlada
echo "🚀 Arrancando RITMO API (Puerto interno :3001 | Max RAM: 110MB)..."
cd /app/ritmo
PORT=3001 node --max-old-space-size=110 dist/main.js &
RITMO_PID=$!

echo "🚀 Arrancando PDF-FILLER API (Puerto interno :3002 | Max RAM: 120MB)..."
cd /app/pdf-filler
PORT=3002 NEST_PORT=3002 node --max-old-space-size=120 dist/src/main.js &
PDF_PID=$!

# 10. Limpieza controlada de procesos al recibir señales de Render
cleanup() {
  echo "🛑 Recibida señal de apagado. Deteniendo procesos de forma limpia..."
  kill -TERM "$RITMO_PID" 2>/dev/null || true
  kill -TERM "$PDF_PID" 2>/dev/null || true
  kill -TERM "$PG_PID" 2>/dev/null || true
  nginx -s quit 2>/dev/null || true
  exit 0
}
trap cleanup TERM INT

# 11. Iniciar Nginx en primer plano (mantiene vivo el contenedor)
echo "========================================================"
echo "🌟 SERVICIOS ACTIVOS. Esperando peticiones en puerto ${TARGET_PORT}..."
echo "  ↳ Rutas: /ritmo/*  |  /pdf/*  |  /health"
echo "========================================================"
nginx -g "daemon off;"
