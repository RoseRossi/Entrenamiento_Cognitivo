import React, { useState, useEffect } from "react";
import GameLayout from "../GameLayout";
import { generarFormacion, verificarRespuesta } from "./juego1_funciones";
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

  useEffect(() => {
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
      if (!juegoTerminado) {
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
    nuevaRonda();
  };

  const generarAnalisis = () => {
    const porcentajeAciertos = puntuacion > 0 ? Math.round((puntuacion / rondasCompletadas) * 100) : 0;
    
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
      ) : null}
    </GameLayout>
  );
};

export default Juego1;