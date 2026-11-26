# Despliegue de la demo

La demo está pensada para desplegarse con Vercel (frontend), Render (NestJS) y Neon (PostgreSQL).

## Variables principales

- `DEMO_MODE=true`: cada visitante debe enviar su propia `X-Gemini-Api-Key` para escanear documentos.
- `DEMO_MODE=false`: el backend usa `GEMINI_API_KEY` del entorno y no exige una clave del navegador.
- `FRONTEND_URL`: dominio público del frontend; se utiliza para CORS.
- `PORT`: puerto asignado por Render. Nest lo usa si no existe `NEST_PORT`.
- `PDF_TEMPLATE_URL`: URL privada o firmada de la plantilla que usará el backend en producción.

## Base de datos

Ejecutar migraciones y seed contra Neon antes de iniciar el servicio:

```bash
npx prisma migrate deploy
npx prisma db seed
```

El contenedor no ejecuta migraciones automáticamente. Esto evita que una instancia pública pueda modificar el esquema accidentalmente al reiniciarse.

## Plantilla del contrato

El repositorio usa únicamente `contrato_demo.pdf`, sin datos de una empresa real. La plantilla privada no debe subirse a GitHub. En producción, sube el PDF demo o la plantilla autorizada a Cloudinary/almacenamiento privado y configura `PDF_TEMPLATE_URL`. Si no se configura, el backend usa `PDF_TEMPLATE_PATH` y, por defecto, `contrato_demo.pdf`.

## Render

El Dockerfile inicia `dist/src/main.js` (NestJS). Configurar el health check en `/health`.

## Vercel

Configurar `VITE_API_BASE` con la URL pública de Render y `VITE_DEMO_MODE=true` para la demo.
