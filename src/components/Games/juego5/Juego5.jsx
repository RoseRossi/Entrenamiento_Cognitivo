import { useEffect, useState, useCallback, useRef } from "react";
import GameLayout from "../GameLayout/GameLayout";
import { auth } from "../../../services/firebase/firebaseConfig";
import { gameService } from "../../../services/firebase/gameService";
import { userService } from "../../../services/firebase/userService";
import { generarSecuencia, generarPreguntas, JUEGO5_CONFIG } from "./juego5_funciones";
import "./juego5_estilos.css";

const Juego5 = () => {
  const [nivelActual, setNivelActual] = useState(JUEGO5_CONFIG.START_LEVEL);
  const [secuencia, setSecuencia] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [mostrarPregunta, setMostrarPregunta] = useState(false);
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [tiempo, setTiempo] = useState(60);
  const [fallos, setFallos] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [tiempoRespuesta, setTiempoRespuesta] = useState(JUEGO5_CONFIG.RESPONSE_TIME_LIMIT);

  // Estados para Firebase
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [resultadoGuardado, setResultadoGuardado] = useState(false);
  const [tiempoMemorizacion, setTiempoMemorizacion] = useState(null);
  const [respuestasDetalladas, setRespuestasDetalladas] = useState([]);
  const [tiempoPreguntaActual, setTiempoPreguntaActual] = useState(null);

  const [juegoIniciado, setJuegoIniciado] = useState(false);

  // Referencias para temporizadores
  const mainTimerRef = useRef(null);
  const responseTimerRef = useRef(null);
  const questionStartTimeRef = useRef(null);
  const timeoutHandledRef = useRef(false);

  // Función auxiliar para obtener configuración del nivel
  const getNivelConfig = useCallback(() => {
    const levels = ['BASICO', 'INTERMEDIO', 'AVANZADO'];
    return JUEGO5_CONFIG.LEVELS[levels[nivelActual - 1]] || JUEGO5_CONFIG.LEVELS.BASICO;
  }, [nivelActual]);

  // Guardar resultado usando useCallback
  const guardarResultado = useCallback(async () => {
    if (!user) {
      console.log('No hay usuario autenticado para guardar resultado');
      return;
    }

    try {
      console.log('Guardando resultado del Juego 5...');

      const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000);
      const levelConfig = getNivelConfig();
      const totalPreguntas = levelConfig.testFigureCount;
      const preguntasRespondidas = respuestas.length;
      const respuestasCorrectas = puntuacion;

      // Calcular métricas específicas de memoria de reconocimiento
      const porcentajePrecision = preguntasRespondidas > 0 ? Math.round((respuestasCorrectas / preguntasRespondidas) * 100) : 0;
      const porcentajeCompletado = Math.round((preguntasRespondidas / totalPreguntas) * 100);

      // Separar respuestas por tipo (hits, misses, false alarms, correct rejections)
      const hits = respuestasDetalladas.filter(r => r.formaEnSecuencia && r.respuestaUsuario === "sí").length;
      const misses = respuestasDetalladas.filter(r => r.formaEnSecuencia && r.respuestaUsuario === "no").length;
      const falseAlarms = respuestasDetalladas.filter(r => !r.formaEnSecuencia && r.respuestaUsuario === "sí").length;
      const correctRejections = respuestasDetalladas.filter(r => !r.formaEnSecuencia && r.respuestaUsuario === "no").length;
      const respuestasAutomaticas = respuestasDetalladas.filter(r => r.esAutomatica).length;

      // Calcular tiempos de respuesta
      const tiemposRespuesta = respuestasDetalladas.map(r => r.tiempoRespuesta);
      const tiempoPromedioRespuesta = tiemposRespuesta.length > 0 ?
        Math.round((tiemposRespuesta.reduce((a, b) => a + b, 0) / tiemposRespuesta.length)) : 0;

      // Calcular sensibilidad (d') y criterio de respuesta
      const hitRate = hits / (hits + misses || 1);
      const falseAlarmRate = falseAlarms / (falseAlarms + correctRejections || 1);

      // Determinar nivel basado en rendimiento y nivel alcanzado
      let nivelJuego = 'basico';
      if (nivelActual >= 3 && porcentajePrecision >= 80) {
        nivelJuego = 'avanzado';
      } else if (nivelActual >= 2 && porcentajePrecision >= 70) {
        nivelJuego = 'intermedio';
      }

      // Score final basado en precisión, nivel alcanzado y completitud
      const scoreFinal = Math.round((porcentajePrecision * 0.6) + (nivelActual * 10) + (porcentajeCompletado * 0.2));

      const resultData = {
        userId: user.uid,
        gameId: 'reconociendo_objetos',
        cognitiveDomain: 'atencion',
        level: nivelJuego,
        score: scoreFinal,
        timeSpent: tiempoTranscurrido,
        correctAnswers: respuestasCorrectas,
        totalQuestions: preguntasRespondidas,
        details: {
          nivelMaximoAlcanzado: nivelActual,
          totalPreguntasPosibles: totalPreguntas,
          porcentajeCompletado: porcentajeCompletado,
          porcentajePrecision: porcentajePrecision,
          fallosTotales: fallos,
          respuestasAutomaticas: respuestasAutomaticas,
          tiempoMemorizacion: tiempoMemorizacion,
          tiempoTesteo: tiempoTranscurrido - (tiempoMemorizacion || 0),
          razonTermino: tiempo <= 0 ? 'tiempo_agotado' :
            (fallos >= 3 ? 'tres_fallos_consecutivos' :
              (preguntasRespondidas === totalPreguntas ? 'completado' : 'usuario_salio')),
          // Métricas de teoría de detección de señales
          hits: hits,
          misses: misses,
          falseAlarms: falseAlarms,
          correctRejections: correctRejections,
          hitRate: Math.round(hitRate * 100) / 100,
          falseAlarmRate: Math.round(falseAlarmRate * 100) / 100,
          // Datos específicos del juego
          secuenciaOriginal: secuencia,
          preguntasGeneradas: preguntas,
          respuestasDetalladas: respuestasDetalladas,
          tiempoPromedioRespuesta: tiempoPromedioRespuesta,
          tiemposRespuesta: tiemposRespuesta
        }
      };

      // Guardar resultado del juego
      await gameService.saveGameResult(resultData);

      // Actualizar progreso del usuario en el dominio cognitivo
      await userService.updateUserProgress(user.uid, 'atencion', scoreFinal);

      console.log('Resultado del Juego 5 guardado exitosamente');
      setResultadoGuardado(true);

    } catch (error) {
      console.error('Error guardando resultado del Juego 5:', error);
    }
  }, [user, tiempoInicio, respuestas, puntuacion, fallos, tiempo, secuencia, preguntas, respuestasDetalladas, tiempoMemorizacion]);

  // Inicialización
  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  // Inicializar el tiempo de juego cuando el juego realmente comienza
  useEffect(() => {
    if (juegoIniciado && !tiempoInicio) {
      setTiempoInicio(Date.now());
    }
  }, [juegoIniciado, tiempoInicio]);

  // Guardar resultado cuando el juego termine
  useEffect(() => {
    if (juegoTerminado && !resultadoGuardado && user && tiempoInicio) {
      guardarResultado();
    }
  }, [juegoTerminado, resultadoGuardado, user, tiempoInicio, guardarResultado]);

  useEffect(() => {
    if (!juegoIniciado) return; // Solo generar secuencia cuando el juego inicia

    const levelConfig = getNivelConfig();
    const levels = ['BASICO', 'INTERMEDIO', 'AVANZADO'];
    const levelKey = levels[nivelActual - 1];
    const nuevaSecuencia = generarSecuencia(levelKey);
    setSecuencia(nuevaSecuencia);
  }, [nivelActual, getNivelConfig, juegoIniciado]);

  useEffect(() => {
    let timer;
    if (juegoIniciado && !mostrarPregunta && secuencia.length > 0) { // Solo si el juego ha iniciado
      const levelConfig = getNivelConfig();
      timer = setTimeout(() => {
        if (indiceActual < levelConfig.figureCount) {
          setIndiceActual((prev) => prev + 1);
        } else {
          // Marcar tiempo cuando termina la memorización
          setTiempoMemorizacion(Math.round((Date.now() - tiempoInicio) / 1000));
          setMostrarPregunta(true);
          const levels = ['BASICO', 'INTERMEDIO', 'AVANZADO'];
          const levelKey = levels[nivelActual - 1];
          setPreguntas(generarPreguntas(secuencia, levelKey));
        }
      }, levelConfig.displayTime);
    }
    return () => clearTimeout(timer);
  }, [indiceActual, mostrarPregunta, secuencia, tiempoInicio, nivelActual, getNivelConfig]);

  // Temporizador principal del juego - solo inicia cuando comienza la fase de prueba (no durante memorización)
  useEffect(() => {
    if (!juegoIniciado || !mostrarPregunta) return;

    // Limpiar temporizador existente
    if (mainTimerRef.current) {
      clearInterval(mainTimerRef.current);
    }

    mainTimerRef.current = setInterval(() => {
      setTiempo((prev) => {
        if (prev <= 1) {
          clearInterval(mainTimerRef.current);
          mainTimerRef.current = null;
          setJuegoTerminado(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (mainTimerRef.current) {
        clearInterval(mainTimerRef.current);
        mainTimerRef.current = null;
      }
    };
  }, [juegoIniciado, mostrarPregunta]);

  // Limpieza al desmontar componente
  useEffect(() => {
    return () => {
      if (mainTimerRef.current) {
        clearInterval(mainTimerRef.current);
      }
      if (responseTimerRef.current) {
        clearInterval(responseTimerRef.current);
      }
    };
  }, []);

  // Detener todos los temporizadores cuando el juego termina
  useEffect(() => {
    if (juegoTerminado) {
      if (mainTimerRef.current) {
        clearInterval(mainTimerRef.current);
        mainTimerRef.current = null;
      }
      if (responseTimerRef.current) {
        clearInterval(responseTimerRef.current);
        responseTimerRef.current = null;
      }
    }
  }, [juegoTerminado]);

  // Temporizador para cada respuesta de pregunta
  useEffect(() => {
    if (mostrarPregunta && !juegoTerminado && preguntas.length > respuestas.length) {
      // Reiniciar temporizador para nueva pregunta
      setTiempoRespuesta(JUEGO5_CONFIG.RESPONSE_TIME_LIMIT);
      questionStartTimeRef.current = Date.now();
      timeoutHandledRef.current = false; // Reiniciar bandera de timeout para nueva pregunta

      // Limpiar cualquier temporizador existente
      if (responseTimerRef.current) {
        clearInterval(responseTimerRef.current);
      }

      // Iniciar temporizador de cuenta regresiva
      responseTimerRef.current = setInterval(() => {
        setTiempoRespuesta((prev) => {
          if (prev <= 1) {
            clearInterval(responseTimerRef.current);
            // Tiempo agotado - contar como fallo y pasar a siguiente pregunta
            if (!timeoutHandledRef.current) {
              timeoutHandledRef.current = true;
              manejarTiempoAgotado();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (responseTimerRef.current) {
          clearInterval(responseTimerRef.current);
        }
      };
    }
  }, [mostrarPregunta, juegoTerminado, preguntas.length, respuestas.length]);

  const manejarTiempoAgotado = () => {
    if (preguntas.length > respuestas.length && !juegoTerminado) {
      const pregunta = preguntas[respuestas.length];

      // Calcular cuál hubiera sido la respuesta correcta
      const aparece = secuencia.includes(pregunta);

      // Registrar como timeout (no se dio respuesta)
      const respuestaDetallada = {
        preguntaNumero: respuestas.length + 1,
        forma: pregunta,
        formaEnSecuencia: aparece,
        respuestaUsuario: "timeout",
        correcta: false, // Siempre incorrecta ya que no se dio respuesta
        tiempoRespuesta: JUEGO5_CONFIG.RESPONSE_TIME_LIMIT * 1000, // Tiempo máximo
        tiempoRestante: tiempo,
        esAutomatica: true,
        nivelActual: nivelActual
      };

      setRespuestasDetalladas(prev => [...prev, respuestaDetallada]);
      setRespuestas(prev => [...prev, { pregunta, respuesta: "timeout" }]);

      // Contar como fallo
      setFallos((prev) => {
        const nuevosFallos = prev + 1;
        if (nuevosFallos >= 3) setJuegoTerminado(true);
        return nuevosFallos;
      });

      // Verificar si la ronda/juego está completo
      const levelConfig = getNivelConfig();
      if (respuestas.length + 1 === levelConfig.testFigureCount) {
        setJuegoTerminado(true);
        calcularResultado([...respuestas, { pregunta, respuesta: "timeout" }]);
      }
    }
  };

  const responder = (pregunta, respuesta) => {
    if (juegoTerminado) return;

    // Limpiar el temporizador de respuesta y la bandera de timeout
    if (responseTimerRef.current) {
      clearInterval(responseTimerRef.current);
      responseTimerRef.current = null;
    }
    timeoutHandledRef.current = true; // Prevenir que timeout se dispare después de respuesta manual

    const nuevaRespuestas = [...respuestas, { pregunta, respuesta }];
    setRespuestas(nuevaRespuestas);

    const aparece = secuencia.includes(pregunta);
    const esCorrecta = (aparece && respuesta === "sí") || (!aparece && respuesta === "no");

    // Calcular tiempo de respuesta
    const tiempoRespuestaMs = questionStartTimeRef.current ? Date.now() - questionStartTimeRef.current : 0;

    // Registrar respuesta detallada
    const respuestaDetallada = {
      preguntaNumero: respuestas.length + 1,
      forma: pregunta,
      formaEnSecuencia: aparece,
      respuestaUsuario: respuesta,
      correcta: esCorrecta,
      tiempoRespuesta: tiempoRespuestaMs,
      tiempoRestante: tiempo,
      esAutomatica: false,
      nivelActual: nivelActual
    };
    setRespuestasDetalladas(prev => [...prev, respuestaDetallada]);

    let nuevoPuntuacion = puntuacion;
    if (esCorrecta) {
      nuevoPuntuacion = puntuacion + 1;
      setPuntuacion(nuevoPuntuacion);
    } else {
      setFallos((prev) => {
        const nuevosFallos = prev + 1;
        if (nuevosFallos >= 3) setJuegoTerminado(true);
        return nuevosFallos;
      });
    }

    const levelConfig = getNivelConfig();
    if (nuevaRespuestas.length === levelConfig.testFigureCount) {
      // Verificar si el usuario pasó el nivel
      const precision = nuevoPuntuacion / nuevaRespuestas.length;
      if (precision >= JUEGO5_CONFIG.PASS_THRESHOLD && nivelActual < JUEGO5_CONFIG.MAX_LEVEL) {
        // Avanzar al siguiente nivel
        setNivelActual(prev => prev + 1);
        reiniciarRonda();
      } else {
        setJuegoTerminado(true);
        calcularResultado(nuevaRespuestas);
      }
    }
  };

  const reiniciarRonda = () => {
    // Limpiar temporizador de respuesta
    if (responseTimerRef.current) {
      clearInterval(responseTimerRef.current);
      responseTimerRef.current = null;
    }

    setIndiceActual(0);
    setMostrarPregunta(false);
    setPreguntas([]);
    setRespuestas([]);
    setFallos(0);
    setPuntuacion(0);
    setRespuestasDetalladas([]);
    setTiempoMemorizacion(null);
    setTiempoRespuesta(JUEGO5_CONFIG.RESPONSE_TIME_LIMIT);
  };

  const calcularResultado = (respuestas) => {
    let correctas = 0;
    respuestas.forEach(({ pregunta, respuesta }) => {
      const aparece = secuencia.includes(pregunta);
      if ((aparece && respuesta === "sí") || (!aparece && respuesta === "no")) {
        correctas++;
      }
    });
    setResultado({ correctas, total: 40 });
  };

  const reiniciarJuego = () => {
    // Limpiar todos los temporizadores
    if (responseTimerRef.current) {
      clearInterval(responseTimerRef.current);
      responseTimerRef.current = null;
    }

    setNivelActual(JUEGO5_CONFIG.START_LEVEL);
    setIndiceActual(0);
    setMostrarPregunta(false);
    setPreguntas([]);
    setRespuestas([]);
    setResultado(null);
    setTiempo(60);
    setFallos(0);
    setPuntuacion(0);
    setJuegoTerminado(false);
    setResultadoGuardado(false);
    setRespuestasDetalladas([]);
    setTiempoMemorizacion(null);
    setTiempoInicio(Date.now());
    setTiempoRespuesta(JUEGO5_CONFIG.RESPONSE_TIME_LIMIT);
  };

  const generarAnalisis = () => {
    const levelConfig = getNivelConfig();
    const totalPreguntas = levelConfig.testFigureCount;
    const porcentaje = respuestas.length > 0 ? Math.round((puntuacion / respuestas.length) * 100) : 0;
    const hits = respuestasDetalladas.filter(r => r.formaEnSecuencia && r.respuestaUsuario === "sí").length;
    const falseAlarms = respuestasDetalladas.filter(r => !r.formaEnSecuencia && r.respuestaUsuario === "sí").length;

    if (tiempo <= 0) {
      return `Se acabó el tiempo. Lograste ${porcentaje}% de precisión con ${respuestas.length}/${totalPreguntas} preguntas respondidas. Intenta responder más rápido manteniendo la precisión.`;
    }
    if (fallos >= 3) {
      return `Has cometido demasiados errores consecutivos. Tu precisión fue ${porcentaje}% con ${hits} aciertos y ${falseAlarms} falsas alarmas. Intenta concentrarte más durante la memorización.`;
    }
    if (porcentaje >= 90 && respuestas.length >= totalPreguntas * 0.85) {
      return `¡Excelente memoria de reconocimiento! ${porcentaje}% de precisión con ${hits} aciertos correctos y solo ${falseAlarms} falsas alarmas. Tu atención visual es excepcional.`;
    }
    if (porcentaje >= 70) {
      if (nivelActual >= JUEGO5_CONFIG.MAX_LEVEL) {
        return `¡Completaste todos los niveles! ${porcentaje}% de precisión final. Tu memoria de reconocimiento es excelente.`;
      }
      return `Muy bien. ${porcentaje}% de precisión con ${hits} aciertos y ${falseAlarms} falsas alarmas. Tu memoria de reconocimiento está bien desarrollada.`;
    }
    if (porcentaje >= 50) {
      return `Buen intento. ${porcentaje}% de precisión con ${falseAlarms} falsas alarmas. Revisa tu estrategia de memorización y trata de ser más selectivo.`;
    }
    return `Necesitas más práctica. ${porcentaje}% de precisión con ${falseAlarms} falsas alarmas. Enfócate en crear asociaciones mentales durante la memorización.`;
  };

  const obtenerProgreso = () => {
    const levelConfig = getNivelConfig();
    if (!mostrarPregunta) {
      return `Memorizando: ${indiceActual}/${levelConfig.figureCount} formas`;
    } else {
      return `Respondiendo: ${respuestas.length}/${levelConfig.testFigureCount} preguntas`;
    }
  };

  const InstruccionesJuego = () => (
    <div style={{ textAlign: 'center', fontSize: '18px', color: '#34495e' }}>
      <h3>¡Reconocimiento Visual!</h3>
      <p style={{ marginTop: '20px', lineHeight: '1.8' }}>
        <strong>Fase 1:</strong> Memoriza las formas que aparecerán una por una.
      </p>
      <p style={{ lineHeight: '1.8' }}>
        <strong>Fase 2:</strong> Responde SÍ si la forma apareció, NO si no la viste.
      </p>
      <p style={{ marginTop: '15px', color: '#e74c3c' }}>
        ⚠️ Tienes {JUEGO5_CONFIG.RESPONSE_TIME_LIMIT} segundos para responder cada pregunta.
      </p>
      <p style={{ color: '#e74c3c' }}>
        ⚠️ Tres fallos terminarán el juego.
      </p>
      <p style={{ marginTop: '10px', fontSize: '16px', color: '#27ae60' }}>
        💡 Consejo: Presta atención a cada detalle durante la memorización.
      </p>
    </div>
  );

  const iniciarJuego = () => {
    setJuegoIniciado(true);
  };

  return (
    <GameLayout
      title="Reconocimiento de Objetos"
      showInstructions={!juegoIniciado}
      instructions={<InstruccionesJuego />}
      onStartGame={iniciarJuego}
      description={
        juegoIniciado
          ? mostrarPregunta
            ? `Nivel ${nivelActual} - ${getNivelConfig().nombre}`
            : `Nivel ${nivelActual} - ${getNivelConfig().nombre} | Fase de memorización`
          : null
      }
      stats={{
        nivel: nivelActual,
        puntuacion,
        fallos,
        tiempo: mostrarPregunta ? tiempoRespuesta : tiempo,
        progreso: obtenerProgreso()
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: respuestas.length === getNivelConfig().testFigureCount,
        level: nivelActual,
        score: puntuacion,
        mistakes: fallos,
        timeRemaining: tiempo,
        precision: respuestas.length > 0 ? Math.round((puntuacion / respuestas.length) * 100) : 0
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
      onFallo={fallos}
      onCorrectAnswer={puntuacion}
    >
      {!juegoTerminado ? (
        <>
          {!mostrarPregunta ? (
            <div className="secuencia">
              <h2>Memoriza las formas ({indiceActual + 1}/{getNivelConfig().figureCount})</h2>
              {indiceActual < secuencia.length && (
                <div className="forma">{secuencia[indiceActual]}</div>
              )}
              <p style={{ marginTop: '20px', color: '#666' }}>
                Observa cada forma cuidadosamente...
              </p>
            </div>
          ) : (
            <div className="preguntas">
              <h2>¿Esta forma apareció en la secuencia?</h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Pregunta {respuestas.length + 1}/{getNivelConfig().testFigureCount}
              </p>
              {preguntas.length > respuestas.length && (
                <div className="pregunta">
                  <div className="forma">{preguntas[respuestas.length]}</div>
                  <div className="buttons">
                    <button
                      onClick={() => responder(preguntas[respuestas.length], "sí")}
                      style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', borderRadius: '5px', fontSize: '18px' }}
                    >
                      SÍ
                    </button>
                    <button
                      onClick={() => responder(preguntas[respuestas.length], "no")}
                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', borderRadius: '5px', fontSize: '18px' }}
                    >
                      NO
                    </button>
                  </div>
                </div>
              )}

              {resultado && (
                <div className="resultado">
                  <p><strong>Resultados:</strong> {resultado.correctas} correctas de {resultado.total}</p>
                  <p><strong>Precisión:</strong> {Math.round((resultado.correctas / resultado.total) * 100)}%</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        // Mostrar estado de guardado cuando termine el juego
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="resultado">
            {resultado && (
              <>
                <h3>Resultados Finales</h3>
                <p><strong>Respuestas correctas:</strong> {resultado.correctas} de {resultado.total}</p>
                <p><strong>Precisión:</strong> {Math.round((resultado.correctas / resultado.total) * 100)}%</p>
                <p><strong>Preguntas respondidas:</strong> {respuestas.length}/40</p>
              </>
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
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

export default Juego5;