import { test } from 'node:test';
import assert from 'node:assert/strict';
import { proyectar, calcularResumen, round2 } from '../src/services/compound.js';

const MIL_10 = [{ importe: 1000, tasa: 0.1 }];

test('año 0: solo el capital aportado, sin ganancia', () => {
  const [anio0] = proyectar(MIL_10, 5);
  assert.deepEqual(anio0, {
    anio: 0,
    aportado: 1000,
    reinvertidas: 0,
    gananciaAnio: 0,
    total: 1000,
    totalSimple: 1000
  });
});

test('año 1: gana exactamente D·r y aún no hay reinvertidas', () => {
  const [, anio1] = proyectar(MIL_10, 5);
  assert.equal(anio1.gananciaAnio, 100);
  assert.equal(anio1.reinvertidas, 0);
  assert.equal(anio1.total, 1100);
});

test('año 2: la ganancia del año 1 (100 €) aparece reinvertida y se gana más que el año 1', () => {
  const [, , anio2] = proyectar(MIL_10, 5);
  assert.equal(anio2.reinvertidas, 100);
  assert.equal(anio2.gananciaAnio, 110);
  assert.ok(anio2.gananciaAnio > 100, 'el año 2 debe ganar más que el año 1');
  assert.equal(anio2.total, 1210);
});

test('los tres segmentos suman exactamente el total en todos los años', () => {
  const porAnio = proyectar([{ importe: 333.33, tasa: 0.073 }], 30);
  for (const a of porAnio) {
    assert.equal(round2(a.aportado + a.reinvertidas + a.gananciaAnio), a.total);
  }
});

test('interés compuesto siempre >= interés simple; la diferencia crece con los años', () => {
  const porAnio = proyectar(MIL_10, 10);
  let extraAnterior = -1;
  for (const a of porAnio) {
    assert.ok(a.total >= a.totalSimple);
    const extra = round2(a.total - a.totalSimple);
    assert.ok(extra >= extraAnterior, 'el extra por compuesto no puede decrecer');
    extraAnterior = extra;
  }
  assert.equal(round2(porAnio[1].total - porAnio[1].totalSimple), 0, 'a año 1 simple y compuesto coinciden');
  assert.ok(porAnio[10].total - porAnio[10].totalSimple > 0);
});

test('tasa 0: el capital ni crece ni decrece', () => {
  const porAnio = proyectar([{ importe: 500, tasa: 0 }], 5);
  for (const a of porAnio) {
    assert.equal(a.total, 500);
    assert.equal(a.gananciaAnio, 0);
  }
});

test('varias empresas: el total agregado es la suma de las individuales', () => {
  const anios = 7;
  const conjunto = [
    { importe: 500, tasa: 0.1 },
    { importe: 300, tasa: 0.2 },
    { importe: 200, tasa: 0.05 }
  ];
  const agregado = proyectar(conjunto, anios);
  const individuales = conjunto.map((p) => proyectar([p], anios));
  for (let n = 0; n <= anios; n++) {
    const suma = round2(individuales.reduce((acc, serie) => acc + serie[n].total, 0));
    assert.equal(agregado[n].total, suma);
  }
});

test('tasa negativa: la pérdida también se acumula', () => {
  const porAnio = proyectar([{ importe: 1000, tasa: -0.05 }], 2);
  assert.equal(porAnio[2].total, 902.5);
  assert.ok(porAnio[2].total < porAnio[1].total);
});

test('resumen: las cifras finales cuadran con el último año', () => {
  const porAnio = proyectar([{ importe: 1000, tasa: 0.1 }], 5);
  const resumen = calcularResumen(porAnio);
  const ultimo = porAnio[porAnio.length - 1];
  assert.equal(resumen.valorTotal, ultimo.total);
  assert.equal(resumen.aportado, 1000);
  assert.equal(resumen.gananciaTotal, round2(ultimo.total - 1000));
  assert.equal(resumen.extraPorCompuesto, round2(ultimo.total - ultimo.totalSimple));
});
