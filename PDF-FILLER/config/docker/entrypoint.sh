#!/bin/sh
set -e

echo "🚀 Iniciando contenedor PDF-FILLER Demo..."

# 1. Configurar directorios de PostgreSQL
mkdir -p /run/postgresql /var/lib/postgresql/data /app/uploads /app/logs
chown -R postgres:postgres /run/postgresql /var/lib/postgresql/data
chown -R app:nodejs /app/uploads /app/logs

# 2. Inicializar cluster de PostgreSQL si es la primera vez
if [ ! -f /var/lib/postgresql/data/PG_VERSION ]; then
  echo "📦 Inicializando nueva base de datos PostgreSQL local efímera..."
  su-exec postgres initdb -D /var/lib/postgresql/data -E UTF8 --locale=C

  # Permitir conexiones locales sin contraseña para localhost
  echo "host all all 127.0.0.1/32 trust" >> /var/lib/postgresql/data/pg_hba.conf
  echo "local all all trust" >> /var/lib/postgresql/data/pg_hba.conf
  echo "listen_addresses = '127.0.0.1'" >> /var/lib/postgresql/data/postgresql.conf
fi

# 3. Arrancar PostgreSQL como usuario postgres
echo "🐘 Iniciando servicio de PostgreSQL..."
su-exec postgres postgres -D /var/lib/postgresql/data &
PG_PID=$!

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté disponible..."
RETRIES=30
until pg_isready -h 127.0.0.1 -p 5432 -U postgres > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  sleep 1
  RETRIES=$((RETRIES - 1))
done

if [ $RETRIES -eq 0 ]; then
  echo "❌ Error: PostgreSQL no inició a tiempo."
  exit 1
fi
echo "✅ PostgreSQL listo y escuchando en 127.0.0.1:5432."

# 4. Crear la base de datos si no existe
su-exec postgres psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'rellenador'" | grep -q 1 || \
  su-exec postgres psql -U postgres -c "CREATE DATABASE rellenador;"
echo "✅ Base de datos 'rellenador' verificada."

# 5. Ejecutar migraciones de Prisma (crea todos los esquemas: catalogo, cliente, credito, documentos, organizacion)
echo "📜 Aplicando migraciones de Prisma..."
export DATABASE_URL="postgresql://postgres@127.0.0.1:5432/rellenador?schema=organizacion"
npx prisma migrate deploy

# 6. Ejecutar seeds (catálogos, roles, empresa demo, usuarios demo)
echo "🌱 Sembrando datos iniciales en la base de datos..."
node dist/prisma/seed.js || echo "⚠️ Seed completado con advertencias (datos ya existentes)."

# 7. Manejar señales de parada limpia
trap 'echo "🛑 Deteniendo servicios..."; kill -TERM $PG_PID; exit 0' TERM INT

# 8. Arrancar la aplicación NestJS
echo "🌟 Arrancando Backend en el puerto ${PORT:-10000}..."
node dist/src/main.js &
APP_PID=$!

# Esperar al proceso de la aplicación
wait $APP_PID
