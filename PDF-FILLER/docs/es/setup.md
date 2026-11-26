<div align="left">
  <a href="../../README.es.md">
    <img src="https://img.shields.io/badge/← Inicio-lightgray?style=flat" alt="Volver al Inicio"/>
  </a>
</div>

<div align="right">
  <a href="../en/setup.md">
    <img src="https://img.shields.io/badge/🇺🇸_Read_in_English-006494?style=for-the-badge&logo=readme&logoColor=white" alt="Read in English"/>
  </a>
</div>

# Instalación y Ejecución

**Navegación:** Inicio › Docs › Instalación y Ejecución

---

## Requisitos Previos

- Node.js 20+
- npm 9+

## Instalación

```bash
git clone https://github.com/K4YZER4/PDF-FILLER.git
cd PDF-FILLER
npm install
```

## Variables de Entorno

```bash
cp .env.example .env
```

| Variable | Default | Descripción                          |
| -------- | ------- | ------------------------------------ |
| `PORT`   | `3000`  | Puerto en el que escucha el servidor |

## Herramientas de Calidad de Código

Este proyecto incluye herramientas para mantener la calidad del código:

### ESLint

Detecta problemas de código y aplica reglas de estilo:

```bash
# Verificar problemas
npm run lint

# Arreglar automáticamente
npm run lint:fix
```

**Configuración:** `.eslintrc.json`

- Parser: `@typescript-eslint`
- 11 reglas activas para calidad de código
- Patrones de `eslintignore` configurados

### Prettier

Formateador de código para estilo consistente:

```bash
# Verificar formato
npm run format:check

# Formatear automáticamente
npm run format
```

**Configuración:** `.prettierrc.json`

- Indentación de 2 espacios
- Comillas dobles
- Ancho de línea de 100 caracteres

### TypeScript

Seguridad de tipos y verificación de errores en tiempo de compilación:

```bash
# Verificar tipos
npm run build  # Incluye verificación de tipos

# Desarrollo con tipos
npm run dev    # También verifica tipos
```

**Configuración:** `tsconfig.json`

- Modo estricto habilitado
- Source maps generados
- Archivos de declaración (.d.ts) generados

### Referencia de Scripts

```bash
npm run build              # Compilar (TypeScript compile + verificar tipos)
npm run dev                # Modo desarrollo con auto-reload
npm run lint               # Verificar con ESLint
npm run lint:fix           # Arreglar automáticamente con ESLint
npm run format:check       # Verificar formato de Prettier
npm run format             # Formatear automáticamente código
npm run start              # Iniciar build de producción
```

**Ver más:** [Documentación de Calidad de Código](./code-quality/)

---

## Scripts Auxiliares

```bash
# Lista todos los campos de formulario nombrados y sus tipos de la plantilla PDF
npx ts-node scripts/listar_campos.ts
```

Útil cuando necesitas mapear nuevos campos de la plantilla de contrato.

## Archivos Requeridos

Coloca estos en la raíz del proyecto antes de ejecutar:

| Archivo           | Descripción                                      |
| ----------------- | ------------------------------------------------ |
| `contrato.pdf`    | Plantilla PDF con campos de formulario nombrados |
| `*.xlsx`          | Archivo de tablas de descuento                   |
| `spa.traineddata` | Datos de lenguaje español de Tesseract para OCR  |

> ⚠️ Estos archivos no están comprometidos en el repositorio porque contienen datos propietarios.

## Ejecución

```bash
# Desarrollo
npm run dev

# Build + producción
npm run build
npm start
```

El formulario web está disponible en:

```
http://localhost:3000/generador.html
```

---

**Siguiente:** [Referencia API](./api.md)
