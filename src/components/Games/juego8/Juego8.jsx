import React, { useReducer, useEffect, useCallback, useState } from "react";
import { generarEjercicios, verificarRespuesta, validarEjercicio, analizarRendimiento } from "./juego8_funciones";
import { auth } from "../../../services/firebase/firebaseConfig";
import { gameService } from "../../../services/firebase/gameService";
import { userService } from "../../../services/firebase/userService";
import "./juego8_estilos.css";
import GameLayout from "../GameLayout/GameLayout";

// =====================================
// CONFIGURACIÓN Y CONSTANTES
// =====================================
const CONFIGURACION = {
  INTENTOS_POR_EJERCICIO: 3,
  TIEMPO_INICIAL: 30,
  TIEMPO_REDUCIDO: 15,
  DURACION_CELDA: 500,
  INTERVALO_CELDAS: 800,
  GRID_SIZE: 9 // 3x3
};

// =====================================
// FUNCIONES UTILITARIAS
// =====================================
const calcularIntentoActual = (intentosRestantes) => 
  CONFIGURACION.INTENTOS_POR_EJERCICIO - intentosRestantes + 1;

const calcularPuntosObtenidos = (amplitud, intentosUsados) => 
  Math.max(0, amplitud - intentosUsados);

const calcularTiempoVisualizacion = (secuencia) => 
  secuencia.length * CONFIGURACION.INTERVALO_CELDAS;

// =====================================
// ESTADO INICIAL
// =====================================
const initialGameState = {
  ejercicios: [],
  indiceActual: 0,
  juegoTerminado: false,
  juegoIniciado: false,
  mostrarSecuencia: true,
  celdasActivas: [],
  respuestaUsuario: [],
  intentosRestantes: CONFIGURACION.INTENTOS_POR_EJERCICIO,
  tiempo: CONFIGURACION.TIEMPO_INICIAL,
  tiempoBase: CONFIGURACION.TIEMPO_INICIAL,
  tiempoInicioEjercicio: null,
  puntosTotales: 0,
  puntosMaximos: 0,
  falloContador: 0,
  ejerciciosDetallados: [],
  mensaje: "",
  resultadoGuardado: false
};

// =====================================
// REDUCER OPTIMIZADO
// =====================================
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'INICIALIZAR_USUARIO':
      return {
        ...state,
        ejercicios: action.ejercicios
      };
      
    case 'INICIAR_JUEGO':
      return {
        ...state,
        juegoIniciado: true,
        tiempo: CONFIGURACION.TIEMPO_INICIAL,
        tiempoBase: CONFIGURACION.TIEMPO_INICIAL
      };
      
    case 'MOSTRAR_SECUENCIA':
      return {
        ...state,
        mostrarSecuencia: true,
        respuestaUsuario: [],
        tiempoInicioEjercicio: Date.now(),
        celdasActivas: []
      };
      
    case 'ACTIVAR_CELDA':
      return {
        ...state,
        celdasActivas: action.posiciones
      };
      
    case 'OCULTAR_SECUENCIA':
      return {
        ...state,
        mostrarSecuencia: false,
        celdasActivas: []
      };
      
    case 'SELECCIONAR_CELDA':
      if (state.mostrarSecuencia || state.juegoTerminado) return state;
      return {
        ...state,
        respuestaUsuario: [...state.respuestaUsuario, action.posicion]
      };
      
    case 'RESPUESTA_CORRECTA':
      return {
        ...state,
        puntosTotales: state.puntosTotales + action.puntos,
        puntosMaximos: state.puntosMaximos + action.puntosMaximos,
        ejerciciosDetallados: [...state.ejerciciosDetallados, action.ejercicioDetallado],
        mensaje: ""
      };
      
    case 'RESPUESTA_INCORRECTA':
      return {
        ...state,
        falloContador: state.falloContador + 1,
        intentosRestantes: state.intentosRestantes - 1,
        ejerciciosDetallados: [...state.ejerciciosDetallados, action.ejercicioDetallado]
      };
      
    case 'AVANZAR_EJERCICIO':
      return {
        ...state,
        indiceActual: state.indiceActual + 1,
        intentosRestantes: CONFIGURACION.INTENTOS_POR_EJERCICIO,
        respuestaUsuario: [],
        tiempo: CONFIGURACION.TIEMPO_INICIAL,
        tiempoBase: CONFIGURACION.TIEMPO_INICIAL,
        mensaje: "",
        puntosMaximos: state.puntosMaximos + action.puntosMaximos
      };
      
    case 'TERMINAR_JUEGO':
      return {
        ...state,
        juegoTerminado: true,
        puntosMaximos: state.puntosMaximos + (action.puntosMaximos || 0)
      };
      
    case 'DECREMENTAR_TIEMPO':
      return {
        ...state,
        tiempo: Math.max(0, state.tiempo - 1)
      };
      
    case 'ESTABLECER_MENSAJE':
      return {
        ...state,
        mensaje: action.mensaje
      };
      
    case 'REINICIAR_INTENTO':
      return {
        ...state,
        mensaje: action.mensaje,
        tiempoBase: CONFIGURACION.TIEMPO_REDUCIDO,
        tiempo: CONFIGURACION.TIEMPO_REDUCIDO
      };
      
    case 'RESULTADO_GUARDADO':
      return {
        ...state,
        resultadoGuardado: true
      };
      
    case 'REINICIAR_JUEGO':
      const nuevosEjercicios = generarEjercicios();
      return {
        ...initialGameState,
        ejercicios: nuevosEjercicios,
        juegoIniciado: false
      };
      
    default:
      console.warn(`Acción no reconocida: ${action.type}`);
      return state;
  }
};

