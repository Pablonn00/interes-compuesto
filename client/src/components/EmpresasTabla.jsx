import { useState } from 'react';
import { formatoEur, round2 } from '../utils/format.js';

export default function EmpresasTabla({ empresas, porEmpresa, anios, onRendimiento }) {
  const [nonce, setNonce] = useState(0);

  const guardar = async (id, valor) => {
    try {
      await onRendimiento(id, valor);
    } catch {
      setNonce((n) => n + 1);
      window.alert('No se pudo guardar el rendimiento. El servidor no está disponible.');
    }
  };

  if (!empresas.length) return null;

  return (
    <div>
      <div className="panel-cabecera">
        <h2>Rendimiento y resultado por empresa</h2>
        <p>
          El rendimiento medio es editable: cámbialo y la gráfica se recalcula. Valores al año{' '}
          {anios}.
        </p>
      </div>
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th scope="col">Empresa</th>
              <th scope="col">Rendimiento medio anual</th>
              <th scope="col">Aportado</th>
              <th scope="col">Valor en el año {anios}</th>
              <th scope="col">Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((e) => {
              const resultado = porEmpresa.find((p) => p.id === e.id);
              return (
                <tr key={`${e.id}-${e.rendimiento_medio}-${nonce}`}>
                  <td>
                    <span className="empresa-nombre">
                      <span className="punto" style={{ background: e.color }} />
                      {e.nombre}{' '}
                      <span className="empresa-ticker">{e.ticker}</span>
                    </span>
                  </td>
                  <td>
                    <span className="campo-porcentaje">
                      <input
                        type="number"
                        min="-99.9"
                        max="100"
                        step="0.5"
                        defaultValue={e.rendimiento_medio}
                        aria-label={`Rendimiento medio de ${e.nombre}`}
                        onBlur={(ev) => {
                          const v = Number(ev.target.value);
                          if (Number.isFinite(v) && v > -100 && v <= 100 && v !== e.rendimiento_medio) {
                            guardar(e.id, v);
                          } else if (v !== e.rendimiento_medio) {
                            setNonce((n) => n + 1);
                          }
                        }}
                      />
                      <span aria-hidden="true">%</span>
                    </span>
                  </td>
                  <td className="cifra">{resultado ? formatoEur(resultado.aportado) : '—'}</td>
                  <td className="cifra">
                    {resultado ? <strong>{formatoEur(resultado.totalFinal)}</strong> : '—'}
                  </td>
                  <td className="cifra cifra-ganancia">
                    {resultado ? `+${formatoEur(round2(resultado.ganancia))}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td></td>
              <td className="cifra">{formatoEur(porEmpresa.reduce((s, p) => s + p.aportado, 0))}</td>
              <td className="cifra">
                <strong>{formatoEur(porEmpresa.reduce((s, p) => s + p.totalFinal, 0))}</strong>
              </td>
              <td className="cifra cifra-ganancia">
                +{formatoEur(porEmpresa.reduce((s, p) => s + p.ganancia, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
