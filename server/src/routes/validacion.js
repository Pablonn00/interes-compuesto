import { HttpError } from '../middleware/errorHandler.js';
import { empresasRepo } from '../repositories/empresasRepo.js';

export function validarAnios(anios) {
  if (!Number.isInteger(anios) || anios < 1 || anios > 50) {
    throw new HttpError(400, 'anios debe ser un entero entre 1 y 50');
  }
}

export function validarDepositos(depositos) {
  if (!Array.isArray(depositos) || depositos.length < 1 || depositos.length > 5) {
    throw new HttpError(400, 'depositos debe contener entre 1 y 5 empresas');
  }
  const vistos = new Set();
  for (const d of depositos) {
    if (!d || !Number.isInteger(d.empresa_id)) {
      throw new HttpError(400, 'Cada depósito necesita un empresa_id entero');
    }
    if (vistos.has(d.empresa_id)) {
      throw new HttpError(400, `La empresa ${d.empresa_id} aparece repetida`);
    }
    vistos.add(d.empresa_id);
    if (typeof d.importe !== 'number' || !Number.isFinite(d.importe) || d.importe < 0 || d.importe > 1e9) {
      throw new HttpError(400, 'Cada importe debe ser un número entre 0 y 1.000.000.000');
    }
    if (!empresasRepo.obtener(d.empresa_id)) {
      throw new HttpError(404, `Empresa con id ${d.empresa_id} no encontrada`);
    }
  }
}

export function validarNombre(nombre) {
  if (typeof nombre !== 'string' || nombre.trim().length < 1 || nombre.length > 80) {
    throw new HttpError(400, 'nombre debe ser un texto de 1 a 80 caracteres');
  }
}
