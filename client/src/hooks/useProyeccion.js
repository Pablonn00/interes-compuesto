import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

/**
 * Lanza la proyección en la API con debounce cuando cambian los depósitos,
 * los años o los rendimientos (tasasVersion).
 */
export function useProyeccion(anios, depositos, activo, tasasVersion) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [refresco, setRefresco] = useState(0);
  const peticion = useRef(0);

  const llave = JSON.stringify({ anios, depositos, tasasVersion, refresco });

  useEffect(() => {
    if (!activo) return undefined;
    const numeroPeticion = ++peticion.current;
    const temporizador = setTimeout(async () => {
      try {
        setCargando(true);
        setError(null);
        const resultado = await api.proyectar(anios, depositos);
        if (numeroPeticion === peticion.current) setDatos(resultado);
      } catch (e) {
        if (numeroPeticion === peticion.current) setError(e.message);
      } finally {
        if (numeroPeticion === peticion.current) setCargando(false);
      }
    }, 300);
    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [llave, activo]);

  return { datos, cargando, error, reintentar: () => setRefresco((x) => x + 1) };
}
