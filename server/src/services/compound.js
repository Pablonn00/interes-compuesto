export function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

/**
 * Proyecta el interés compuesto año a año.
 * @param {Array<{importe: number, tasa: number}>} participaciones
 *        importe: capital aportado a esa empresa (>= 0)
 *        tasa: rendimiento anual en formato decimal (0.12 = 12%)
 * @param {number} anios número de años a proyectar
 * @returns porAnio: [{ anio, aportado, reinvertidas, gananciaAnio, total, totalSimple }]
 *
 * Cada año se descompone en tres segmentos que suman exactamente el total:
 *   aportado     = D                     (capital inicial, constante)
 *   reinvertidas = D·((1+r)ⁿ⁻¹ − 1)      (ganancia de años anteriores ya reinvertida)
 *   gananciaAnio = D·r·(1+r)ⁿ⁻¹          (ganada durante este año)
 *   total        = D·(1+r)ⁿ
 * totalSimple = D·(1 + r·n)              (comparación: interés simple sin reinvertir)
 *
 * Cada participación se redondea por separado a céntimos, de modo que la suma
 * de varias empresas es exactamente igual a la suma de sus proyecciones
 * individuales (y a la suma de sus totales por empresa).
 */
export function proyectar(participaciones, anios) {
  const porAnio = [];
  for (let n = 0; n <= anios; n++) {
    let aportado = 0;
    let reinvertidas = 0;
    let gananciaAnio = 0;
    let totalSimple = 0;

    for (const { importe: d, tasa: r } of participaciones) {
      aportado += round2(d);
      if (n >= 1) {
        reinvertidas += round2(d * (Math.pow(1 + r, n - 1) - 1));
        gananciaAnio += round2(d * r * Math.pow(1 + r, n - 1));
      }
      totalSimple += round2(d * (1 + r * n));
    }

    const aportadoR = round2(aportado);
    const reinvertidasR = round2(reinvertidas);
    const gananciaAnioR = round2(gananciaAnio);

    porAnio.push({
      anio: n,
      aportado: aportadoR,
      reinvertidas: reinvertidasR,
      gananciaAnio: gananciaAnioR,
      total: round2(aportadoR + reinvertidasR + gananciaAnioR),
      totalSimple: round2(totalSimple)
    });
  }
  return porAnio;
}

export function calcularResumen(porAnio) {
  const ultimo = porAnio[porAnio.length - 1];
  return {
    anios: ultimo.anio,
    aportado: ultimo.aportado,
    valorTotal: ultimo.total,
    gananciaTotal: round2(ultimo.total - ultimo.aportado),
    totalSimple: ultimo.totalSimple,
    gananciaSimple: round2(ultimo.totalSimple - ultimo.aportado),
    extraPorCompuesto: round2(ultimo.total - ultimo.totalSimple)
  };
}
