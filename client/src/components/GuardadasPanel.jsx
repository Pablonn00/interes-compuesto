import { useState } from 'react';
import { formatoEur } from '../utils/format.js';

export default function GuardadasPanel({ carteras, onGuardar, onCargar, onBorrar }) {
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const ejecutar = async (operacion, textoOk) => {
    setOcupado(true);
    setMensaje(null);
    try {
      await operacion();
      if (textoOk) setMensaje({ tipo: 'ok', texto: textoOk });
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message });
    } finally {
      setOcupado(false);
    }
  };

  const guardar = () => {
    const titulo = nombre.trim() || `Cartera del ${new Date().toLocaleDateString('es-ES')}`;
    return ejecutar(async () => {
      await onGuardar(titulo);
      setNombre('');
    }, `Cartera «${titulo}» guardada.`);
  };

  const cargar = (c) => ejecutar(() => onCargar(c.id), `Cartera «${c.nombre}» cargada.`);

  const borrar = (c) => {
    if (!window.confirm(`¿Borrar la cartera «${c.nombre}»?`)) return;
    return ejecutar(() => onBorrar(c.id), `Cartera «${c.nombre}» borrada.`);
  };

  return (
    <section className="panel" aria-label="Carteras guardadas">
      <h2 className="panel-titulo">Carteras guardadas</h2>

      <div className="campo">
        <label htmlFor="nombre-cartera">Nombre</label>
        <div className="campo-fila">
          <input
            id="nombre-cartera"
            type="text"
            maxLength={80}
            placeholder="Mi cartera"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') guardar();
            }}
          />
          <button
            type="button"
            className="boton"
            onClick={guardar}
            disabled={ocupado || carteras === undefined}
          >
            Guardar
          </button>
        </div>
      </div>

      {mensaje && (
        <p className={mensaje.tipo === 'ok' ? 'mensaje-ok' : 'mensaje-error'} role="status">
          {mensaje.texto}
        </p>
      )}

      {carteras.length === 0 ? (
        <p className="nota">
          Aún no has guardado ninguna cartera. Guarda la configuración actual para volver a ella
          cuando quieras.
        </p>
      ) : (
        <ul className="lista-carteras">
          {carteras.map((c) => (
            <li key={c.id}>
              <span className="lista-cartera-nombre">{c.nombre}</span>
              <span className="lista-cartera-meta">
                {formatoEur(c.total_aportado)} · {c.anios} años
              </span>
              <span className="lista-cartera-acciones">
                <button
                  type="button"
                  className="boton boton-secundario boton-pequeno"
                  onClick={() => cargar(c)}
                  disabled={ocupado}
                >
                  Cargar
                </button>
                <button
                  type="button"
                  className="boton boton-peligro boton-pequeno"
                  onClick={() => borrar(c)}
                  disabled={ocupado}
                >
                  Borrar
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
