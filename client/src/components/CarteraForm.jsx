import { formatoEur, round2 } from '../utils/format.js';

export default function CarteraForm({
  empresas,
  depositos,
  capitalInicial,
  onCapitalInicial,
  onDistribuir,
  onDeposito,
  anios,
  onAnios,
  totalAportado
}) {
  return (
    <section className="panel" aria-label="Ajustes de la cartera">
      <div className="campo">
        <label htmlFor="capital-inicial">Capital inicial</label>
        <div className="campo-fila">
          <input
            id="capital-inicial"
            type="number"
            min="0"
            step="10"
            value={capitalInicial}
            onChange={(e) => onCapitalInicial(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <button type="button" className="boton boton-secundario" onClick={onDistribuir}>
            Repartir
          </button>
        </div>
        <p className="nota">
          «Repartir» divide ese capital en partes iguales entre las cinco empresas.
        </p>
      </div>

      <fieldset className="campo">
        <legend>Depósito por empresa</legend>
        <div className="depositos">
          {empresas.map((e) => (
            <div className="deposito-fila" key={e.id}>
              <span className="punto" style={{ background: e.color }} aria-hidden="true" />
              <label htmlFor={`dep-${e.id}`}>{e.nombre}</label>
              <input
                id={`dep-${e.id}`}
                type="number"
                min="0"
                step="10"
                value={depositos[e.id] ?? 0}
                onChange={(ev) =>
                  onDeposito(
                    e.id,
                    ev.target.value === '' ? 0 : Math.max(0, Number(ev.target.value))
                  )
                }
              />
            </div>
          ))}
        </div>
        <p className="nota">
          Total aportado:{' '}
          <strong className="cifra">{formatoEur(round2(totalAportado))}</strong>
        </p>
      </fieldset>

      <div className="campo">
        <label htmlFor="anios">Años de inversión: {anios}</label>
        <input
          id="anios"
          className="deslizador"
          type="range"
          min="1"
          max="50"
          value={anios}
          onChange={(e) => onAnios(Number(e.target.value))}
        />
        <div className="deslizador-limites" aria-hidden="true">
          <span>1</span>
          <span>50</span>
        </div>
      </div>
    </section>
  );
}
