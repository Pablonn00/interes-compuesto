async function pedir(ruta, opciones = {}) {
  let res;
  try {
    res = await fetch(ruta, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones
    });
  } catch {
    throw new Error('No se puede conectar con el servidor. Inténtalo de nuevo en unos segundos.');
  }

  if (res.status === 204) return null;

  const datos = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(datos?.error?.message ?? `El servidor ha respondido con un error (${res.status}).`);
  }
  return datos;
}

export const api = {
  empresas: () => pedir('/api/empresas'),

  actualizarEmpresa: (id, rendimientoMedio) =>
    pedir(`/api/empresas/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ rendimiento_medio: rendimientoMedio })
    }),

  proyectar: (anios, depositos) =>
    pedir('/api/proyeccion', {
      method: 'POST',
      body: JSON.stringify({ anios, depositos })
    }),

  carteras: () => pedir('/api/carteras'),
  cartera: (id) => pedir(`/api/carteras/${id}`),

  guardarCartera: (datos) =>
    pedir('/api/carteras', { method: 'POST', body: JSON.stringify(datos) }),

  actualizarCartera: (id, datos) =>
    pedir(`/api/carteras/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),

  borrarCartera: (id) => pedir(`/api/carteras/${id}`, { method: 'DELETE' })
};
