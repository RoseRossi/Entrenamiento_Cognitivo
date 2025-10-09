import { useState, useEffect, useCallback, useRef } from "react";
import GameLayout from "../GameLayout/GameLayout";
import { generarFormacion, verificarRespuesta, JUEGO1_CONFIG } from "./juego1_funciones";
import { auth } from "../../../services/firebase/firebaseConfig";
import { gameService } from "../../../services/firebase/gameService";
import { userService } from "../../../services/firebase/userService";
import "./juego1_estilos.css";

const Juego1 = () => {
  const [shapes, setShapes] = useState({});
  const [statement, setStatement] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [puntuacion, setPuntuacion] = useState(0);
  const [nivel, setNivel] = useState(JUEGO1_CONFIG.START_LEVEL);
  const [tiempo, setTiempo] = useState(JUEGO1_CONFIG.MAIN_TIMER_SECONDS);
  const [fallos, setFallos] = useState(0);
  const [fallosTotales, setFallosTotales] = useState(0);
  const [innerTiempo, setInnerTiempo] = useState(JUEGO1_CONFIG.INITIAL_INNER_TIMER);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [rondasCompletadas, setRondasCompletadas] = useState(0);
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [resultadoGuardado, setResultadoGuardado] = useState(false);
  const [juegoIniciado, setJuegoIniciado] = useState(false);

  const timerRef = useRef(null);
  const innerTimerRef = useRef(null);
  const handlingInnerExpiryRef = useRef(false);

  const startInnerTimer = (level) => {
    const initial = Math.max(
      JUEGO1_CONFIG.MIN_INNER_TIMER,
      JUEGO1_CONFIG.INITIAL_INNER_TIMER - (Math.max(JUEGO1_CONFIG.START_LEVEL, level) - JUEGO1_CONFIG.START_LEVEL)
    );
    setInnerTiempo(initial);

    handlingInnerExpiryRef.current = false;

    if (innerTimerRef.current) {
      clearInterval(innerTimerRef.current);
      innerTimerRef.current = null;
    }

    innerTimerRef.current = setInterval(() => {
      setInnerTiempo(prev => {
        if (prev <= 1) {
          if (handlingInnerExpiryRef.current) return 0;
          handlingInnerExpiryRef.current = true;

          if (innerTimerRef.current) {
            clearInterval(innerTimerRef.current);
            innerTimerRef.current = null;
          }

          setFallos(prevFallos => {
            const nuevosFallos = prevFallos + 1;
            setFallosTotales(prevTot => prevTot + 1);
            if (nuevosFallos >= JUEGO1_CONFIG.FAILS_TO_END) {
              setJuegoTerminado(true);
            } else {
              // Time ran out for this question: decrease level by 1 (min START_LEVEL)
              setNivel(prevNivel => {
                const decreased = Math.max(JUEGO1_CONFIG.START_LEVEL, prevNivel - 1);
                avanzarRonda(decreased);
                return decreased;
              });
            }
            return nuevosFallos;
          });

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopInnerTimer = () => {
    if (innerTimerRef.current) {
      clearInterval(innerTimerRef.current);
      innerTimerRef.current = null;
    }
    handlingInnerExpiryRef.current = false;
  };

  const guardarResultado = useCallback(async () => {
    if (!user) {
      console.log('No hay usuario autenticado para guardar resultado');
      return;
    }

    try {
      console.log('Guardando resultado del Juego 1...');

      const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000); // en segundos
      const porcentajeAciertos = rondasCompletadas > 0 ? Math.round((puntuacion / rondasCompletadas) * 100) : 0;

      let nivelJuego = 'basico';
      if (porcentajeAciertos >= 80 && tiempoTranscurrido <= 25) {
        nivelJuego = 'avanzado';
      } else if (porcentajeAciertos >= 60 && tiempoTranscurrido <= 28) {
        nivelJuego = 'intermedio';
      }

      const resultData = {
        userId: user.uid,
        gameId: 'razonamiento_gramatical',
        cognitiveDomain: 'lenguaje',
        level: nivelJuego,
        score: porcentajeAciertos, // Puntuación como porcentaje
        timeSpent: tiempoTranscurrido,
        correctAnswers: puntuacion,
        totalQuestions: rondasCompletadas,
        details: {
          fallos: fallos,
          fallosTotales: fallosTotales,
          tiempoLimite: 45,
          razonTermino: tiempo <= 0 ? 'tiempo_agotado' : (fallos >= JUEGO1_CONFIG.FAILS_TO_END ? 'demasiados_errores' : 'completado'),
          nivelMaximoAlcanzado: nivel,
          promedioTiempoPorRonda: rondasCompletadas > 0 ? Math.round(tiempoTranscurrido / rondasCompletadas * 100) / 100 : 0
        }
      };

      // Guardar resultado del juego
      await gameService.saveGameResult(resultData);

      // Actualizar progreso del usuario en el dominio cognitivo
      await userService.updateUserProgress(user.uid, 'lenguaje', porcentajeAciertos);

      console.log('Resultado del Juego 1 guardado exitosamente');
      setResultadoGuardado(true);

    } catch (error) {
      console.error('Error guardando resultado del Juego 1:', error);
    }
  }, [user, tiempoInicio, rondasCompletadas, puntuacion, fallos, tiempo, nivel, fallosTotales]);

  useEffect(() => {
    // Obtener usuario autenticado
    setUser(auth.currentUser);    // Cleanup on unmount: ensure timer is stopped
    return () => {
      stopTimer();
      // also clear inner timer if active
      if (innerTimerRef.current) {
        clearInterval(innerTimerRef.current);
        innerTimerRef.current = null;
      }
    };
  }, []);

  // Guardar resultado y detener todos los timers cuando el juego termine
  useEffect(() => {
    if (juegoTerminado) {
      stopTimer();
      stopInnerTimer();
      if (!resultadoGuardado && user && tiempoInicio) {
        guardarResultado();
      }
    }
  }, [juegoTerminado, resultadoGuardado, user, tiempoInicio, guardarResultado]);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // main game timer (45s)
    timerRef.current = setInterval(() => {
      setTiempo(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setJuegoTerminado(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const nuevaRonda = () => {
    const { nuevaFormacion, nuevaDeclaracion, declaracionEsVerdadera } = generarFormacion(nivel);
    setShapes(nuevaFormacion);
    setStatement(nuevaDeclaracion);
    // Store if the statement is true in the shapes state object
    setShapes(prev => ({ ...nuevaFormacion, declaracionEsVerdadera }));
    setIsCorrect(null);
    setRondasCompletadas(prev => prev + 1);
  };

  const avanzarRonda = (level) => {
    // advance round state and start inner timer for provided level
    nuevaRonda();
    startInnerTimer(level || nivel);
  };

  const manejarRespuesta = (respuestaUsuario) => {
    if (juegoTerminado) return;

    // stop inner timer when an answer arrives
    stopInnerTimer();

    const correcto = verificarRespuesta(shapes.declaracionEsVerdadera, respuestaUsuario);
    setIsCorrect(correcto);

    if (correcto) {
      const nuevoNivel = nivel + 1;
      setPuntuacion(prev => prev + 1);
      setNivel(nuevoNivel);
      setFallos(0);
      setTimeout(() => {
        avanzarRonda(nuevoNivel);
      }, 1000);
    } else {
      const nuevosFallos = fallos + 1;
      setFallos(nuevosFallos);
      setFallosTotales(prev => prev + 1);
      if (nuevosFallos >= JUEGO1_CONFIG.FAILS_TO_END) {
        setJuegoTerminado(true);
      }
    }

    if (!correcto) {
      setTimeout(() => {
        if (!juegoTerminado) { // Solo continuar si no se termina el juego
          avanzarRonda(nivel);
        }
      }, 1000);
    }
  };

  // --- Game Control ---
  const reiniciarJuego = () => {
    setShapes({});
    setStatement("");
    setIsCorrect(null);
    setPuntuacion(0);
    setNivel(JUEGO1_CONFIG.START_LEVEL);
    setTiempo(JUEGO1_CONFIG.MAIN_TIMER_SECONDS);
    setFallos(0);
    setJuegoTerminado(false);
    setRondasCompletadas(0);
    setResultadoGuardado(false);
    setFallosTotales(0);
    setTiempoInicio(Date.now());
    setJuegoIniciado(true);
    avanzarRonda(JUEGO1_CONFIG.START_LEVEL);
    startTimer();
  };

  // --- Analysis ---
  const generarAnalisis = () => {
    const porcentajeAciertos = rondasCompletadas > 0 ? Math.round((puntuacion / rondasCompletadas) * 100) : 0;
    if (juegoTerminado && tiempo <= 0) {
      return "Se te acabó el tiempo. Intenta responder más rápido manteniendo la precisión.";
    }
    if (fallos >= JUEGO1_CONFIG.FAILS_TO_END) {
      return "Has cometido demasiados errores seguidos. Analiza con más cuidado la posición de las formas antes de responder.";
    }
    if (porcentajeAciertos >= 90) {
      return "¡Excelente! Tu comprensión de las posiciones lógicas es muy precisa.";
    } else if (porcentajeAciertos >= 70) {
      return "Buen trabajo. Reconoces bien las posiciones pero podrías mejorar tu precisión.";
    } else if (porcentajeAciertos >= 50) {
      return "Desempeño regular. Presta más atención a la relación entre las formas.";
    } else {
      return "Necesitas practicar más. Enfócate en entender cómo se relacionan las formas entre sí.";
    }
  };

  // --- UI ---
  // Instrucciones del juego
  const InstruccionesJuego = () => (
    <div style={{ textAlign: 'center', fontSize: '18px', color: '#34495e' }}>
      <p><b>Instrucciones</b></p>
      <ul style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto', fontSize: 16 }}>
        <li>Observa la posición de las formas y responde si la afirmación es <b>verdadera</b> o <b>falsa</b>.</li>
        <li>El tiempo para cada pregunta disminuye a medida que subes de nivel.</li>
        <li>El juego termina si se acaba el tiempo total (<b>{JUEGO1_CONFIG.MAIN_TIMER_SECONDS}s</b>) o cometes <b>{JUEGO1_CONFIG.FAILS_TO_END}</b> errores seguidos.</li>
        <li>¡Intenta lograr la mayor precisión posible!</li>
      </ul>
    </div>
  );

  const iniciarJuego = () => {
    setJuegoIniciado(true);
    setTiempoInicio(Date.now());
    setTiempo(JUEGO1_CONFIG.MAIN_TIMER_SECONDS);
    avanzarRonda(JUEGO1_CONFIG.START_LEVEL);
    startTimer();
  };

  return (
    <GameLayout
      title="Juego de Formas Lógicas"
      showInstructions={!juegoIniciado}
      instructions={<InstruccionesJuego />}
      onStartGame={iniciarJuego}
      description={juegoIniciado ? "Determina si la afirmación sobre la posición de las formas es verdadera o falsa." : null}
      stats={{
        nivel,
        puntuacion,
        fallos,
        tiempo,
        innerTiempo
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: rondasCompletadas >= JUEGO1_CONFIG.ROUND_TO_COMPLETE,
        level: nivel,
        score: puntuacion,
        mistakes: fallosTotales,
        timeRemaining: tiempo
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
      onFallo={fallos}
      onCorrectAnswer={puntuacion}
    >
      {!juegoTerminado ? (
        <div className="game-container">
          <div className="shapes">
            <div className={`shape ${shapes.leftShape}`}></div>
            <div className={`shape ${shapes.rightShape}`}></div>
          </div>

          <p className="statement">{statement}</p>

          <div className="buttons">
            <button
              onClick={() => manejarRespuesta(true)}
              className={isCorrect === true ? 'correct' : ''}
            >
              Verdadero
            </button>
            <button
              onClick={() => manejarRespuesta(false)}
              className={isCorrect === false ? 'incorrect' : ''}
            >
              Falso
            </button>
          </div>

          {isCorrect !== null && (
            <p className={`feedback ${isCorrect ? "correct" : "incorrect"}`}>
              {isCorrect ? "¡Correcto!" : "Incorrecto"}
            </p>
          )}
        </div>
      ) : (
        // Mostrar estado de guardado cuando termine el juego
        <div className="game-container">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {resultadoGuardado ? (
              <p style={{ color: '#22c55e', fontWeight: 'bold' }}>
                Resultado guardado correctamente
              </p>
            ) : (
              <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                Guardando resultado...
              </p>
            )}
          </div>
        </div>
      )}
    </GameLayout>
  );
};

export default Juego1;