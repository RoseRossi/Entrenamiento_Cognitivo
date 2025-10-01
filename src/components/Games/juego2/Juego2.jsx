import React, { useState, useEffect, useCallback } from "react";
import { patrones, verificarRespuesta } from "./juego2_funciones";
import { auth } from "../../../services/firebase/firebaseConfig";
import { gameService } from "../../../services/firebase/gameService";
import { userService } from "../../../services/firebase/userService";
import "./juego2_estilos.css";
import GameLayout from "../GameLayout/GameLayout";

const Juego2 = () => {
  const [indiceActual, setIndiceActual] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [nivel, setNivel] = useState(0);
  const [tiempo, setTiempo] = useState(30);
  const [estadoOpciones, setEstadoOpciones] = useState([]);
  const [fallosSeguidos, setFallosSeguidos] = useState(0);
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [resultadoGuardado, setResultadoGuardado] = useState(false);
  const [respuestasDetalladas, setRespuestasDetalladas] = useState([]);

  const patronActual = indiceActual < patrones.length ? patrones[indiceActual] : null;
  const esEnsayo = patronActual?.nivel === 0;
  const juegoTerminado = !patronActual;
  const [juegoIniciado, setJuegoIniciado] = useState(false);

  // Guardar resultado usando useCallback
  const guardarResultado = useCallback(async () => {
    if (!user) {
      console.log('No hay usuario autenticado para guardar resultado');
      return;
    }

    try {
      console.log('Guardando resultado del Juego 2...');
      
      const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000);
      const totalMatrices = patrones.length;
      const matricesCompletadas = indiceActual;
      const porcentajeCompletado = Math.round((matricesCompletadas / totalMatrices) * 100);
      
      // Calcular score basado en puntuación y completitud
      const scoreBase = Math.round((puntuacion / totalMatrices) * 100);
      const bonusCompletitud = matricesCompletadas === totalMatrices ? 10 : 0;
      const finalScore = Math.min(100, scoreBase + bonusCompletitud);

      // Determinar nivel basado en rendimiento
      let nivelJuego = 'basico';
      if (finalScore >= 80 && matricesCompletadas >= totalMatrices * 0.8) {
        nivelJuego = 'avanzado';
      } else if (finalScore >= 60 && matricesCompletadas >= totalMatrices * 0.6) {
        nivelJuego = 'intermedio';
      }

      // Calcular respuestas correctas
      const respuestasCorrectas = respuestasDetalladas.filter(r => r.correcta).length;

      const resultData = {
        userId: user.uid,
        gameId: 'matrices_progresivas',
        cognitiveDomain: 'razonamiento_abstracto',
        level: nivelJuego,
        score: finalScore,
        timeSpent: tiempoTranscurrido,
        correctAnswers: respuestasCorrectas,
        totalQuestions: matricesCompletadas,
        details: {
          puntuacionBruta: puntuacion,
          matricesCompletadas: matricesCompletadas,
          totalMatrices: totalMatrices,
          porcentajeCompletado: porcentajeCompletado,
          fallosSeguidos: fallosSeguidos,
          nivelMaximo: nivel,
          razonTermino: tiempo <= 0 ? 'tiempo_agotado' : 
                       (fallosSeguidos >= 3 ? 'demasiados_errores' : 
                       (matricesCompletadas === totalMatrices ? 'completado' : 'usuario_salio')),
          respuestasDetalladas: respuestasDetalladas,
          tiempoPromedioPorMatriz: matricesCompletadas > 0 ? 
            Math.round((tiempoTranscurrido / matricesCompletadas) * 100) / 100 : 0
        }
      };

      // Guardar resultado del juego
      await gameService.saveGameResult(resultData);
      
      // Actualizar progreso del usuario en el dominio cognitivo
      await userService.updateUserProgress(user.uid, 'razonamiento_abstracto', finalScore);
      
      console.log('Resultado del Juego 2 guardado exitosamente');
      setResultadoGuardado(true);
      
    } catch (error) {
      console.error('Error guardando resultado del Juego 2:', error);
    }
  }, [user, tiempoInicio, indiceActual, puntuacion, nivel, tiempo, fallosSeguidos, respuestasDetalladas]);

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

  // Nivel dinámico
  useEffect(() => {
    if (!patronActual) return;

    if (patronActual.nivel === 0) {
      setNivel(0);
    } else {
      const inicio3x3 = patrones.findIndex(p => p.nivel === 1);
      const posicionAbsoluta = indiceActual - inicio3x3;
      const nuevoNivel = Math.floor(posicionAbsoluta / 3) + 1;
      setNivel(nuevoNivel);
    }
  }, [indiceActual, patronActual]);

  // Temporizador
  useEffect(() => {
    if (!patronActual || patronActual.nivel === 0 || juegoTerminado) return;

    if (tiempo > 0) {
      const timer = setTimeout(() => setTiempo(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIndiceActual(patrones.length); // Terminar juego
    }
  }, [tiempo, patronActual, juegoTerminado]);

  const reiniciarJuego = () => {
    setIndiceActual(0);
    setTiempo(30);
    setPuntuacion(0);
    setNivel(0);
    setFallosSeguidos(0);
    setEstadoOpciones([]);
    setResultadoGuardado(false);
    setRespuestasDetalladas([]);
    setTiempoInicio(Date.now());
  };

  const manejarSeleccion = (indiceSeleccionado) => {
    if (juegoTerminado) return;

    const esCorrecta = verificarRespuesta(indiceSeleccionado, patronActual.correct);

    // Registrar respuesta detallada
    const nuevaRespuesta = {
      matriceId: patronActual.id,
      nivel: patronActual.nivel,
      respuestaUsuario: indiceSeleccionado,
      respuestaCorrecta: patronActual.correct,
      correcta: esCorrecta,
      tiempoRespuesta: Date.now() - tiempoInicio,
      tiempoRestante: tiempo
    };
    setRespuestasDetalladas(prev => [...prev, nuevaRespuesta]);

    const nuevosEstados = patronActual.options.map((_, idx) =>
      idx === indiceSeleccionado ? (esCorrecta ? "correct" : "incorrect") : ""
    );
    setEstadoOpciones(nuevosEstados);

    setTimeout(() => {
      setEstadoOpciones([]);

      if (esCorrecta) {
        setFallosSeguidos(0);

        let puntosGanados = 1;
        if (!esEnsayo) {
          const inicio3x3 = patrones.findIndex(p => p.nivel === 1);
          const posicionAbsoluta = indiceActual - inicio3x3;
          const bloqueDeDos = Math.floor(posicionAbsoluta / 2);
          puntosGanados = bloqueDeDos * 2;
          if (puntosGanados === 0) puntosGanados = 2;
        }

        setPuntuacion(p => p + puntosGanados);
        setIndiceActual(prev => prev + 1);

        if (!esEnsayo) {
          const inicio3x3 = patrones.findIndex(p => p.nivel === 1);
          const posicionAbsoluta = indiceActual - inicio3x3;
          const nuevoTiempo = Math.max(5, 30 - Math.floor(posicionAbsoluta / 2) * 2);
          setTiempo(nuevoTiempo);
        }
      } else {
        setFallosSeguidos(prev => {
          const nuevosFallos = prev + 1;
          if (nuevosFallos >= 3) {
            setIndiceActual(patrones.length);
          }
          return nuevosFallos;
        });
      }
    }, 1000);
  };

  const generarAnalisis = () => {
    const porcentajeCompletado = (indiceActual / patrones.length) * 100;
    const respuestasCorrectas = respuestasDetalladas.filter(r => r.correcta).length;
    const porcentajeAciertos = respuestasDetalladas.length > 0 ? 
      Math.round((respuestasCorrectas / respuestasDetalladas.length) * 100) : 0;

    if (indiceActual === patrones.length || fallosSeguidos >= 3) {
      if (porcentajeCompletado === 100) {
        return `¡Excelente! Has completado todas las matrices con ${porcentajeAciertos}% de precisión, demostrando una gran capacidad de razonamiento lógico y abstracción.`;
      } else if (porcentajeCompletado >= 75) {
        return `Buen trabajo. Has completado ${Math.round(porcentajeCompletado)}% de las matrices con ${porcentajeAciertos}% de precisión. Sigue practicando para mejorar.`;
      } else if (fallosSeguidos >= 3) {
        return `Has cometido tres errores consecutivos. Completaste ${Math.round(porcentajeCompletado)}% con ${porcentajeAciertos}% de precisión. Analiza más cuidadosamente los patrones.`;
      } else {
        return `Completaste ${Math.round(porcentajeCompletado)}% de las matrices con ${porcentajeAciertos}% de precisión. Sigue practicando para mejorar tu razonamiento lógico.`;
      }
    } else if (tiempo <= 0) {
      return `Se te acabó el tiempo. Completaste ${Math.round(porcentajeCompletado)}% con ${porcentajeAciertos}% de precisión. Intenta ser más rápido identificando patrones.`;
    }
    return "";
  };

  const InstruccionesJuego2 = () => (
    <div style={{ textAlign: 'left', fontSize: '16px', lineHeight: '1.6', color: '#34495e' }}>
      <h3 style={{ color: '#3498db', marginBottom: '15px' }}>¿Cómo funciona?</h3>
      <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
        <li style={{ marginBottom: '8px' }}>Se te muestra una matriz de diferentes tamaños con patrones abstractos</li>
        <li style={{ marginBottom: '8px' }}>Tu tarea es <strong>completar el patrón</strong> seleccionando la opción correcta</li>
        <li style={{ marginBottom: '8px' }}>La opción elegida debe completar el cuadrado inferior derecho</li>
      </ul>

      <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>Reglas del juego:</h3>
      <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
        <li style={{ marginBottom: '8px' }}>Analiza los <strong>patrones y relaciones</strong> entre las figuras</li>
        <li style={{ marginBottom: '8px' }}>Si fallas <strong>3 veces seguidas</strong>, el juego termina</li>
        <li style={{ marginBottom: '8px' }}>El tiempo disponible <strong>se reduce</strong> conforme avanzas</li>
        <li style={{ marginBottom: '8px' }}>La dificultad aumenta progresivamente</li>
      </ul>
    </div>
  );

  const iniciarJuego = () => {
    setJuegoIniciado(true);
  };


  return (
    <GameLayout
      title="Juego de Matrices Progresivas"
      showInstructions={!juegoIniciado}
      instructions={<InstruccionesJuego2 />}
      onStartGame={iniciarJuego}
      description={juegoIniciado ? (
        <div>
          <p>Selecciona la opción que completa la matriz lógica.</p>
          <p>Analiza patrones y relaciones para elegir correctamente.</p>
          {esEnsayo && <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>Ejercicio de práctica</p>}
        </div>
      ) : null}
      stats={{
        nivel,
        puntuacion,
        fallos: fallosSeguidos,
        tiempo: esEnsayo ? "--" : tiempo
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: indiceActual === patrones.length,
        level: nivel,
        score: puntuacion,
        mistakes: fallosSeguidos,
        timeRemaining: tiempo
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
      onFallo={fallosSeguidos}
      onCorrectAnswer={puntuacion}
    >
      {!juegoTerminado ? (
        <div className="juego-container">
          {/* Matriz centrada */}
          <div className="matriz-container">
            <div className={`grid-matriz grid-cols-${Math.sqrt(patronActual.grid.length)}`}>
              {patronActual.grid.map((img, index) => (
                <div key={index} className="grid-cell">
                  <img src={img} alt={`matriz-${index}`} className="imagen-matriz" />
                </div>
              ))}
            </div>
          </div>

          {/* Opciones con scroll horizontal */}
          <div className="options-container">
            <div className="options-scroll">
              {patronActual.options.map((img, index) => (
                <button
                  key={index}
                  className={`option-btn ${estadoOpciones[index] || ""}`}
                  onClick={() => manejarSeleccion(index)}
                >
                  <img src={img} alt={`opción ${index + 1}`} className="imagen-opcion" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Mostrar estado de guardado cuando termine el juego
        <div className="juego-container">
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

export default Juego2;