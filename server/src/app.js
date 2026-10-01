import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb } from './db/init.js';
import empresasRouter from './routes/empresas.js';
import carterasRouter from './routes/carteras.js';
import proyeccionRouter from './routes/proyeccion.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', '..', 'client', 'dist');

export function createApp() {
  initDb();

  const app = express();
  app.use(express.json());

  app.use('/api/empresas', empresasRouter);
  app.use('/api/carteras', carterasRouter);
  app.use('/api/proyeccion', proyeccionRouter);

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: { message: 'Ruta no encontrada' } });
  });

  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(distDir, 'index.html'));
      }
      return next();
    });
  }

  app.use(errorHandler);
  return app;
}
