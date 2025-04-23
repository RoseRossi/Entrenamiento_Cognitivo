import React, { useState, useEffect } from "react";
import { patrones, verificarRespuesta } from "./juego2_funciones";
import "./juego2_estilos.css";
import GameLayout from "../GameLayout";

const Juego2 = () => {
  const [indiceActual, setIndiceActual] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [nivel, setNivel] = useState(0);
  const [tiempo, setTiempo] = useState(30);
  const [estadoOpciones, setEstadoOpciones] = useState([]);
  const [fallosSeguidos, setFallosSeguidos] = useState(0);

  const patronActual = indiceActual < patrones.length ? patrones[indiceActual] : null;
  const esEnsayo = patronActual?.nivel === 0;
  const juegoTerminado = !patronActual;

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
  };

  const manejarSeleccion = (indiceSeleccionado) => {
    if (juegoTerminado) return;

    const esCorrecta = verificarRespuesta(indiceSeleccionado, patronActual.correct);

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
    if (indiceActual === patrones.length || fallosSeguidos >= 3) {
      const porcentajeCompletado = (indiceActual / patrones.length) * 100;
  
      if (porcentajeCompletado === 100) {
        return "¡Excelente! Has completado todas las matrices demostrando una gran capacidad de razonamiento lógico y abstracción.";
      } else if (porcentajeCompletado >= 75) {
        return "Buen trabajo. Has completado la mayoría de las matrices. Sigue practicando para mejorar tu precisión y rapidez en la identificación de patrones.";
      } else if (fallosSeguidos >= 3) {
        return "Has cometido tres errores consecutivos, lo que ha finalizado la prueba. Intenta analizar con más cuidado los patrones antes de responder en futuras partidas.";
      } else {
        return "Has completado una parte de las pruebas. Sigue practicando para mejorar tu razonamiento lógico y tu capacidad de resolver problemas abstractos.";
      }
    } else if (tiempo <= 0) {
      return "Se te acabó el tiempo. Intenta ser más rápido identificando los patrones en las matrices para completar más ensayos.";
    }
    return "";
  };

  return (
    <GameLayout
      title="Juego de Matrices Progresivas"
      description={
        <div>
          <p>Selecciona la opción que completa la matriz lógica.</p>
          <p>Analiza patrones y relaciones para elegir correctamente.</p>
        </div>
      }
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
    >
      {!juegoTerminado && (
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
      )}
    </GameLayout>
  );
};

export default Juego2;