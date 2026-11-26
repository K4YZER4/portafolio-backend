# 🚀 Portfolio Multi-Backend (RITMO + PDF-FILLER)

Repositorio de despliegue unificado para portafolio backend en **Render (Free Tier)** con ruteo inverso mediante **Nginx** y motor **PostgreSQL efímero local**.

---

## 🏗️ Arquitectura del Sistema

```
[Cliente / Reclutador]
       │
       ▼ HTTPS ($PORT)
┌────────────────────────────────────────────────────────┐
│ NGINX REVERSE PROXY                                    │
│   ├─ /ritmo/*  ────────► RITMO API (:3001)             │
│   │                         │                          │
│   │                         ▼                          │
│   │                  PostgreSQL (:5432)                │
│   │                  (DB: ritmo)                       │
│   │                                                    │
│   ├─ /pdf/*    ────────► PDF-FILLER API (:3002)        │
│   │                         │                          │
│   │                         ▼                          │
│   │                  PostgreSQL (:5432)                │
│   │                  (DB: rellenador)                  │
│   │                                                    │
│   └─ /health   ────────► 200 OK (Render Health Check)  │
└────────────────────────────────────────────────────────┘
```

---

## 🌐 Mapeo de Rutas para Frontends en Vercel

Configura tus variables de entorno en tus proyectos de Vercel apuntando a la URL que te asigne Render:

| Proyecto | URL del Frontend (Vercel) | Variable de Entorno en Vercel |
| :--- | :--- | :--- |
| **RITMO** | `https://ritmo-demo.vercel.app` | `NEXT_PUBLIC_API_URL=https://tu-servicio.onrender.com/ritmo` |
| **PDF-FILLER** | `https://pdf-filler.vercel.app` | `VITE_API_URL=https://tu-servicio.onrender.com/pdf/api` |
| **Health Check** | N/A | `https://tu-servicio.onrender.com/health` |

---

## 📋 Pasos para Desplegar en Render

1. **Crear repositorio en GitHub**:
   * Sube esta carpeta `Portafolio` como un nuevo repositorio en tu cuenta de GitHub (ejemplo: `portfolio-backend`).
2. **Crear Web Service en Render**:
   * Ve a [dashboard.render.com](https://dashboard.render.com).
   * Clic en **New +** $\rightarrow$ **Web Service**.
   * Selecciona tu repositorio de GitHub `portfolio-backend`.
   * **Language**: Selecciona `Docker`.
   * **Plan**: `Free`.
   * **Health Check Path**: `/health`.
3. **¡Listo!**:
   * Render ejecutará el `Dockerfile` multistage, levantará el cluster local de PostgreSQL, aplicará las migraciones y seeds automáticamente para ambos proyectos, y dejará los servicios listos para responder.
