const eur = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const eurSinDecimales = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0
});

const pct = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });

export const formatoEur = (x) => eur.format(Number.isFinite(x) ? x : 0);
export const formatoEurCorto = (x) => eurSinDecimales.format(Number.isFinite(x) ? x : 0);
export const formatoPct = (x) => `${pct.format(Number.isFinite(x) ? x : 0)} %`;
export const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
