import { useEffect } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { formatoEur } from '../utils/format.js';

const COLORES = {
  aportado: '#3E5C54',
  reinvertidas: '#E0A100',
  gananciaAnio: '#2FA36B',
  totalSimple: '#B42318'
};

const NOMBRES = {
  aportado: 'Capital aportado',
  reinvertidas: 'Ganancias ya reinvertidas',
  gananciaAnio: 'Ganancia del año',
  totalSimple: 'Interés simple (sin reinvertir)'
};

const sinMovimiento =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function TooltipAno({ active, payload, label, onAnioActivo }) {
  useEffect(() => {
    if (active && payload?.length) {
      onAnioActivo(payload[0].payload.anio);
    } else if (!active) {
      onAnioActivo(null);
    }
  }, [active, payload, onAnioActivo]);

  if (!active || !payload?.length) return null;

  const d = payload[0].payload;
  return (
    <div className="tooltip-ano">
      <p className="tooltip-ano-titulo">Año {label}</p>
      <ul>
        {['aportado', 'reinvertidas', 'gananciaAnio'].map((clave) => (
          <li key={clave}>
            <span className="punto" style={{ background: COLORES[clave] }} />
            {NOMBRES[clave]}
            <strong>{formatoEur(d[clave])}</strong>
          </li>
        ))}
      </ul>
      <p className="tooltip-ano-total">
        Valor total <strong>{formatoEur(d.total)}</strong>
      </p>
      <p className="tooltip-ano-simple">
        Sin reinvertir: {formatoEur(d.totalSimple)}
        {d.total > d.totalSimple && (
          <em> (+{formatoEur(d.total - d.totalSimple)} por el compuesto)</em>
        )}
      </p>
    </div>
  );
}

export default function ProyeccionChart({ datos, onAnioHover }) {
  return (
    <div className="grafica">
      <ResponsiveContainer width="100%" height={440}>
        <ComposedChart data={datos.porAnio} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="#E3E7E4" vertical={false} />
          <XAxis
            dataKey="anio"
            tick={{ fill: '#5A6B64', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#C9D0CC' }}
            label={{ value: 'Años', position: 'insideBottomRight', offset: -2, fill: '#5A6B64' }}
          />
          <YAxis
            width={76}
            tick={{ fill: '#5A6B64', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v.toLocaleString('es-ES')} €`}
          />
          <Tooltip
            content={<TooltipAno onAnioActivo={onAnioHover} />}
            cursor={{ fill: 'rgba(20, 33, 28, 0.05)' }}
          />
          <Legend formatter={(valor) => NOMBRES[valor] ?? valor} iconType="square" />
          <Bar
            dataKey="aportado"
            stackId="capital"
            fill={COLORES.aportado}
            isAnimationActive={!sinMovimiento}
          />
          <Bar
            dataKey="reinvertidas"
            stackId="capital"
            fill={COLORES.reinvertidas}
            isAnimationActive={!sinMovimiento}
          />
          <Bar
            dataKey="gananciaAnio"
            stackId="capital"
            fill={COLORES.gananciaAnio}
            radius={[3, 3, 0, 0]}
            isAnimationActive={!sinMovimiento}
          />
          <Line
            type="linear"
            dataKey="totalSimple"
            stroke={COLORES.totalSimple}
            strokeWidth={2}
            strokeDasharray="7 5"
            dot={false}
            isAnimationActive={!sinMovimiento}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
