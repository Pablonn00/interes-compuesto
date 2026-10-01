import { db } from '../db/connection.js';

function depositosDe(idCartera) {
  return db
    .prepare('SELECT empresa_id, importe FROM depositos WHERE cartera_id = ? ORDER BY empresa_id')
    .all(idCartera);
}

export const carterasRepo = {
  listar() {
    return db
      .prepare(
        `SELECT c.id, c.nombre, c.anios, c.updated_at,
                COALESCE(SUM(d.importe), 0) AS total_aportado
         FROM carteras c
         LEFT JOIN depositos d ON d.cartera_id = c.id
         GROUP BY c.id
         ORDER BY c.updated_at DESC, c.id DESC`
      )
      .all();
  },

  obtener(id) {
    const cartera = db.prepare('SELECT * FROM carteras WHERE id = ?').get(id);
    if (!cartera) return null;
    return { ...cartera, depositos: depositosDe(id) };
  },

  crear({ nombre, anios, depositos }) {
    const crear = db.transaction(() => {
      const id = db.prepare('INSERT INTO carteras (nombre, anios) VALUES (?, ?)').run(nombre, anios)
        .lastInsertRowid;
      const insertDep = db.prepare(
        'INSERT INTO depositos (cartera_id, empresa_id, importe) VALUES (?, ?, ?)'
      );
      for (const d of depositos) insertDep.run(id, d.empresa_id, d.importe);
      return id;
    });
    const id = crear();
    return this.obtener(id);
  },

  actualizar(id, { nombre, anios, depositos }) {
    const actualizar = db.transaction(() => {
      const cambios = db
        .prepare("UPDATE carteras SET nombre = ?, anios = ?, updated_at = datetime('now') WHERE id = ?")
        .run(nombre, anios, id);
      if (cambios.changes === 0) return false;
      db.prepare('DELETE FROM depositos WHERE cartera_id = ?').run(id);
      const insertDep = db.prepare(
        'INSERT INTO depositos (cartera_id, empresa_id, importe) VALUES (?, ?, ?)'
      );
      for (const d of depositos) insertDep.run(id, d.empresa_id, d.importe);
      return true;
    });
    if (!actualizar()) return null;
    return this.obtener(id);
  },

  eliminar(id) {
    const resultado = db.prepare('DELETE FROM carteras WHERE id = ?').run(id);
    return resultado.changes > 0;
  }
};
