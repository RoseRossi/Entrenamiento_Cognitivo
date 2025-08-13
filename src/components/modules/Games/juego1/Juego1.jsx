import React, { useState, useEffect, useCallback } from "react";
import GameLayout from "../GameLayout";
import { generarFormacion, verificarRespuesta } from "./juego1_funciones";
import { auth } from "../../../../services/firebase/firebaseConfig";
import { gameService } from "../../../../services/firebase/gameService";
import { userService } from "../../../../services/firebase/userService";
import "./juego1_estilos.css";

const Juego1 = () => {
  const [shapes, setShapes] = useState({});
  const [statement, setStatement] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [puntuacion, setPuntuacion] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [tiempo, setTiempo] = useState(30);
  const [fallos, setFallos] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [rondasCompletadas, setRondasCompletadas] = useState(0);
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [resultadoGuardado, setResultadoGuardado] = useState(false);

  // Usar useCallback para estabilizar la función guardarResultado
  const guardarResultado = useCallback(async () => {
    if (!user) {
      console.log('No hay usuario autenticado para guardar resultado');
      return;
    }

    try {
      console.log('Guardando resultado del Juego 1...');
      
      const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000); // en segundos
      const porcentajeAciertos = rondasCompletadas > 0 ? Math.round((puntuacion / rondasCompletadas) * 100) : 0;
      
      // Determinar nivel basado en rendimiento
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
          tiempoLimite: 30,
          razonTermino: tiempo <= 0 ? 'tiempo_agotado' : (fallos >= 3 ? 'demasiados_errores' : 'completado'),
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
  }, [user, tiempoInicio, rondasCompletadas, puntuacion, fallos, tiempo, nivel]);

  useEffect(() => {
    // Obtener usuario autenticado
    setUser(auth.currentUser);
    setTiempoInicio(Date.now());
    
    nuevaRonda();
    const timer = setInterval(() => {
      setTiempo(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setJuegoTerminado(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Guardar resultado cuando el juego termine
  useEffect(() => {
    if (juegoTerminado && !resultadoGuardado && user && tiempoInicio) {
      guardarResultado();
    }
  }, [juegoTerminado, resultadoGuardado, user, tiempoInicio, guardarResultado]);

  const nuevaRonda = () => {
    const { nuevaFormacion, nuevaDeclaracion } = generarFormacion();
    setShapes(nuevaFormacion);
    setStatement(nuevaDeclaracion);
    setIsCorrect(null);
    setRondasCompletadas(prev => prev + 1);
  };

  const manejarRespuesta = (respuestaUsuario) => {
    if (juegoTerminado) return;
    
    const correcto = verificarRespuesta(statement, shapes, respuestaUsuario);
    setIsCorrect(correcto);
    
    if (correcto) {
      setPuntuacion(prev => prev + 1);
      setNivel(prev => prev + 1);
      setFallos(0);
    } else {
      const nuevosFallos = fallos + 1;
      setFallos(nuevosFallos);
      
      if (nuevosFallos >= 3) {
        setJuegoTerminado(true);
      }
    }
    
    setTimeout(() => {
      if (!juegoTerminado && fallos < 2) { // Solo continuar si no se termina el juego
        nuevaRonda();
      }
    }, 1000);
  };

  const reiniciarJuego = () => {
    setShapes({});
    setStatement("");
    setIsCorrect(null);
    setPuntuacion(0);
    setNivel(1);
    setTiempo(30);
    setFallos(0);
    setJuegoTerminado(false);
    setRondasCompletadas(0);
    setResultadoGuardado(false);
    setTiempoInicio(Date.now());
    nuevaRonda();
  };

  const generarAnalisis = () => {
    const porcentajeAciertos = rondasCompletadas > 0 ? Math.round((puntuacion / rondasCompletadas) * 100) : 0;
    
    if (juegoTerminado && tiempo <= 0) {
      return "Se te acabó el tiempo. Intenta responder más rápido manteniendo la precisión.";
    }
    
    if (fallos >= 3) {
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

  return (
    <GameLayout
      title="Juego de Formas Lógicas"
      description="Determina si la afirmación sobre la posición de las formas es verdadera o falsa."
      stats={{
        nivel,
        puntuacion,
        fallos,
        tiempo
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: rondasCompletadas >= 10, // Ejemplo de condición de completitud
        level: nivel,
        score: puntuacion,
        mistakes: fallos,
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
            {!shapes.squareRight ? (
              <>
                <div className="triangle"></div>
                <div className="square"></div>
              </>
            ) : (
              <>
                <div className="square"></div>
                <div className="triangle"></div>
              </>
            )}
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