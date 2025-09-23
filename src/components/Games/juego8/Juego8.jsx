import React, { useState, useEffect, useCallback } from "react";
import { generarEjercicios, verificarRespuesta } from "./juego8_funciones";
import { auth } from "../../../services/firebase/firebaseConfig";
import { gameService } from "../../../services/firebase/gameService";
import { userService } from "../../../services/firebase/userService";
import "./juego8_estilos.css";
import GameLayout from "../GameLayout/GameLayout";

const Juego8 = () => {
  const [ejercicios] = useState(generarEjercicios());
  const [indiceActual, setIndiceActual] = useState(0);
  const [respuestaUsuario, setRespuestaUsuario] = useState([]);
  const [mostrarSecuencia, setMostrarSecuencia] = useState(true);
  const [celdasActivas, setCeldasActivas] = useState([]);
  const [intentosRestantes, setIntentosRestantes] = useState(3);
  const [puntosTotales, setPuntosTotales] = useState(0);
  const [puntosMaximos, setPuntosMaximos] = useState(0);
  const [tiempo, setTiempo] = useState(30);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [falloContador, setFalloContador] = useState(0);
  const [tiempoBase, setTiempoBase] = useState(30);

  // Estados para Firebase
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [resultadoGuardado, setResultadoGuardado] = useState(false);
  const [ejerciciosDetallados, setEjerciciosDetallados] = useState([]);
  const [tiempoInicioEjercicio, setTiempoInicioEjercicio] = useState(null);
  
  const ejercicio = ejercicios[indiceActual];

  // Guardar resultado usando useCallback
  const guardarResultado = useCallback(async () => {
    if (!user) {
      console.log(' No hay usuario autenticado para guardar resultado');
      return;
    }

    try {
      console.log(' Guardando resultado del Juego 8...');
      
      const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000);
      const totalEjercicios = ejercicios.length;
      const ejerciciosCompletados = indiceActual;
      const ejerciciosCorrectos = ejerciciosDetallados.filter(e => e.correcto).length;
      
      // Calcular métricas específicas de memoria visuoespacial inversa
      const amplitudMaximaAlcanzada = ejerciciosDetallados.length > 0 ? 
        Math.max(...ejerciciosDetallados.filter(e => e.correcto).map(e => e.amplitud)) : 2;
      const porcentajePrecision = ejerciciosDetallados.length > 0 ? 
        Math.round((ejerciciosCorrectos / ejerciciosDetallados.length) * 100) : 0;
      
      // Analizar rendimiento por amplitud
      const rendimientoPorAmplitud = {};
      for (let amp = 2; amp <= 8; amp++) {
        const ejerciciosAmplitud = ejerciciosDetallados.filter(e => e.amplitud === amp);
        if (ejerciciosAmplitud.length > 0) {
          const correctosAmplitud = ejerciciosAmplitud.filter(e => e.correcto).length;
          rendimientoPorAmplitud[amp] = {
            intentos: ejerciciosAmplitud.length,
            aciertos: correctosAmplitud,
            porcentaje: Math.round((correctosAmplitud / ejerciciosAmplitud.length) * 100)
          };
        }
      }

      // Determinar nivel basado en span alcanzado
      let nivelJuego = 'basico';
      if (amplitudMaximaAlcanzada >= 6 && porcentajePrecision >= 75) {
        nivelJuego = 'avanzado';
      } else if (amplitudMaximaAlcanzada >= 5 && porcentajePrecision >= 65) {
        nivelJuego = 'intermedio';
      }

      // Score basado en span máximo y puntos obtenidos
      const scoreSpan = Math.min(60, (amplitudMaximaAlcanzada - 2) * 10); // Máximo 60 puntos por span
      const scorePuntos = Math.min(40, (puntosTotales / Math.max(puntosMaximos, 1)) * 40); // 40% por eficiencia
      const scoreFinal = Math.round(scoreSpan + scorePuntos);

      const resultData = {
        userId: user.uid,
        gameId: 'memoria_visuoespacial_inversa',
        cognitiveDomain: 'memoria',
        level: nivelJuego,
        score: scoreFinal,
        timeSpent: tiempoTranscurrido,
        correctAnswers: ejerciciosCorrectos,
        totalQuestions: ejerciciosDetallados.length,
        details: {
          spanMemoriaInversa: amplitudMaximaAlcanzada,
          amplitudMaximaAlcanzada: amplitudMaximaAlcanzada,
          ejerciciosCompletados: ejerciciosCompletados,
          totalEjercicios: totalEjercicios,
          ejerciciosCorrectos: ejerciciosCorrectos,
          porcentajePrecision: porcentajePrecision,
          puntosTotales: puntosTotales,
          puntosMaximos: puntosMaximos,
          eficienciaPuntos: puntosMaximos > 0 ? Math.round((puntosTotales / puntosMaximos) * 100) : 0,
          fallosTotales: falloContador,
          razonTermino: ejerciciosCompletados >= totalEjercicios ? 'completado' :
                       (intentosRestantes === 0 ? 'agotados_intentos' : 'usuario_salio'),
          rendimientoPorAmplitud: rendimientoPorAmplitud,
          tiempoPromedioEjercicio: ejerciciosDetallados.length > 0 ? 
            Math.round(ejerciciosDetallados.reduce((sum, e) => sum + e.tiempoTotal, 0) / ejerciciosDetallados.length) : 0,
          ejerciciosDetallados: ejerciciosDetallados,
          configuracionEjercicios: ejercicios.map(e => ({
            amplitud: e.amplitud,
            secuencia: e.secuencia
          }))
        }
      };

      // Guardar resultado del juego
      await gameService.saveGameResult(resultData);
      
      // Actualizar progreso del usuario en el dominio cognitivo
      await userService.updateUserProgress(user.uid, 'memoria', scoreFinal);
      
      console.log(' Resultado del Juego 8 guardado exitosamente');
      setResultadoGuardado(true);
      
    } catch (error) {
      console.error(' Error guardando resultado del Juego 8:', error);
    }
  }, [user, tiempoInicio, ejercicios, indiceActual, ejerciciosDetallados, puntosTotales, puntosMaximos, falloContador, intentosRestantes]);

  // Inicialización
  useEffect(() => {
    setUser(auth.currentUser);
    setTiempoInicio(Date.now());
    setTiempoInicioEjercicio(Date.now());
  }, []);

  // Guardar resultado cuando el juego termine
  useEffect(() => {
    if (juegoTerminado && !resultadoGuardado && user && tiempoInicio) {
      guardarResultado();
    }
  }, [juegoTerminado, resultadoGuardado, user, tiempoInicio, guardarResultado]);

  const mostrarSecuenciaEjercicio = useCallback(() => {
    setMostrarSecuencia(true);
    setRespuestaUsuario([]);
    setTiempoInicioEjercicio(Date.now());
    
    ejercicio.secuencia.forEach((pos, i) => {
      setTimeout(() => {
        setCeldasActivas([pos]);
        setTimeout(() => setCeldasActivas([]), 500);
      }, i * 800);
    });

    const totalDuracion = ejercicio.secuencia.length * 800;
    setTimeout(() => {
      setMostrarSecuencia(false);
    }, totalDuracion);
  }, [ejercicio]);

  const reiniciarIntento = useCallback(() => {
    setMensaje("Intenta de nuevo. Observa la secuencia otra vez.");
    setTimeout(() => {
      setMensaje("");
      setTiempoBase(15);
      setTiempo(15);
      mostrarSecuenciaEjercicio();
    }, 1000);
  }, [mostrarSecuenciaEjercicio]);

  const terminarJuego = useCallback(() => {
    setPuntosMaximos(p => p + ejercicio.amplitud);
    setJuegoTerminado(true);
  }, [ejercicio.amplitud]);

  const avanzarEjercicio = () => {
    setPuntosMaximos(p => p + ejercicio.amplitud);
    setIndiceActual(i => i + 1);
    setIntentosRestantes(3);
    setRespuestaUsuario([]);
    setTiempoBase(30);
    setTiempo(30);
    setMensaje("");
  };

  const verificarYProcesar = () => {
    const esCorrecta = verificarRespuesta(respuestaUsuario, ejercicio.secuencia);
    const tiempoTotal = Date.now() - tiempoInicioEjercicio;

    // Registrar ejercicio detallado
    const ejercicioDetallado = {
      ejercicioNumero: indiceActual + 1,
      amplitud: ejercicio.amplitud,
      secuenciaOriginal: [...ejercicio.secuencia],
      secuenciaInversa: [...ejercicio.secuencia].reverse(),
      respuestaUsuario: [...respuestaUsuario],
      correcto: esCorrecta,
      intentoNumero: 4 - intentosRestantes,
      tiempoTotal: tiempoTotal,
      tiempoVisualizacion: ejercicio.secuencia.length * 800,
      tiempoRespuesta: tiempoTotal - (ejercicio.secuencia.length * 800),
      puntosObtenidos: esCorrecta ? ejercicio.amplitud - (3 - intentosRestantes) : 0
    };
    setEjerciciosDetallados(prev => [...prev, ejercicioDetallado]);

    if (esCorrecta) {
      const puntosObtenidos = ejercicio.amplitud - (3 - intentosRestantes);
      setPuntosTotales(p => p + puntosObtenidos);
      if (indiceActual + 1 >= ejercicios.length) {
        terminarJuego();
      } else {
        avanzarEjercicio();
      }
    } else {
      setFalloContador(f => f + 1);
      if (intentosRestantes > 1) {
        setIntentosRestantes(i => i - 1);
        reiniciarIntento();
      } else {
        terminarJuego();
      }
    }
  };

  const generarAnalisis = () => {
    if (!juegoTerminado) return "";
    
    const amplitudMaxima = ejerciciosDetallados.length > 0 ? 
      Math.max(...ejerciciosDetallados.filter(e => e.correcto).map(e => e.amplitud)) : 2;
    const porcentajePrecision = ejerciciosDetallados.length > 0 ? 
      Math.round((ejerciciosDetallados.filter(e => e.correcto).length / ejerciciosDetallados.length) * 100) : 0;
    const eficienciaPuntos = puntosMaximos > 0 ? Math.round((puntosTotales / puntosMaximos) * 100) : 0;

    if (amplitudMaxima >= 7) {
      return `¡Excelente span de memoria visuoespacial inversa! Alcanzaste amplitud ${amplitudMaxima} con ${porcentajePrecision}% de precisión y ${eficienciaPuntos}% de eficiencia en puntos. Tu capacidad para manipular información espacial en memoria de trabajo está muy desarrollada.`;
    }
    
    if (amplitudMaxima >= 5) {
      return `Buen rendimiento. Tu span de memoria visuoespacial inversa es ${amplitudMaxima} con ${porcentajePrecision}% de precisión y ${eficienciaPuntos}% de eficiencia. Esto indica una buena capacidad para procesar información espacial de forma inversa.`;
    }
    
    if (amplitudMaxima >= 4) {
      return `Rendimiento promedio. Span de ${amplitudMaxima} con ${porcentajePrecision}% de precisión y ${eficienciaPuntos}% de eficiencia. La memoria visuoespacial inversa requiere práctica adicional para mejorar.`;
    }
    
    return `Tu span de memoria visuoespacial inversa es ${amplitudMaxima} con ${porcentajePrecision}% de precisión. Sigue practicando técnicas de visualización y manipulación mental de secuencias espaciales.`;
  };

  useEffect(() => {
    if (ejercicio && !juegoTerminado) {
      mostrarSecuenciaEjercicio();
    }
  }, [ejercicio, indiceActual, juegoTerminado, mostrarSecuenciaEjercicio]);

  useEffect(() => {
    if (mostrarSecuencia || juegoTerminado) return;
    const timer = setTimeout(() => {
      if (tiempo > 0) {
        setTiempo(t => t - 1);
      } else {
        if (intentosRestantes > 1) {
          setIntentosRestantes(i => i - 1);
          reiniciarIntento();
        } else {
          terminarJuego();
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [tiempo, mostrarSecuencia, juegoTerminado, intentosRestantes, reiniciarIntento, terminarJuego]);

  const manejarSeleccion = (posicion) => {
    if (mostrarSecuencia || juegoTerminado) return;
    setRespuestaUsuario([...respuestaUsuario, posicion]);
  };

  const renderCuadricula = () => (
    <div className="cuadricula-memoria">
      {[...Array(9).keys()].map((pos) => (
        <button
          key={pos}
          className={`celda ${celdasActivas.includes(pos) ? "activo" : ""} ${respuestaUsuario.includes(pos) ? "seleccionado" : ""}`}
          onClick={() => manejarSeleccion(pos)}
          disabled={mostrarSecuencia}
        />
      ))}
    </div>
  );

  const reiniciarJuego = () => {
    setIndiceActual(0);
    setRespuestaUsuario([]);
    setMostrarSecuencia(true);
    setCeldasActivas([]);
    setIntentosRestantes(3);
    setPuntosTotales(0);
    setPuntosMaximos(0);
    setTiempo(30);
    setJuegoTerminado(false);
    setMensaje("");
    setFalloContador(0);
    setTiempoBase(30);
    setResultadoGuardado(false);
    setEjerciciosDetallados([]);
    setTiempoInicio(Date.now());
  };

  const obtenerProgreso = () => {
    return `Ejercicio ${indiceActual + 1}/${ejercicios.length} | Amplitud: ${ejercicio?.amplitud} | Intento: ${4 - intentosRestantes}/3`;
  };

  return (
    <GameLayout
      title="Memoria Visoespacial Inversa"
      description={<>
        <p>Memoriza la secuencia y repítela en orden inverso.</p>
        <p>Cada ejercicio tiene 3 intentos. La secuencia se repetirá tras fallar.</p>
        <p>Intento actual: {4 - intentosRestantes} / 3</p>
        {mensaje && <p style={{ color: 'orange', fontWeight: 'bold' }}>{mensaje}</p>}
      </>}
      stats={{
        nivel: ejercicio?.amplitud - 1,
        puntuacion: puntosTotales,
        fallos: falloContador,
        tiempo: mostrarSecuencia ? tiempoBase : tiempo,
        progreso: obtenerProgreso()
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: indiceActual >= ejercicios.length,
        level: ejercicio?.amplitud - 1,
        score: puntosTotales,
        mistakes: falloContador,
        timeRemaining: tiempo,
        span: ejerciciosDetallados.length > 0 ? 
          Math.max(...ejerciciosDetallados.filter(e => e.correcto).map(e => e.amplitud)) : 2,
        efficiency: puntosMaximos > 0 ? Math.round((puntosTotales / puntosMaximos) * 100) : 0
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
      onFallo={falloContador}
      onCorrectAnswer={puntosTotales}
    >
      {!juegoTerminado ? (
        <>
          {ejercicio && (
            <div className="juego8-container">
              {renderCuadricula()}
              {!mostrarSecuencia && (
                <button
                  className="boton-verificar"
                  onClick={verificarYProcesar}
                  disabled={respuestaUsuario.length === 0}
                >
                  Verificar
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        // Mostrar estado de guardado cuando termine el juego
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="resultado">
            <h3>Resultados Finales</h3>
            <p><strong>Span de memoria inversa:</strong> {ejerciciosDetallados.length > 0 ? 
              Math.max(...ejerciciosDetallados.filter(e => e.correcto).map(e => e.amplitud)) : 2} elementos</p>
            <p><strong>Puntos obtenidos:</strong> {puntosTotales} de {puntosMaximos}</p>
            <p><strong>Ejercicios completados:</strong> {indiceActual}/{ejercicios.length}</p>
            <p><strong>Precisión:</strong> {ejerciciosDetallados.length > 0 ? 
              Math.round((ejerciciosDetallados.filter(e => e.correcto).length / ejerciciosDetallados.length) * 100) : 0}%</p>
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

export default Juego8;