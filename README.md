# Interés compuesto — Repsol, Inditex, Santander, Iberdrola y BBVA

Simulador interactivo de interés compuesto con dashboard, API y base de datos.

## Estructura en 3 capas

| Capa | Carpeta | Tecnología |
|---|---|---|
| 1. Dashboard (cliente) | `client/` | React + Vite + Recharts |
| 2. Lógica de negocio (API) | `server/src/` | Node + Express (`services/compound.js` es el corazón del cálculo) |
| 3. Base de datos | `server/src/db/` | SQLite (better-sqlite3), seed idempotente |

## Ejecutar en local

```bash
npm install
npm --prefix server install
npm --prefix client install
npm run dev      # API en :3001 y dashboard en :5173
```

## Tests

```bash
npm test
```

## Build de producción

```bash
npm run build    # compila client/dist
npm start        # Express sirve API + dashboard en :3001
```

## Despliegue en Render

El archivo `render.yaml` define el servicio (Render Blueprint):

1. Sube este repositorio a GitHub.
2. En Render: **New + → Web Service** → conecta el repositorio.
3. Render detecta `render.yaml` y despliega solo. El enlace público es `https://<nombre>.onrender.com`.

Nota: en el plan gratuito el disco es efímero; si Render reinicia el servicio, la base de datos
se regenera con los valores por defecto (seed automático al arrancar).
