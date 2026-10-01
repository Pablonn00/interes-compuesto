import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let server;
let base;
let createApp;

before(async () => {
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ic-test-'));
  ({ createApp } = await import('../src/app.js'));
  const app = createApp();
  server = app.listen(0);
  await new Promise((resolve) => server.on('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server?.close();
});

async function api(metodo, ruta, cuerpo) {
  const opciones = { method: metodo, headers: {} };
  if (cuerpo !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(cuerpo);
  }
  const res = await fetch(base + ruta, opciones);
  const texto = await res.text();
  return { status: res.status, body: texto ? JSON.parse(texto) : null };
}

test('GET /api/empresas devuelve las 5 empresas con valores por defecto', async () => {
  const { status, body } = await api('GET', '/api/empresas');
  assert.equal(status, 200);
  assert.equal(body.length, 5);
  assert.deepEqual(
    body.map((e) => e.nombre),
    ['Repsol', 'Inditex', 'Santander', 'Iberdrola', 'BBVA']
  );
  for (const e of body) {
    assert.ok(e.color.startsWith('#'));
    assert.ok(typeof e.rendimiento_medio === 'number');
  }
});

test('PUT /api/empresas/:id actualiza el rendimiento', async () => {
  const { status, body } = await api('PUT', '/api/empresas/1', { rendimiento_medio: 15.5 });
  assert.equal(status, 200);
  assert.equal(body.rendimiento_medio, 15.5);
  const lista = await api('GET', '/api/empresas');
  assert.equal(lista.body.find((e) => e.id === 1).rendimiento_medio, 15.5);
});

test('PUT /api/empresas/:id rechaza rendimientos fuera de rango y ids inexistentes', async () => {
  assert.equal((await api('PUT', '/api/empresas/1', { rendimiento_medio: -100 })).status, 400);
  assert.equal((await api('PUT', '/api/empresas/1', { rendimiento_medio: 'x' })).status, 400);
  assert.equal((await api('PUT', '/api/empresas/999', { rendimiento_medio: 10 })).status, 404);
});

test('POST /api/proyeccion: el interés compuesto se ve año a año', async () => {
  const empresas = (await api('GET', '/api/empresas')).body;
  const depositos = empresas.map((e) => ({ empresa_id: e.id, importe: 200 }));
  const { status, body } = await api('POST', '/api/proyeccion', { anios: 3, depositos });

  assert.equal(status, 200);
  assert.equal(body.aportado ?? body.porAnio[0].aportado, 1000);
  assert.equal(body.porAnio.length, 4);

  const [a0, a1, a2, a3] = body.porAnio;
  assert.equal(a0.total, 1000);
  assert.equal(a1.reinvertidas, 0);
  assert.ok(a1.gananciaAnio > 0);
  assert.ok(a2.gananciaAnio > a1.gananciaAnio, 'la ganancia anual crece por el compuesto');
  assert.equal(a2.reinvertidas, a1.gananciaAnio, 'la ganancia del año 1 se reinvierte entera');
  assert.ok(a3.total > a2.total);
  assert.ok(body.resumen.extraPorCompuesto > 0, 'el compuesto supera al simple');
  assert.equal(body.porEmpresa.length, 5);
  let sumaEmpresas = 0;
  for (const p of body.porEmpresa) {
    assert.equal(p.aportado, 200);
    assert.ok(p.totalFinal > 200);
    sumaEmpresas = Math.round((sumaEmpresas + p.totalFinal) * 100) / 100;
  }
  assert.equal(sumaEmpresas, a3.total, 'los totales por empresa suman el total del gráfico');
});

test('POST /api/proyeccion valida la entrada', async () => {
  const valido = { anios: 5, depositos: [{ empresa_id: 1, importe: 100 }] };
  assert.equal((await api('POST', '/api/proyeccion', { ...valido, anios: 0 })).status, 400);
  assert.equal((await api('POST', '/api/proyeccion', { ...valido, anios: 51 })).status, 400);
  assert.equal(
    (await api('POST', '/api/proyeccion', { anios: 5, depositos: [{ empresa_id: 1, importe: -1 }] }))
      .status,
    400
  );
  assert.equal(
    (await api('POST', '/api/proyeccion', { anios: 5, depositos: [{ empresa_id: 999, importe: 10 }] }))
      .status,
    404
  );
  assert.equal((await api('POST', '/api/proyeccion', { anios: 5, depositos: [] })).status, 400);
  assert.equal((await api('POST', '/api/proyeccion', { anios: 5 })).status, 400);
});

test('carteras: crear, leer, actualizar y borrar', async () => {
  const empresas = (await api('GET', '/api/empresas')).body;
  const depositos = empresas.map((e, i) => ({ empresa_id: e.id, importe: 100 + i * 50 }));

  const creada = await api('POST', '/api/carteras', { nombre: 'Mi cartera', anios: 10, depositos });
  assert.equal(creada.status, 201);
  assert.equal(creada.body.depositos.length, 5);
  assert.equal(creada.body.nombre, 'Mi cartera');

  const lista = await api('GET', '/api/carteras');
  assert.ok(lista.body.some((c) => c.id === creada.body.id && c.nombre === 'Mi cartera'));

  const detalle = await api('GET', `/api/carteras/${creada.body.id}`);
  assert.equal(detalle.status, 200);
  assert.equal(detalle.body.depositos.reduce((s, d) => s + d.importe, 0), 100 + 150 + 200 + 250 + 300);

  const actualizada = await api('PUT', `/api/carteras/${creada.body.id}`, {
    nombre: 'Cartera editada',
    anios: 20,
    depositos: [{ empresa_id: 1, importe: 500 }]
  });
  assert.equal(actualizada.status, 200);
  assert.equal(actualizada.body.nombre, 'Cartera editada');
  assert.equal(actualizada.body.anios, 20);
  assert.equal(actualizada.body.depositos.length, 1);

  const borrada = await api('DELETE', `/api/carteras/${creada.body.id}`);
  assert.equal(borrada.status, 204);
  assert.equal((await api('GET', `/api/carteras/${creada.body.id}`)).status, 404);
});

test('carteras: validaciones y 404', async () => {
  assert.equal((await api('GET', '/api/carteras/99999')).status, 404);
  assert.equal((await api('DELETE', '/api/carteras/99999')).status, 404);
  assert.equal(
    (await api('POST', '/api/carteras', { nombre: '', anios: 10, depositos: [{ empresa_id: 1, importe: 1 }] }))
      .status,
    400
  );
  assert.equal(
    (await api('POST', '/api/carteras', { nombre: 'X', anios: 10, depositos: [{ empresa_id: 1, importe: -5 }] }))
      .status,
    400
  );
});

test('ruta API inexistente devuelve 404 JSON', async () => {
  const { status, body } = await api('GET', '/api/no-existe');
  assert.equal(status, 404);
  assert.ok(body.error.message);
});
