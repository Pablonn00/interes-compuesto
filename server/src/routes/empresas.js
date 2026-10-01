import { empresasRepo } from '../repositories/empresasRepo.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = async (req, res, next) => {
  try {
    if (req.method === 'GET' && req.path === '/') {
      return res.json(empresasRepo.listar());
    }

    const match = req.path.match(/^\/(\d+)$/);
    if (req.method === 'PUT' && match) {
      const id = Number(match[1]);
      const { rendimiento_medio: pct } = req.body ?? {};
      if (typeof pct !== 'number' || !Number.isFinite(pct) || pct <= -100 || pct > 100) {
        throw new HttpError(400, 'rendimiento_medio debe ser un número entre -99.9 y 100');
      }
      const actualizado = empresasRepo.actualizarRendimiento(id, pct);
      if (!actualizado) throw new HttpError(404, `Empresa con id ${id} no encontrada`);
      return res.json(empresasRepo.obtener(id));
    }

    return next();
  } catch (e) {
    next(e);
  }
};

export default router;
