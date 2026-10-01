import { carterasRepo } from '../repositories/carterasRepo.js';
import { validarAnios, validarDepositos, validarNombre } from './validacion.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = async (req, res, next) => {
  try {
    if (req.method === 'GET' && req.path === '/') {
      return res.json(carterasRepo.listar());
    }

    if (req.method === 'POST' && req.path === '/') {
      const { nombre, anios, depositos } = req.body ?? {};
      validarNombre(nombre);
      validarAnios(anios);
      validarDepositos(depositos);
      const creada = carterasRepo.crear({ nombre: nombre.trim(), anios, depositos });
      return res.status(201).json(creada);
    }

    const match = req.path.match(/^\/(\d+)$/);
    if (match) {
      const id = Number(match[1]);

      if (req.method === 'GET') {
        const cartera = carterasRepo.obtener(id);
        if (!cartera) throw new HttpError(404, `Cartera con id ${id} no encontrada`);
        return res.json(cartera);
      }

      if (req.method === 'PUT') {
        const { nombre, anios, depositos } = req.body ?? {};
        validarNombre(nombre);
        validarAnios(anios);
        validarDepositos(depositos);
        const actualizada = carterasRepo.actualizar(id, { nombre: nombre.trim(), anios, depositos });
        if (!actualizada) throw new HttpError(404, `Cartera con id ${id} no encontrada`);
        return res.json(actualizada);
      }

      if (req.method === 'DELETE') {
        const borrada = carterasRepo.eliminar(id);
        if (!borrada) throw new HttpError(404, `Cartera con id ${id} no encontrada`);
        return res.status(204).end();
      }
    }

    return next();
  } catch (e) {
    next(e);
  }
};

export default router;
