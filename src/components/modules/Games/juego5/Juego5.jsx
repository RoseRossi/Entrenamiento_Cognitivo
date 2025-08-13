import React, { useEffect, useState, useCallback } from "react";
import GameLayout from "../GameLayout";
import { auth } from "../../../../services/firebase/firebaseConfig";
import { gameService } from "../../../../services/firebase/gameService";
import { userService } from "../../../../services/firebase/userService";
import "./juego5_estilos.css";
import { generarSecuencia, generarPreguntas } from "./juego5_funciones";

const Juego5 = () => {
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

  // Estados para Firebase
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [resultadoGuardado, setResultadoGuardado] = useState(false);
  const [tiempoMemorizacion, setTiempoMemorizacion] = useState(null);
  const [respuestasDetalladas, setRespuestasDetalladas] = useState([]);

  // Guardar resultado usando useCallback
  const guardarResultado = useCallback(async () => {
    if (!user) {
      console.log('No hay usuario autenticado para guardar resultado');
      return;
    }

    try {
      console.log('Guardando resultado del Juego 5...');
      
      const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000);
      const totalPreguntas = 40;
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
      
      // Calcular sensibilidad (d') y criterio de respuesta
      const hitRate = hits / (hits + misses || 1);
      const falseAlarmRate = falseAlarms / (falseAlarms + correctRejections || 1);
      
      // Determinar nivel basado en rendimiento
      let nivelJuego = 'basico';
      if (porcentajePrecision >= 85 && porcentajeCompletado >= 90) {
        nivelJuego = 'avanzado';
      } else if (porcentajePrecision >= 70 && porcentajeCompletado >= 75) {
        nivelJuego = 'intermedio';
      }

      // Score final basado en precisión y completitud
      const scoreFinal = Math.round((porcentajePrecision * 0.8) + (porcentajeCompletado * 0.2));

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
          totalPreguntasPosibles: totalPreguntas,
          porcentajeCompletado: porcentajeCompletado,
          porcentajePrecision: porcentajePrecision,
          fallosTotales: fallos,
          tiempoMemorizacion: tiempoMemorizacion,
          tiempoTesteo: tiempoTranscurrido - tiempoMemorizacion,
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
          tiempoPromedioRespuesta: preguntasRespondidas > 0 ? 
            Math.round(((tiempoTranscurrido - tiempoMemorizacion) / preguntasRespondidas) * 100) / 100 : 0
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
    setTiempoInicio(Date.now());
  }, []);

  // Guardar resultado cuando el juego termine
  useEffect(() => {
    if (juegoTerminado && !resultadoGuardado && user && tiempoInicio) {
      guardarResultado();
    }
  }, [juegoTerminado, resultadoGuardado, user, tiempoInicio, guardarResultado]);

  useEffect(() => {
    const nuevaSecuencia = generarSecuencia();
    setSecuencia(nuevaSecuencia);
  }, []);

  useEffect(() => {
    let timer;
    if (!mostrarPregunta) {
      timer = setTimeout(() => {
        if (indiceActual < 20) {
          setIndiceActual((prev) => prev + 1);
        } else {
          // Marcar tiempo cuando termina la memorización
          setTiempoMemorizacion(Math.round((Date.now() - tiempoInicio) / 1000));
          setMostrarPregunta(true);
          setPreguntas(generarPreguntas(secuencia));
        }
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [indiceActual, mostrarPregunta, secuencia, tiempoInicio]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTiempo((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setJuegoTerminado(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const responder = (pregunta, respuesta) => {
    if (juegoTerminado) return;

    const nuevaRespuestas = [...respuestas, { pregunta, respuesta }];
    setRespuestas(nuevaRespuestas);

    const aparece = secuencia.includes(pregunta);
    const esCorrecta = (aparece && respuesta === "sí") || (!aparece && respuesta === "no");

    // Registrar respuesta detallada
    const respuestaDetallada = {
      preguntaNumero: respuestas.length + 1,
      forma: pregunta,
      formaEnSecuencia: aparece,
      respuestaUsuario: respuesta,
      correcta: esCorrecta,
      tiempoRespuesta: Date.now() - tiempoInicio,
      tiempoRestante: tiempo
    };
    setRespuestasDetalladas(prev => [...prev, respuestaDetallada]);

    if (esCorrecta) {
      setPuntuacion((prev) => prev + 1);
    } else {
      setFallos((prev) => {
        const nuevosFallos = prev + 1;
        if (nuevosFallos >= 3) setJuegoTerminado(true);
        return nuevosFallos;
      });
    }

    if (nuevaRespuestas.length === 40) {
      setJuegoTerminado(true);
      calcularResultado(nuevaRespuestas);
    }
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
    const nuevaSecuencia = generarSecuencia();
    setSecuencia(nuevaSecuencia);
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
  };

  const generarAnalisis = () => {
    const porcentaje = respuestas.length > 0 ? Math.round((puntuacion / respuestas.length) * 100) : 0;
    const hits = respuestasDetalladas.filter(r => r.formaEnSecuencia && r.respuestaUsuario === "sí").length;
    const falseAlarms = respuestasDetalladas.filter(r => !r.formaEnSecuencia && r.respuestaUsuario === "sí").length;
    
    if (tiempo <= 0) {
      return `Se acabó el tiempo. Lograste ${porcentaje}% de precisión con ${respuestas.length}/40 preguntas respondidas. Intenta responder más rápido manteniendo la precisión.`;
    }
    if (fallos >= 3) {
      return `Has cometido demasiados errores consecutivos. Tu precisión fue ${porcentaje}% con ${hits} aciertos y ${falseAlarms} falsas alarmas. Intenta concentrarte más durante la memorización.`;
    }
    if (porcentaje >= 90 && respuestas.length >= 35) {
      return `¡Excelente memoria de reconocimiento! ${porcentaje}% de precisión con ${hits} aciertos correctos y solo ${falseAlarms} falsas alarmas. Tu atención visual es excepcional.`;
    }
    if (porcentaje >= 70) {
      return `Muy bien. ${porcentaje}% de precisión con ${hits} aciertos y ${falseAlarms} falsas alarmas. Tu memoria de reconocimiento está bien desarrollada.`;
    }
    if (porcentaje >= 50) {
      return `Buen intento. ${porcentaje}% de precisión con ${falseAlarms} falsas alarmas. Revisa tu estrategia de memorización y trata de ser más selectivo.`;
    }
    return `Necesitas más práctica. ${porcentaje}% de precisión con ${falseAlarms} falsas alarmas. Enfócate en crear asociaciones mentales durante la memorización.`;
  };

  const obtenerProgreso = () => {
    if (!mostrarPregunta) {
      return `Memorizando: ${indiceActual}/20 formas`;
    } else {
      return `Respondiendo: ${respuestas.length}/40 preguntas`;
    }
  };

  return (
    <GameLayout
      title="Reconocimiento de Objetos"
      description="Memoriza la secuencia de formas. Luego responde si viste o no cada una."
      stats={{
        nivel: 1,
        puntuacion,
        fallos,
        tiempo,
        progreso: obtenerProgreso()
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: respuestas.length === 40,
        level: 1,
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
              <h2>Memoriza las formas ({indiceActual + 1}/20)</h2>
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
              <p style={{ marginBottom: '10px', color: '#666' }}>
                Pregunta {respuestas.length + 1}/40 | Aciertos: {puntuacion} | Fallos: {fallos}
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