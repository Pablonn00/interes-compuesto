import { useEffect, useMemo, useState } from 'react';
import { api } from './api/client';
import { useProyeccion } from './hooks/useProyeccion';
import CarteraForm from './components/CarteraForm.jsx';
import ProyeccionChart from './components/ProyeccionChart.jsx';
import ResumenPanel from './components/ResumenPanel.jsx';
import GuardadasPanel from './components/GuardadasPanel.jsx';
import EmpresasTabla from './components/EmpresasTabla.jsx';
import { round2 } from './utils/format.js';

const CAPITAL_DEFECTO = 1000;

export default function App() {
  const [empresas, setEmpresas] = useState([]);
  const [depositos, setDepositos] = useState({});
  const [capitalInicial, setCapitalInicial] = useState(CAPITAL_DEFECTO);
  const [anios, setAnios] = useState(10);
  const [carteras, setCarteras] = useState([]);
  const [tasasVersion, setTasasVersion] = useState(0);
  const [anioHover, setAnioHover] = useState(null);
  const [errorInicial, setErrorInicial] = useState(null);
  const [errorApi, setErrorApi] = useState(null);
  const [cargandoInicial, setCargandoInicial] = useState(true);

  const cargarTodo = async () => {
    setCargandoInicial(true);
    setErrorInicial(null);
    try {
      const [emp, cars] = await Promise.all([api.empresas(), api.carteras()]);
      setEmpresas(emp);
      const dep = {};
      const reparto = CAPITAL_DEFECTO / Math.max(emp.length, 1);
      emp.forEach((e) => {
        dep[e.id] = round2(reparto);
      });
      setDepositos(dep);
      setCarteras(cars);
    } catch (e) {
      setErrorInicial(e.message);
    } finally {
      setCargandoInicial(false);
    }
  };

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lista = useMemo(
    () => empresas.map((e) => ({ empresa_id: e.id, importe: Number(depositos[e.id]) || 0 })),
    [empresas, depositos]
  );
  const totalAportado = round2(lista.reduce((s, d) => s + d.importe, 0));

  const { datos, cargando, error, reintentar } = useProyeccion(
    anios,
    lista,
    empresas.length > 0,
    tasasVersion
  );

  const distribuir = () => {
    if (!empresas.length) return;
    const reparto = round2((Number(capitalInicial) || 0) / empresas.length);
    const dep = {};
    empresas.forEach((e) => {
      dep[e.id] = reparto;
    });
    setDepositos(dep);
  };

  const editarDeposito = (id, valor) => {
    setDepositos((prev) => ({ ...prev, [id]: valor }));
  };

  const guardarRendimiento = async (id, pct) => {
    const actualizada = await api.actualizarEmpresa(id, pct);
    setEmpresas((prev) => prev.map((e) => (e.id === id ? actualizada : e)));
    setTasasVersion((v) => v + 1);
  };

  const guardarCartera = async (nombre) => {
    await api.guardarCartera({ nombre, anios, depositos: lista });
    setCarteras(await api.carteras());
  };

  const cargarCartera = async (id) => {
    const c = await api.cartera(id);
    setAnios(c.anios);
    const dep = {};
    let total = 0;
    for (const d of c.depositos) {
      dep[d.empresa_id] = d.importe;
      total += d.importe;
    }
    empresas.forEach((e) => {
      if (dep[e.id] === undefined) dep[e.id] = 0;
    });
    setDepositos(dep);
    setCapitalInicial(round2(total));
  };

  const borrarCartera = async (id) => {
    await api.borrarCartera(id);
    setCarteras(await api.carteras());
  };

  const anioActivo = anioHover ?? (datos ? datos.anios : anios);

  return (
    <div className="pagina">
      <header className="cabecera">
        <div>
          <h1>Interés compuesto</h1>
          <p className="cabecera-sub">
            Simulación de cartera con Repsol, Inditex, Santander, Iberdrola y BBVA
          </p>
        </div>
        {datos && (
          <div className="cabecera-total">
            <span className="cabecera-total-etiqueta">Valor al año {datos.resumen.anios}</span>
            <span className="cabecera-total-valor">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                datos.resumen.valorTotal
              )}
            </span>
          </div>
        )}
      </header>

      {errorInicial && (
        <div className="aviso aviso-error" role="alert">
          <span>{errorInicial}</span>
          <button type="button" onClick={cargarTodo}>
            Reintentar
          </button>
        </div>
      )}

      {cargandoInicial && !errorInicial && (
        <div className="estado-carga">Cargando la aplicación…</div>
      )}

      {!errorInicial && (
        <>
          <main className="parrilla">
            <div className="columna columna-izquierda">
              <CarteraForm
                empresas={empresas}
                depositos={depositos}
                capitalInicial={capitalInicial}
                onCapitalInicial={setCapitalInicial}
                onDistribuir={distribuir}
                onDeposito={editarDeposito}
                anios={anios}
                onAnios={setAnios}
                totalAportado={totalAportado}
              />
              <GuardadasPanel
                carteras={carteras}
                onGuardar={guardarCartera}
                onCargar={cargarCartera}
                onBorrar={borrarCartera}
              />
            </div>

            <section className="panel panel-grafica" aria-label="Gráfica de la proyección">
              <div className="panel-cabecera">
                <h2>El capital crece año a año</h2>
                <p>
                  Cada barra es un año: lo aportado, las ganancias que ya estaban reinvertidas y
                  la ganancia nueva. La línea roja es lo que tendrías sin reinvertir.
                </p>
              </div>

              {error && (
                <div className="aviso aviso-error" role="alert">
                  <span>{error}</span>
                  <button type="button" onClick={reintentar}>
                    Reintentar
                  </button>
                </div>
              )}

              <div className={cargando && datos ? 'grafica-grisando' : undefined}>
                {datos ? (
                  <ProyeccionChart datos={datos} onAnioHover={setAnioHover} />
                ) : (
                  <div className="estado-carga">
                    {error ? 'Esperando al servidor para calcular…' : 'Calculando la proyección…'}
                  </div>
                )}
              </div>
            </section>

            <ResumenPanel datos={datos} anio={anioActivo} />
          </main>

          <section className="panel panel-tabla" aria-label="Rendimiento y resultado por empresa">
            <EmpresasTabla
              empresas={empresas}
              porEmpresa={datos?.porEmpresa ?? []}
              anios={anios}
              onRendimiento={guardarRendimiento}
            />
          </section>
        </>
      )}

      <footer className="pie">
        <p>
          Rendimientos medios ilustrativos y editables con fines educativos. No es asesoramiento
          financiero: los valores reales suben y bajan.
        </p>
      </footer>
    </div>
  );
}
