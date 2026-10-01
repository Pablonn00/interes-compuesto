import { proyectar, calcularResumen, round2 } from '../services/compound.js';
import { empresasRepo } from '../repositories/empresasRepo.js';
import { validarAnios, validarDepositos } from './validacion.js';

const router = async (req, res, next) => {
  try {
    if (req.method === 'POST' && req.path === '/') {
      const { anios, depositos } = req.body ?? {};
      validarAnios(anios);
      validarDepositos(depositos);

      const empresas = depositos.map((d) => empresasRepo.obtener(d.empresa_id));
      const participaciones = depositos.map((d, i) => ({
        importe: d.importe,
        tasa: empresas[i].rendimiento_medio / 100
      }));

      const porAnio = proyectar(participaciones, anios);

      const porEmpresa = depositos.map((d, i) => {
        const e = empresas[i];
        const serie = proyectar([{ importe: d.importe, tasa: e.rendimiento_medio / 100 }], anios);
        const ultimo = serie[serie.length - 1];
        return {
          id: e.id,
          nombre: e.nombre,
          ticker: e.ticker,
          color: e.color,
          rendimiento: e.rendimiento_medio,
          aportado: ultimo.aportado,
          totalFinal: ultimo.total,
          ganancia: round2(ultimo.total - d.importe)
        };
      });

      return res.json({ anios, porAnio, porEmpresa, resumen: calcularResumen(porAnio) });
    }

    return next();
  } catch (e) {
    next(e);
  }
};

export default router;
