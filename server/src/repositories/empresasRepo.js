import { db } from '../db/connection.js';

export const empresasRepo = {
  listar() {
    return db
      .prepare('SELECT id, nombre, ticker, color, rendimiento_medio FROM empresas ORDER BY id')
      .all();
  },

  obtener(id) {
    return db.prepare('SELECT * FROM empresas WHERE id = ?').get(id);
  },

  actualizarRendimiento(id, rendimientoMedio) {
    const resultado = db
      .prepare('UPDATE empresas SET rendimiento_medio = ? WHERE id = ?')
      .run(rendimientoMedio, id);
    return resultado.changes > 0;
  }
};