// =====================================
// COMPONENTE PRINCIPAL
// =====================================
const Juego8 = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  
  const ejercicioActual = gameState.ejercicios[gameState.indiceActual];

  // =====================================
  // INICIALIZACIÓN
  // =====================================
  useEffect(() => {
    try {
      setUser(auth.currentUser);
      setTiempoInicio(Date.now());
      
      const ejercicios = generarEjercicios();
      dispatch({ type: 'INICIALIZAR_USUARIO', ejercicios });
    } catch (error) {
      console.error('Error inicializando juego:', error);
    }
  }, []);

  // =====================================
  // FUNCIONES DEL JUEGO
  // =====================================
  const iniciarJuegoManual = useCallback(() => {
    try {
      dispatch({ type: 'INICIAR_JUEGO' });
    } catch (error) {
      console.error('Error iniciando juego:', error);
    }
  }, []);

  const mostrarSecuenciaEjercicio = useCallback(() => {
    if (!ejercicioActual) return;
    
    try {
      validarEjercicio(ejercicioActual);
      
      dispatch({ type: 'MOSTRAR_SECUENCIA' });
      
      ejercicioActual.secuencia.forEach((pos, i) => {
        setTimeout(() => {
          dispatch({ type: 'ACTIVAR_CELDA', posiciones: [pos] });
          
          setTimeout(() => {
            dispatch({ type: 'ACTIVAR_CELDA', posiciones: [] });
          }, CONFIGURACION.DURACION_CELDA);
        }, i * CONFIGURACION.INTERVALO_CELDAS);
      });

      const totalDuracion = calcularTiempoVisualizacion(ejercicioActual.secuencia);
      setTimeout(() => {
        dispatch({ type: 'OCULTAR_SECUENCIA' });
      }, totalDuracion);
      
    } catch (error) {
      console.error('Error mostrando secuencia:', error);
      dispatch({ type: 'ESTABLECER_MENSAJE', mensaje: 'Error en el ejercicio' });
    }
  }, [ejercicioActual]);

  const crearEjercicioDetallado = useCallback((esCorrecta, tiempoTotal, intentoActual) => {
    const tiempoVisualizacion = calcularTiempoVisualizacion(ejercicioActual.secuencia);
    
    return {
      ejercicioNumero: gameState.indiceActual + 1,
      amplitud: ejercicioActual.amplitud,
      secuenciaOriginal: [...ejercicioActual.secuencia],
      secuenciaInversa: [...ejercicioActual.secuencia].reverse(),
      respuestaUsuario: [...gameState.respuestaUsuario],
      correcto: esCorrecta,
      intentoNumero: intentoActual,
      tiempoTotal: tiempoTotal,
      tiempoVisualizacion: tiempoVisualizacion,
      tiempoRespuesta: Math.max(0, tiempoTotal - tiempoVisualizacion),
      puntosObtenidos: esCorrecta ? calcularPuntosObtenidos(ejercicioActual.amplitud, intentoActual - 1) : 0
    };
  }, [ejercicioActual, gameState.indiceActual, gameState.respuestaUsuario]);

  const verificarYProcesar = useCallback(() => {
    if (!ejercicioActual) {
      console.error('No hay ejercicio actual');
      return;
    }

    try {
      const esCorrecta = verificarRespuesta(gameState.respuestaUsuario, ejercicioActual.secuencia);
      const tiempoTotal = Date.now() - gameState.tiempoInicioEjercicio;
      const intentoActual = calcularIntentoActual(gameState.intentosRestantes);

      const ejercicioDetallado = crearEjercicioDetallado(esCorrecta, tiempoTotal, intentoActual);

      if (esCorrecta) {
        const puntosObtenidos = calcularPuntosObtenidos(ejercicioActual.amplitud, intentoActual - 1);
        
        dispatch({ 
          type: 'RESPUESTA_CORRECTA', 
          puntos: puntosObtenidos,
          puntosMaximos: ejercicioActual.amplitud,
          ejercicioDetallado 
        });
        
        if (gameState.indiceActual + 1 >= gameState.ejercicios.length) {
          dispatch({ type: 'TERMINAR_JUEGO', puntosMaximos: ejercicioActual.amplitud });
        } else {
          dispatch({ type: 'AVANZAR_EJERCICIO', puntosMaximos: ejercicioActual.amplitud });
        }
      } else {
        dispatch({ 
          type: 'RESPUESTA_INCORRECTA', 
          ejercicioDetallado 
        });
        
        if (gameState.intentosRestantes > 1) {
          dispatch({ 
            type: 'REINICIAR_INTENTO', 
            mensaje: "Intenta de nuevo. Observa la secuencia otra vez." 
          });
          setTimeout(() => {
            dispatch({ type: 'ESTABLECER_MENSAJE', mensaje: "" });
            mostrarSecuenciaEjercicio();
          }, 1000);
        } else {
          dispatch({ type: 'TERMINAR_JUEGO', puntosMaximos: ejercicioActual.amplitud });
        }
      }
    } catch (error) {
      console.error('Error verificando respuesta:', error);
      dispatch({ type: 'ESTABLECER_MENSAJE', mensaje: 'Error procesando respuesta' });
    }
  }, [gameState.respuestaUsuario, gameState.indiceActual, gameState.intentosRestantes, 
      gameState.tiempoInicioEjercicio, gameState.ejercicios, ejercicioActual, 
      mostrarSecuenciaEjercicio, crearEjercicioDetallado]);

  const manejarSeleccion = useCallback((posicion) => {
    if (gameState.mostrarSecuencia || gameState.juegoTerminado) return;
    dispatch({ type: 'SELECCIONAR_CELDA', posicion });
  }, [gameState.mostrarSecuencia, gameState.juegoTerminado]);

  // =====================================
  // EFECTOS
  // =====================================
  useEffect(() => {
    if (ejercicioActual && !gameState.juegoTerminado && gameState.juegoIniciado) {
      mostrarSecuenciaEjercicio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.indiceActual, gameState.juegoIniciado]);

  useEffect(() => {
    if (gameState.mostrarSecuencia || gameState.juegoTerminado || !gameState.juegoIniciado) return;
    
    const timer = setTimeout(() => {
      if (gameState.tiempo > 0) {
        dispatch({ type: 'DECREMENTAR_TIEMPO' });
      } else {
        if (gameState.intentosRestantes > 1) {
          dispatch({ 
            type: 'REINICIAR_INTENTO', 
            mensaje: "Se acabó el tiempo. Intenta de nuevo." 
          });
          setTimeout(() => {
            dispatch({ type: 'ESTABLECER_MENSAJE', mensaje: "" });
            mostrarSecuenciaEjercicio();
          }, 1000);
        } else {
          dispatch({ type: 'TERMINAR_JUEGO', puntosMaximos: ejercicioActual?.amplitud || 0 });
        }
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [gameState.tiempo, gameState.mostrarSecuencia, gameState.juegoTerminado, 
      gameState.juegoIniciado, gameState.intentosRestantes, mostrarSecuenciaEjercicio, ejercicioActual]);

  // =====================================
  // FIREBASE
  // =====================================
  const guardarResultado = useCallback(async () => {
    if (!user || gameState.resultadoGuardado) return;

    try {
      console.log('🎮 Guardando resultado del Juego 8...');
      
      const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000);
      const analisis = analizarRendimiento(gameState.ejerciciosDetallados);
      
      let nivelJuego = 'basico';
      if (analisis.amplitudMaxima >= 6 && analisis.porcentajePrecision >= 75) {
        nivelJuego = 'avanzado';
      } else if (analisis.amplitudMaxima >= 5 && analisis.porcentajePrecision >= 65) {
        nivelJuego = 'intermedio';
      }

      const scoreSpan = Math.min(60, (analisis.amplitudMaxima - 2) * 10);
      const scorePuntos = Math.min(40, (gameState.puntosTotales / Math.max(gameState.puntosMaximos, 1)) * 40);
      const scoreFinal = Math.round(scoreSpan + scorePuntos);

      const resultData = {
        userId: user.uid,
        gameId: 'memoria_visuoespacial_inversa',
        cognitiveDomain: 'memoria',
        level: nivelJuego,
        score: scoreFinal,
        timeSpent: tiempoTranscurrido,
        correctAnswers: analisis.ejerciciosCorrectos,
        totalQuestions: gameState.ejerciciosDetallados.length,
        details: {
          spanMemoriaInversa: analisis.amplitudMaxima,
          amplitudMaximaAlcanzada: analisis.amplitudMaxima,
          ejerciciosCompletados: gameState.indiceActual,
          totalEjercicios: gameState.ejercicios.length,
          ejerciciosCorrectos: analisis.ejerciciosCorrectos,
          porcentajePrecision: analisis.porcentajePrecision,
          puntosTotales: gameState.puntosTotales,
          puntosMaximos: gameState.puntosMaximos,
          eficienciaPuntos: gameState.puntosMaximos > 0 ? 
            Math.round((gameState.puntosTotales / gameState.puntosMaximos) * 100) : 0,
          fallosTotales: gameState.falloContador,
          razonTermino: gameState.indiceActual >= gameState.ejercicios.length ? 'completado' :
                       (gameState.intentosRestantes === 0 ? 'agotados_intentos' : 'usuario_salio'),
          rendimientoPorAmplitud: analisis.rendimientoPorAmplitud,
          tiempoPromedioEjercicio: gameState.ejerciciosDetallados.length > 0 ? 
            Math.round(gameState.ejerciciosDetallados.reduce((sum, e) => sum + e.tiempoTotal, 0) / gameState.ejerciciosDetallados.length) : 0,
          ejerciciosDetallados: gameState.ejerciciosDetallados
        }
      };

      await gameService.saveGameResult(resultData);
      await userService.updateUserProgress(user.uid, 'memoria', scoreFinal);
      
      console.log('✅ Resultado del Juego 8 guardado exitosamente');
      dispatch({ type: 'RESULTADO_GUARDADO' });
      
    } catch (error) {
      console.error('❌ Error guardando resultado del Juego 8:', error);
    }
  }, [user, tiempoInicio, gameState.ejerciciosDetallados, gameState.puntosTotales, 
      gameState.puntosMaximos, gameState.falloContador, gameState.intentosRestantes,
      gameState.indiceActual, gameState.ejercicios, gameState.resultadoGuardado]);

  useEffect(() => {
    if (gameState.juegoTerminado && !gameState.resultadoGuardado && user && tiempoInicio) {
      guardarResultado();
    }
  }, [gameState.juegoTerminado, gameState.resultadoGuardado, user, tiempoInicio, guardarResultado]);

  // =====================================
  // FUNCIONES AUXILIARES
  // =====================================
  const generarAnalisis = useCallback(() => {
    if (!gameState.juegoTerminado) return "";
    
    const analisis = analizarRendimiento(gameState.ejerciciosDetallados);
    const eficienciaPuntos = gameState.puntosMaximos > 0 ? 
      Math.round((gameState.puntosTotales / gameState.puntosMaximos) * 100) : 0;

    if (analisis.amplitudMaxima >= 7) {
      return `¡Excelente span de memoria visuoespacial inversa! Alcanzaste amplitud ${analisis.amplitudMaxima} con ${analisis.porcentajePrecision}% de precisión y ${eficienciaPuntos}% de eficiencia en puntos. Tu capacidad para manipular información espacial en memoria de trabajo está muy desarrollada.`;
    }
    
    if (analisis.amplitudMaxima >= 5) {
      return `Buen rendimiento. Tu span de memoria visuoespacial inversa es ${analisis.amplitudMaxima} con ${analisis.porcentajePrecision}% de precisión y ${eficienciaPuntos}% de eficiencia. Esto indica una buena capacidad para procesar información espacial de forma inversa.`;
    }
    
    if (analisis.amplitudMaxima >= 4) {
      return `Rendimiento promedio. Span de ${analisis.amplitudMaxima} con ${analisis.porcentajePrecision}% de precisión y ${eficienciaPuntos}% de eficiencia. La memoria visuoespacial inversa requiere práctica adicional para mejorar.`;
    }
    
    return `Tu span de memoria visuoespacial inversa es ${analisis.amplitudMaxima} con ${analisis.porcentajePrecision}% de precisión. Sigue practicando técnicas de visualización y manipulación mental de secuencias espaciales.`;
  }, [gameState.juegoTerminado, gameState.ejerciciosDetallados, gameState.puntosTotales, gameState.puntosMaximos]);

  const reiniciarJuego = useCallback(() => {
    setTiempoInicio(Date.now());
    dispatch({ type: 'REINICIAR_JUEGO' });
  }, []);

  const renderCuadricula = useCallback(() => (
    <div className="cuadricula-memoria">
      {[...Array(CONFIGURACION.GRID_SIZE).keys()].map((pos) => (
        <button
          key={pos}
          className={`celda ${
            gameState.celdasActivas.includes(pos) ? "activo" : ""
          } ${
            gameState.respuestaUsuario.includes(pos) ? "seleccionado" : ""
          }`}
          onClick={() => manejarSeleccion(pos)}
          disabled={gameState.mostrarSecuencia}
          aria-label={`Celda ${pos + 1}`}
        />
      ))}
    </div>
  ), [gameState.celdasActivas, gameState.respuestaUsuario, gameState.mostrarSecuencia, manejarSeleccion]);

  const obtenerProgreso = useCallback(() => {
    const intentoActual = calcularIntentoActual(gameState.intentosRestantes);
    return `Ejercicio ${gameState.indiceActual + 1}/${gameState.ejercicios.length} | Amplitud: ${ejercicioActual?.amplitud || 0} | Intento: ${intentoActual}/${CONFIGURACION.INTENTOS_POR_EJERCICIO}`;
  }, [gameState.indiceActual, gameState.ejercicios.length, ejercicioActual, gameState.intentosRestantes]);


  // Componente de instrucciones
  const InstruccionesJuego8 = () => (
    <div style={{ textAlign: 'left', fontSize: '16px', lineHeight: '1.6', color: '#34495e' }}>
      <h3 style={{ color: '#3498db', marginBottom: '15px' }}>¿Cómo funciona?</h3>
      <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
        <li style={{ marginBottom: '8px' }}>Verás una cuadrícula de 3×3 con celdas que se iluminarán en secuencia</li>
        <li style={{ marginBottom: '8px' }}>Tu tarea es memorizar el orden en que se iluminan</li>
        <li style={{ marginBottom: '8px' }}><strong>¡IMPORTANTE!</strong> Debes repetir la secuencia en <strong>orden inverso</strong></li>
        <li style={{ marginBottom: '8px' }}>Es decir, si se iluminaron: A → B → C, debes hacer clic: C → B → A</li>
      </ul>

      <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>Reglas del juego:</h3>
      <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
        <li style={{ marginBottom: '8px' }}>Tienes <strong>{CONFIGURACION.INTENTOS_POR_EJERCICIO} intentos</strong> por cada ejercicio</li>
        <li style={{ marginBottom: '8px' }}>Si fallas, la secuencia se mostrará de nuevo</li>
        <li style={{ marginBottom: '8px' }}>Tienes <strong>{CONFIGURACION.TIEMPO_INICIAL} segundos</strong> para responder cada vez</li>
        <li style={{ marginBottom: '8px' }}>La dificultad aumenta progresivamente (más posiciones a recordar)</li>
      </ul>
    </div>
  );

  return (
    <GameLayout
      title="Memoria Visoespacial Inversa"
      showInstructions={!gameState.juegoIniciado}
      instructions={<InstruccionesJuego8 />}
      onStartGame={iniciarJuegoManual}
      description={
        gameState.juegoIniciado ? (
          <>
            <p>Memoriza la secuencia y repítela en <strong>orden inverso</strong>.</p>
            <p>Cada ejercicio tiene {CONFIGURACION.INTENTOS_POR_EJERCICIO} intentos. La secuencia se repetirá tras fallar.</p>
            <p>Intento actual: {calcularIntentoActual(gameState.intentosRestantes)} / {CONFIGURACION.INTENTOS_POR_EJERCICIO}</p>
            {gameState.mensaje && (
              <p style={{ color: 'orange', fontWeight: 'bold' }}>{gameState.mensaje}</p>
            )}
          </>
        ) : null
      }
      stats={gameState.juegoIniciado ? {
        nivel: ejercicioActual?.amplitud - 1 || 0,
        puntuacion: gameState.puntosTotales,
        fallos: gameState.falloContador,
        tiempo: gameState.mostrarSecuencia ? gameState.tiempoBase : gameState.tiempo,
        progreso: obtenerProgreso()
      } : {}}
      gameOver={gameState.juegoTerminado}
      finalStats={{
        completed: gameState.indiceActual >= gameState.ejercicios.length,
        level: ejercicioActual?.amplitud - 1 || 0,
        score: gameState.puntosTotales,
        mistakes: gameState.falloContador,
        timeRemaining: gameState.tiempo,
        span: gameState.ejerciciosDetallados.length > 0 ? 
          Math.max(...gameState.ejerciciosDetallados.filter(e => e.correcto).map(e => e.amplitud)) : 2,
        efficiency: gameState.puntosMaximos > 0 ? 
          Math.round((gameState.puntosTotales / gameState.puntosMaximos) * 100) : 0
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
      onFallo={gameState.falloContador}
      onCorrectAnswer={gameState.puntosTotales}
    >
      {gameState.juegoIniciado && !gameState.juegoTerminado && ejercicioActual && (
        <div className="juego8-container">
          {renderCuadricula()}
          {!gameState.mostrarSecuencia && (
            <button
              className="boton-verificar"
              onClick={verificarYProcesar}
              disabled={gameState.respuestaUsuario.length === 0}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: gameState.respuestaUsuario.length === 0 ? '#bdc3c7' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: gameState.respuestaUsuario.length === 0 ? 'not-allowed' : 'pointer',
                marginTop: '20px'
              }}
            >
              Verificar
            </button>
          )}
        </div>
      )}
    </GameLayout>
  );
};

export default Juego8;