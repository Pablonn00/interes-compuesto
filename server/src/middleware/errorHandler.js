export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message } });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'El cuerpo de la petición no es JSON válido' } });
  }
  console.error(err);
  return res.status(500).json({ error: { message: 'Error interno del servidor' } });
}
