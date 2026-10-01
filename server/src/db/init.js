import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const EMPRESAS_DEFAULT = [
  { nombre: 'Repsol', ticker: 'REP', color: '#F58220', rendimiento: 8 },
  { nombre: 'Inditex', ticker: 'ITX', color: '#4B5563', rendimiento: 10 },
  { nombre: 'Santander', ticker: 'SAN', color: '#EC0000', rendimiento: 12 },
  { nombre: 'Iberdrola', ticker: 'IBE', color: '#9BC116', rendimiento: 7 },
  { nombre: 'BBVA', ticker: 'BBVA', color: '#0165B5', rendimiento: 11 }
];

export function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  seedSiVacio();
}

function seedSiVacio() {
  const { n: nEmpresas } = db.prepare('SELECT COUNT(*) AS n FROM empresas').get();
  if (nEmpresas === 0) {
    const insert = db.prepare(
      'INSERT INTO empresas (nombre, ticker, color, rendimiento_medio) VALUES (@nombre, @ticker, @color, @rendimiento)'
    );
    for (const e of EMPRESAS_DEFAULT) insert.run(e);
  }

  const { n: nCarteras } = db.prepare('SELECT COUNT(*) AS n FROM carteras').get();
  if (nCarteras === 0) {
    const idCartera = db
      .prepare("INSERT INTO carteras (nombre, anios) VALUES ('Cartera por defecto (1000 €)', 10)")
      .run().lastInsertRowid;
    const empresas = db.prepare('SELECT id FROM empresas ORDER BY id').all();
    const insertDep = db.prepare('INSERT INTO depositos (cartera_id, empresa_id, importe) VALUES (?, ?, ?)');
    const reparto = 1000 / empresas.length;
    for (const e of empresas) insertDep.run(idCartera, e.id, reparto);
  }
}
