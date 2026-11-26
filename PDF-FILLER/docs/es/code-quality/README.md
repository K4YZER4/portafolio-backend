<div align="left">
  <a href="../../../README.es.md">
    <img src="https://img.shields.io/badge/← Inicio-lightgray?style=flat" alt="Volver a Inicio"/>
  </a>
</div>
<div align="right">
  <a href="../../en/code-quality/README.md">
    <img src="https://img.shields.io/badge/🇺🇸_Read_in_English-006494?style=for-the-badge&logo=readme&logoColor=white" alt="Read in English"/>
  </a>
</div>
# Documentación de Calidad de Código

Documentación completa sobre la configuración de ESLint, Prettier y TypeScript para el proyecto Rellenador de Contratos.

---

## Descripción General

Esta sección cubre cómo mantener altos estándares de calidad de código usando tres herramientas complementarias:

- **ESLint** — Detecta errores lógicos y aplica estándares de codificación
- **Prettier** — Formatea automáticamente el código para consistencia
- **TypeScript** — Previene errores de tipo antes de la ejecución

---

## Estructura de la Documentación

### 📚 [Tutorial: Comenzando](./01-tutorial.md)

**Para:** Desarrolladores nuevos en herramientas de calidad  
**Contiene:** Guía paso a paso para entender y usar cada herramienta  
**Tiempo:** 30 minutos  
**Objetivo:** Entender qué hace cada herramienta y cómo ejecutarlas

### 🛠️ [Guías Prácticas](./02-how-to-guides.md)

**Para:** Desarrolladores resolviendo problemas específicos  
**Contiene:** Recetas prácticas para tareas comunes  
**Ejemplos:** Cómo arreglar errores, configurar herramientas, integrar con editor  
**Objetivo:** Soluciones rápidas a problemas reales

### 📖 [Referencia](./03-reference.md)

**Para:** Desarrolladores que necesitan detalles técnicos  
**Contiene:** Listas completas de reglas, opciones y configuraciones  
**Ejemplos:** Todas las reglas de ESLint, opciones de compilador de TypeScript, configuración de Prettier  
**Objetivo:** Buscar valores exactos y detalles técnicos

### 💡 [Explicación](./04-explanation.md)

**Para:** Desarrolladores que quieren entender la filosofía  
**Contiene:** Por qué la calidad de código importa, beneficios, ROI  
**Ejemplos:** Escenarios reales, caso de negocio  
**Objetivo:** Entender el panorama general y la motivación

---

## Inicio Rápido

**¿Primera vez aquí?** Comienza con el [Tutorial](./01-tutorial.md).

**¿Necesitas resolver un problema?** Consulta las [Guías Prácticas](./02-how-to-guides.md).

**¿Buscas detalles técnicos?** Usa la [Referencia](./03-reference.md).

**¿Quieres entender por qué?** Lee la [Explicación](./04-explanation.md).

---

## Comandos Esenciales

```bash
# Verificar compilación de TypeScript
npm run build

# Ejecutar verificaciones de ESLint
npm run lint

# Auto-arreglar problemas de ESLint
npm run lint:fix

# Formatear código con Prettier
npm run format

# Verificar si Prettier haría cambios
npm run format:check
```

---

## Archivos de Configuración

| Archivo                 | Propósito                             |
| ----------------------- | ------------------------------------- |
| `tsconfig.json`         | Opciones del compilador de TypeScript |
| `.eslintrc.json`        | Reglas y configuración de ESLint      |
| `.prettierrc.json`      | Opciones de formateo de Prettier      |
| `.eslintignore`         | Archivos que ESLint debe omitir       |
| `.vscode/settings.json` | Integración de VS Code (opcional)     |

---

## Problemas Comunes

**"Property 'X' does not exist"** → Ver [How-to: Arreglar Errores de Tipo](./02-how-to-guides.md#cómo-arreglar-error-de-tipo-property-does-not-exist)

**"Variable is declared but never used"** → Ver [How-to: Variables Sin Usar](./02-how-to-guides.md#cómo-arreglar-error-de-tipo-value-is-declared-but-never-used)

**Editor no muestra errores** → Ver [How-to: Configurar ESLint para IDE](./02-how-to-guides.md#cómo-configurar-eslint-para-trabajar-con-tu-ide)

---

## Filosofía

Las herramientas de calidad de código existen por una razón: **hacer el desarrollo más rápido y seguro**.

Detectan bugs que los humanos pasan por alto, aplican consistencia para que los equipos estén alineados, y previenen crashes antes de que lleguen a producción.

Aprende más en la [Explicación](./04-explanation.md).

---

## ¿Qué Sigue?

- [ ] Lee el [Tutorial](./01-tutorial.md)
- [ ] Ejecuta `npm run build && npm run lint && npm run format:check`
- [ ] Arregla los errores usando [Guías Prácticas](./02-how-to-guides.md)
- [ ] Configura tu editor para formateo automático
- [ ] Comparte esta documentación con tu equipo

---

## ¿Preguntas?

Consulta la sección apropiada:

- **Aprendiendo:** [Tutorial](./01-tutorial.md)
- **Haciendo:** [Guías Prácticas](./02-how-to-guides.md)
- **Entendiendo:** [Referencia](./03-reference.md) o [Explicación](./04-explanation.md)
