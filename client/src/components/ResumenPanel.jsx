import { formatoEur, round2 } from '../utils/format.js';

export default function ResumenPanel({ datos, anio }) {
  if (!datos) {
    return (
      <aside className="panel panel-resumen" aria-label="Resumen del año seleccionado">
        <p className="estado-carga">Esperando el cálculo…</p>
      </aside>
    );
  }

  const actual = datos.porAnio[anio] ?? datos.porAnio[datos.porAnio.length - 1];
  const anterior = actual.anio > 0 ? datos.porAnio[actual.anio - 1] : null;
  const delta = anterior ? round2(actual.gananciaAnio - anterior.gananciaAnio) : 0;
  const ganado = round2(actual.total - actual.aportado);
  const proporcionGanado = actual.total > 0 ? (ganado / actual.total) * 100 : 0;
  const extra = round2(actual.total - actual.totalSimple);

  let narrativa;
  if (actual.anio === 0) {
    narrativa = `Año 0: solo has aportado ${formatoEur(actual.aportado)}. Todavía no has ganado nada; a partir de ahora ese dinero trabaja cada año.`;
  } else if (actual.anio === 1) {
    narrativa = `En el año 1 ganaste ${formatoEur(actual.gananciaAnio)} con tu dinero inicial. Esas ganancias todavía no generan nada por sí mismas: se reinvierten y empiezan a trabajar en el año 2.`;
  } else {
    narrativa =
      `En el año ${actual.anio} ganaste ${formatoEur(actual.gananciaAnio)}` +
      (delta > 0 ? `, ${formatoEur(delta)} más que en el año ${actual.anio - 1}` : '') +
      `. Las ${formatoEur(actual.reinvertidas)} que ya tenías ganadas de años anteriores también están generando rendimiento: por eso cada año se gana más.`;
  }

  return (
    <aside className="panel panel-resumen" aria-label="Resumen del año seleccionado">
      <p className="resumen-eyebrow">Año {actual.anio} de {datos.anios}</p>

      <p className="resumen-valor">{formatoEur(actual.total)}</p>
      <div className="resumen-proporcion" aria-hidden="true">
        <span
          className="resumen-proporcion-ganado"
          style={{ width: `${proporcionGanado}%` }}
          title="Ganado"
        />
      </div>
      <p className="resumen-desglose">
        <span>
          <i className="punto" style={{ background: '#3E5C54' }} /> Aportado{' '}
          {formatoEur(actual.aportado)}
        </span>
        <span>
          <i className="punto" style={{ background: '#2FA36B' }} /> Ganado {formatoEur(ganado)}
        </span>
      </p>

      <div className="resumen-dato">
        <span className="resumen-dato-etiqueta">Ganancia de este año</span>
        <strong className="resumen-dato-valor">{formatoEur(actual.gananciaAnio)}</strong>
        {actual.anio >= 2 && delta !== 0 && (
          <span className="resumen-dato-nota">
            {delta > 0 ? '+' : ''}
            {formatoEur(delta)} frente al año anterior
          </span>
        )}
      </div>

      <div className="resumen-dato">
        <span className="resumen-dato-etiqueta">Con interés simple solo tendrías</span>
        <strong className="resumen-dato-valor resumen-dato-valor-suave">
          {formatoEur(actual.totalSimple)}
        </strong>
        <span className="resumen-dato-nota">
          {extra > 0
            ? `El compuesto te ha dado ${formatoEur(extra)} de más`
            : 'El interés compuesto empieza a notarse en el año 2'}
        </span>
      </div>

      <p className="resumen-relato">{narrativa}</p>

      {extra > 0 && (
        <p className="resumen-estrella">
          <span className="resumen-estrella-cifra">+{formatoEur(extra)}</span>
          <span className="resumen-estrella-texto">
            gracias a reinvertir las ganancias de los años anteriores
          </span>
        </p>
      )}
    </aside>
  );
}
