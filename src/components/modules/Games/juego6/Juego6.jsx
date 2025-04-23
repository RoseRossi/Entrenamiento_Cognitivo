import React, { useState, useEffect, useCallback, useRef } from "react";
import { generarEnsayo, verificarRespuesta, calcularRetraso } from "./juego6_funciones";
import GameLayout from "../GameLayout";
import "./juego6_estilos.css";

// const niveles = {
//   basico: 6000,
//   intermedio: (ensayo) => Math.max(2000, 6000 - ensayo * 40),
//   avanzado: (ensayo) => Math.max(500, 3000 - ensayo * 25),
// };

const MAX_FALLOS_PERMITIDOS = 3; // Nuevo constante para el límite de fallos

const Juego6 = ({ nivel = "basico" }) => {
  const [ensayoActual, setEnsayoActual] = useState(0);
  const [estadoJuego, setEstadoJuego] = useState({
    puntuacion: 0,
    respuestasCorrectas: 0,
    respuestasIncorrectas: 0,
    juegoTerminado: false,
  });
  const [flecha, setFlecha] = useState(null);
  const [estimulo, setEstimulo] = useState(null);
  const [mostrarEstimulo, setMostrarEstimulo] = useState(false);
  const [puedeResponder, setPuedeResponder] = useState(false);
  const [mostrarFlecha, setMostrarFlecha] = useState(false);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(0);

  const formatearTiempo = useCallback((ms) => {
    if (isNaN(ms) || ms <= 0) return "0.0s";
    return `${(ms / 1000).toFixed(1)}s`;
  }, []);

  // Refs para manejar los timeouts y estado actual
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const puedeResponderRef = useRef(puedeResponder);
  const mostrarEstimuloRef = useRef(mostrarEstimulo);

  // Actualizar refs cuando cambia el estado
  useEffect(() => {
    puedeResponderRef.current = puedeResponder;
    mostrarEstimuloRef.current = mostrarEstimulo;
  }, [puedeResponder, mostrarEstimulo]);

  const limpiarTemporizadores = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  const terminarJuego = useCallback(() => {
    limpiarTemporizadores();
    setEstadoJuego(prev => ({ ...prev, juegoTerminado: true }));
  }, [limpiarTemporizadores]);

//   const avanzarAlSiguienteEnsayo = useCallback(() => {
//     setEnsayoActual((prev) => {
//       const nuevo = prev + 1;
//       if (nuevo >= 100 || estadoJuego.respuestasIncorrectas >= MAX_FALLOS_PERMITIDOS - 1) {
//         terminarJuego();
//       } else {
//         iniciarEnsayo();
//       }
//       return nuevo;
//     });
//   }, [estadoJuego.respuestasIncorrectas, terminarJuego, iniciarEnsayo]);

  const iniciarEnsayo = useCallback(() => {
    if (estadoJuego.juegoTerminado) return;
  
    limpiarTemporizadores();
  
    const { direccionFlecha, ubicacionEstimulo } = generarEnsayo();
    setFlecha(direccionFlecha);
    setEstimulo(ubicacionEstimulo);
    setMostrarEstimulo(false);
    setPuedeResponder(false);
    setMostrarFlecha(false);
    setRespuestaCorrecta(null);
  
    const tiempoVisible = nivel === "basico" ? 6000 : nivel === "intermedio" ? 4000 : 2000;
    setTiempoRestante(Number(tiempoVisible) || 0);
  
    timeoutRef.current = setTimeout(() => {
      setMostrarFlecha(true);
  
      timeoutRef.current = setTimeout(() => {
        setMostrarEstimulo(true);
        setPuedeResponder(true);
  
        timeoutRef.current = setTimeout(() => {
          if (puedeResponderRef.current) {
            setPuedeResponder(false);
            setMostrarEstimulo(false);
            setEstadoJuego((prev) => {
              const nuevoEstado = {
                ...prev,
                respuestasIncorrectas: prev.respuestasIncorrectas + 1,
              };
  
              if (nuevoEstado.respuestasIncorrectas >= MAX_FALLOS_PERMITIDOS) {
                return { ...nuevoEstado, juegoTerminado: true };
              }
              return nuevoEstado;
            });
          }
  
          // Avanzar al siguiente ensayo
          setEnsayoActual((prev) => {
            const nuevo = prev + 1;
            if (nuevo >= 100 || estadoJuego.respuestasIncorrectas >= MAX_FALLOS_PERMITIDOS) {
              setEstadoJuego((prev) => ({ ...prev, juegoTerminado: true }));
            } else {
              iniciarEnsayo(); // Llamar a iniciarEnsayo directamente
            }
            return nuevo;
          });
        }, tiempoVisible);
  
        intervalRef.current = setInterval(() => {
          setTiempoRestante((prev) => {
            const nuevoTiempo = Math.max(0, Number(prev) - 1000);
            if (nuevoTiempo <= 0) {
              clearInterval(intervalRef.current);
            }
            return nuevoTiempo;
          });
        }, 1000);
      }, 1000);
    }, calcularRetraso());
  }, [estadoJuego.juegoTerminado, nivel, limpiarTemporizadores]);
  
  const manejarRespuesta = useCallback((respuesta) => {
    if (!puedeResponderRef.current || !mostrarEstimuloRef.current) return;
  
    const esCorrecta = verificarRespuesta(respuesta, estimulo);
    setRespuestaCorrecta(esCorrecta ? estimulo : null);
  
    setEstadoJuego((prev) => {
      const nuevoEstado = {
        ...prev,
        puntuacion: prev.puntuacion + (esCorrecta ? 1 : 0),
        respuestasCorrectas: prev.respuestasCorrectas + (esCorrecta ? 1 : 0),
        respuestasIncorrectas: prev.respuestasIncorrectas + (esCorrecta ? 0 : 1),
      };
  
      if (nuevoEstado.respuestasIncorrectas >= MAX_FALLOS_PERMITIDOS) {
        return { ...nuevoEstado, juegoTerminado: true };
      }
      return nuevoEstado;
    });
  
    setPuedeResponder(false);
    setMostrarEstimulo(false);
  
    limpiarTemporizadores();
  
    if (estadoJuego.respuestasIncorrectas < MAX_FALLOS_PERMITIDOS - 1) {
      timeoutRef.current = setTimeout(() => iniciarEnsayo(), 1000);
    } else {
      terminarJuego();
    }
  }, [estimulo, limpiarTemporizadores, estadoJuego.respuestasIncorrectas, terminarJuego, iniciarEnsayo]);
  
  useEffect(() => {
    if (estadoJuego.respuestasIncorrectas >= MAX_FALLOS_PERMITIDOS) {
      terminarJuego();
      return;
    }
  
    iniciarEnsayo();
  
    const listener = (e) => {
      if (!puedeResponderRef.current) return;
      if (e.key === "ArrowLeft") manejarRespuesta("izquierda");
      if (e.key === "ArrowRight") manejarRespuesta("derecha");
    };
  
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
      limpiarTemporizadores();
    };
  }, [iniciarEnsayo, manejarRespuesta, limpiarTemporizadores, estadoJuego.respuestasIncorrectas, terminarJuego]);

  const reiniciarJuego = useCallback(() => {
    limpiarTemporizadores();
    setEnsayoActual(0);
    setEstadoJuego({ 
      puntuacion: 0, 
      respuestasCorrectas: 0, 
      respuestasIncorrectas: 0, 
      juegoTerminado: false 
    });
    iniciarEnsayo();
  }, [iniciarEnsayo, limpiarTemporizadores]);

  const Caja = React.memo(({ lado, mostrar, correcta, onClick }) => (
    <div
      className={`caja ${mostrar ? "estimulo" : ""} ${correcta ? "correcta" : ""}`}
      onClick={onClick}
    >
      {mostrar && "★"}
    </div>
  ));

  return (
    <GameLayout
      title="Señalización de Posner"
      description={
        <div>
          <p>Fija tu vista en el <b>+</b> central. Aparecerá una flecha (← o →) y luego una estrella (★).</p>
          <p>Responde indicando en qué lado aparece el estímulo. Usa clics o flechas del teclado.</p>
          {/* <p><strong>Límite de fallos:</strong> {MAX_FALLOS_PERMITIDOS}</p> */}
        </div>
      }
      stats={{ 
        ensayo: ensayoActual + 1, 
        puntuacion: estadoJuego.puntuacion, 
        fallos: estadoJuego.respuestasIncorrectas, 
        tiempo: formatearTiempo(tiempoRestante),
        maxFallos: MAX_FALLOS_PERMITIDOS
      }}
      gameOver={estadoJuego.juegoTerminado}
      finalStats={{ 
        completado: estadoJuego.respuestasIncorrectas < MAX_FALLOS_PERMITIDOS, 
        ensayos: ensayoActual + 1, 
        aciertos: estadoJuego.respuestasCorrectas, 
        errores: estadoJuego.respuestasIncorrectas, 
        puntuacionFinal: estadoJuego.puntuacion,
        motivoFin: estadoJuego.respuestasIncorrectas >= MAX_FALLOS_PERMITIDOS ? "Límite de fallos alcanzado" : "Juego completado"
      }}
      onRestart={reiniciarJuego}
    >
      {!estadoJuego.juegoTerminado && (
        <div className="juego6-container">
          <div className="cajas-container">
            <Caja
              lado="izquierda"
              mostrar={mostrarEstimulo && estimulo === "izquierda"}
              correcta={respuestaCorrecta === "izquierda"}
              onClick={() => manejarRespuesta("izquierda")}
            />
            <div className="punto-fijacion"><span>+</span></div>
            <Caja
              lado="derecha"
              mostrar={mostrarEstimulo && estimulo === "derecha"}
              correcta={respuestaCorrecta === "derecha"}
              onClick={() => manejarRespuesta("derecha")}
            />
          </div>
          <div className="indicador-flecha">
            {mostrarFlecha && flecha && (
              <span className={`flecha flecha-grande ${flecha}`}>
                {flecha === "izquierda" ? "←" : "→"}
              </span>
            )}
          </div>
          <div className="controles">
            <button onClick={() => manejarRespuesta("izquierda")} disabled={!puedeResponder}>Izquierda</button>
            <button onClick={() => manejarRespuesta("derecha")} disabled={!puedeResponder}>Derecha</button>
          </div>
          {/* <div className="contador-fallos">
            Fallos: {estadoJuego.respuestasIncorrectas}/{MAX_FALLOS_PERMITIDOS}
          </div> */}
        </div>
      )}
    </GameLayout>
  );
};

export default Juego6;