import React, { useState, useEffect, useCallback, useRef } from "react";
import { generarEnsayo, verificarRespuesta, calcularRetraso } from "./juego6_funciones";
import GameLayout from "../GameLayout";
import "./juego6_estilos.css";
import { useMemo } from "react";

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
  const [aciertosCongruentes, setAciertosCongruentes] = useState(0);
  const [aciertosIncongruentes, setAciertosIncongruentes] = useState(0);
  const ensayoActualRef = useRef(null); // para guardar el ensayo actual con su tipo
  const [tiemposReaccion, setTiemposReaccion] = useState([]); // Guarda tiempos de reacción
  const tiempoInicioRef = useRef(null); // Marca el tiempo en que se muestra el estímulo



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

  const ensayos = useMemo(() => {
    const total = 100;
    const cantidadCongruentes = Math.round(total * 0.6);
    const mezcla = Array.from({ length: total }, (_, i) => i < cantidadCongruentes);

    // Fisher-Yates Shuffle
    for (let i = mezcla.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mezcla[i], mezcla[j]] = [mezcla[j], mezcla[i]];
    }

    return mezcla;
  }, []);

  const calcularTiempoVisible = (indiceEnsayo) => {
    const bloque = Math.floor(indiceEnsayo / 20); // Cada bloque tiene 20 ensayos
    return 6000 - (bloque * 500); // Baja 500ms por bloque, mínimo 4000ms
  };


  const iniciarEnsayo = useCallback(() => {
    setEnsayoActual((prevEnsayoActual) => {
      if (estadoJuego.juegoTerminado || prevEnsayoActual >= ensayos.length) return prevEnsayoActual;

      limpiarTemporizadores();

      const tipoEnsayo = ensayos[prevEnsayoActual]; // true = congruente, false = incongruente
      const { direccionFlecha, ubicacionEstimulo, congruente } = generarEnsayo(tipoEnsayo);
      ensayoActualRef.current = { congruente }; // ← guardamos para usar luego
      setFlecha(direccionFlecha);
      setEstimulo(ubicacionEstimulo);
      setMostrarEstimulo(false);
      setPuedeResponder(false);
      setMostrarFlecha(false);
      setRespuestaCorrecta(null);

      const tiempoVisible = calcularTiempoVisible(prevEnsayoActual);
      setTiempoRestante(Number(tiempoVisible) || 0);

      timeoutRef.current = setTimeout(() => {
        setMostrarFlecha(true); // Reemplaza "+" por la flecha

        // Después de 1000ms, volvemos a mostrar "+"
        timeoutRef.current = setTimeout(() => {
          setMostrarFlecha(false); // Vuelve el símbolo "+"

          // 100ms después, se muestra el estímulo y se activa la respuesta
          timeoutRef.current = setTimeout(() => {
            tiempoInicioRef.current = Date.now(); // Guarda el momento exacto en que aparece el estímulo
            setMostrarEstimulo(true);
            setPuedeResponder(true);

            // Timeout para respuesta
            timeoutRef.current = setTimeout(() => {
              if (puedeResponderRef.current) {
                setPuedeResponder(false);
                setMostrarEstimulo(false);
                limpiarTemporizadores();
                setEstadoJuego((prev) => {
                  const nuevoEstado = {
                    ...prev,
                    respuestasIncorrectas: prev.respuestasIncorrectas + 1,
                  };
                  if (nuevoEstado.respuestasIncorrectas >= MAX_FALLOS_PERMITIDOS) {
                    terminarJuego();
                  } else {
                    // Espera breve y luego incrementa el contador de ensayo
                    setTimeout(() => {
                      setEnsayoActual((prev) => prev + 1);
                    }, 500);
                  }
                  return nuevoEstado;
                });
              }

            }, tiempoVisible);

            // Inicia conteo regresivo
            intervalRef.current = setInterval(() => {
              setTiempoRestante((prev) => {
                const nuevoTiempo = Math.max(0, Number(prev) - 1000);
                if (nuevoTiempo <= 0) clearInterval(intervalRef.current);
                return nuevoTiempo;
              });
            }, 1000);
          }, 100); // <-- Esperar 100ms más para mostrar estímulo
        }, 1000); // <-- Flecha se muestra por 1000ms

      }, calcularRetraso());

      return prevEnsayoActual;
    });
  }, [
    estadoJuego.juegoTerminado,
    ensayos,
    nivel,
    limpiarTemporizadores,
    terminarJuego,
  ]);


  const manejarRespuesta = useCallback((respuesta) => {
    
    if (tiempoInicioRef.current !== null) {
      const tiempoReaccion = Date.now() - tiempoInicioRef.current;
      setTiemposReaccion(prev => [...prev, tiempoReaccion]);
    }
    if (!puedeResponderRef.current || !mostrarEstimuloRef.current) return;

    const esCorrecta = verificarRespuesta(respuesta, estimulo);
    setRespuestaCorrecta(esCorrecta ? estimulo : null);

    // Contador separado por tipo de ensayo (congruente/incongruente)
    if (ensayoActualRef.current) {
      const { congruente } = ensayoActualRef.current;
      if (esCorrecta) {
        if (congruente) {
          setAciertosCongruentes((prev) => prev + 1);
        } else {
          setAciertosIncongruentes((prev) => prev + 1);
        }
      }
    }

    // Actualización del estado principal del juego
    setEstadoJuego((prev) => {
      const nuevoEstado = {
        ...prev,
        puntuacion: prev.puntuacion + (esCorrecta ? 1 : 0),
        respuestasCorrectas: prev.respuestasCorrectas + (esCorrecta ? 1 : 0),
        respuestasIncorrectas: prev.respuestasIncorrectas + (esCorrecta ? 0 : 1),
      };

      if (nuevoEstado.respuestasIncorrectas >= MAX_FALLOS_PERMITIDOS) {
        terminarJuego();
      }
      return nuevoEstado;
    });

    // Limpiar estado visual y lógica para siguiente ensayo
    setPuedeResponder(false);
    setMostrarEstimulo(false);
    limpiarTemporizadores();

    // Esperar para iniciar otro ensayo, o terminar juego
    setEnsayoActual((prev) => {
      const nuevo = prev + 1;
      if (nuevo >= 100) {
        terminarJuego();
      } else if (estadoJuego.respuestasIncorrectas + (esCorrecta ? 0 : 1) < MAX_FALLOS_PERMITIDOS) {
        timeoutRef.current = setTimeout(() => iniciarEnsayo(), 1000);
      }
      return nuevo;
    });
  }, [
    estimulo,
    limpiarTemporizadores,
    terminarJuego,
    iniciarEnsayo,
    estadoJuego.respuestasIncorrectas,
  ]);

  useEffect(() => {
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
  }, [iniciarEnsayo, manejarRespuesta, limpiarTemporizadores]);

  const reiniciarJuego = useCallback(() => {
    limpiarTemporizadores();
    setEnsayoActual(0);
    setEstadoJuego({
      puntuacion: 0,
      respuestasCorrectas: 0,
      respuestasIncorrectas: 0,
      juegoTerminado: false
    });
    setAciertosCongruentes(0);
    setAciertosIncongruentes(0);
    setTimeout(() => iniciarEnsayo(), 100); // Espera breve para asegurar el reset
  }, [iniciarEnsayo, limpiarTemporizadores]);

  const Caja = React.memo(({ lado, mostrar, correcta, onClick }) => (
    <div
      className={`caja ${mostrar ? "estimulo" : ""} ${correcta ? "correcta" : ""}`}
      onClick={onClick}
    >
      {mostrar && "★"}
    </div>
  ));

  useEffect(() => {
    if (estadoJuego.juegoTerminado) {
      console.log("Tiempos de reacción (ms):", tiemposReaccion);
    }
  }, [estadoJuego.juegoTerminado, tiemposReaccion]); 


  return (
    <GameLayout
      title="Señalización de Posner"
      description={
        <div>
          <p>Fija tu vista en el <b>+</b> central. Aparecerá una flecha (← o →) y luego una estrella (★).</p>
          <p>Responde indicando en qué lado aparece el estímulo. Usa clics o flechas del teclado.</p>
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
      analysis={
        <div>
          <p>Has completado el juego. Aquí tienes un resumen de tu desempeño:</p>
          <ul>
            <li>
              <strong>Aciertos cuando la señal coincidía con la ubicación (congruentes):</strong> {aciertosCongruentes}
            </li>
            <li>
              <strong>Aciertos cuando la señal no coincidía (incongruentes):</strong> {aciertosIncongruentes}
            </li>
          </ul>
          {aciertosCongruentes > aciertosIncongruentes ? (
            <p>
              Tu atención visual parece responder mejor cuando las señales anticipan correctamente la ubicación del estímulo, lo cual es típico según estudios de atención encubierta. Esto indica que tu sistema atencional se beneficia de las señales válidas.
            </p>
          ) : aciertosIncongruentes > aciertosCongruentes ? (
            <p>
              Curiosamente, obtuviste más aciertos en los ensayos con señales incorrectas. Esto podría indicar una atención más flexible o menos dependiente de señales externas, lo cual también puede ser una fortaleza en situaciones impredecibles.
            </p>
          ) : (
            <p>
              Tu desempeño fue equilibrado entre ensayos con señales correctas e incorrectas. Esto sugiere que tu atención visual no depende fuertemente de las señales, y puede adaptarse con flexibilidad.
            </p>
          )}
        </div>
      }
      onFallo={estadoJuego.respuestasIncorrectas}
      onCorrectAnswer={estadoJuego.puntuacion}
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
            <div className="punto-fijacion">
              <span>{mostrarFlecha && flecha ? (flecha === "izquierda" ? "←" : "→") : "+"}</span>
            </div>
            <Caja
              lado="derecha"
              mostrar={mostrarEstimulo && estimulo === "derecha"}
              correcta={respuestaCorrecta === "derecha"}
              onClick={() => manejarRespuesta("derecha")}
            />
          </div>
          <div className="controles">
            <button onClick={() => manejarRespuesta("izquierda")} disabled={!puedeResponder}>Izquierda</button>
            <button onClick={() => manejarRespuesta("derecha")} disabled={!puedeResponder}>Derecha</button>
          </div>
        </div>
      )}
    </GameLayout>
  );
};

export default Juego6;