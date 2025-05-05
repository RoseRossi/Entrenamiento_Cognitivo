import React, { useState, useEffect, useCallback } from "react";
import { patrones, verificarRespuesta } from "./juego8_funciones";
import "./juego8_estilos.css";
import GameLayout from "../GameLayout";

const Juego8 = () => {
  const [nivel, setNivel] = useState(1);
  const [puntuacion, setPuntuacion] = useState(0);
  const [tiempo, setTiempo] = useState(5);
  const [fallosSeguidos, setFallosSeguidos] = useState(0);
  const [respuestaUsuario, setRespuestaUsuario] = useState([]);
  const [mostrarSecuencia, setMostrarSecuencia] = useState(true);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [celdasActivas, setCeldasActivas] = useState([]);

  const patronActual = patrones.find(p => p.nivel === nivel);

  const reiniciarNivel = useCallback(() => {
    setMostrarSecuencia(true);
    setRespuestaUsuario([]);
    setTiempo(5);
  }, []);

  const reiniciarJuego = () => {
    setNivel(1);
    setPuntuacion(0);
    setTiempo(5);
    setFallosSeguidos(0);
    setRespuestaUsuario([]);
    setMostrarSecuencia(true);
    setJuegoTerminado(false);
    setCeldasActivas([]);
  };

  const manejarSeleccion = (posicion) => {
    if (mostrarSecuencia || juegoTerminado) return;
    setRespuestaUsuario([...respuestaUsuario, posicion]);
  };

  const manejarRespuestaIncompleta = useCallback(() => {
    const nuevosFallos = fallosSeguidos + 1;
    setFallosSeguidos(nuevosFallos);

    if (nuevosFallos >= 3) {
      setJuegoTerminado(true);
    } else {
      reiniciarNivel();
    }
  }, [fallosSeguidos, reiniciarNivel]);

  const verificarYAvanzar = () => {
    const esCorrecta = verificarRespuesta(respuestaUsuario, patronActual.secuencia);

    if (esCorrecta) {
      setPuntuacion(p => p + nivel * 2);
      setFallosSeguidos(0);

      if (nivel >= patrones.length) {
        setJuegoTerminado(true);
      } else {
        setNivel(n => n + 1);
      }
    } else {
      const nuevosFallos = fallosSeguidos + 1;
      setFallosSeguidos(nuevosFallos);

      if (nuevosFallos >= 3) {
        setJuegoTerminado(true);
      } else {
        reiniciarNivel();
      }
    }
  };

  const generarAnalisis = () => {
    if (juegoTerminado) {
      if (nivel > patrones.length) {
        return "¡Excelente! Dominaste todos los niveles de memoria inversa.";
      } else if (fallosSeguidos >= 3) {
        return "Has cometido tres errores seguidos. Practica más para mejorar tu memoria inversa.";
      } else {
        return `Llegaste al nivel ${nivel}. Sigue entrenando para superar el nivel ${patrones.length}.`;
      }
    }
    return "";
  };

  useEffect(() => {
    if (!patronActual || juegoTerminado) return;

    setMostrarSecuencia(true);
    setRespuestaUsuario([]);
    setCeldasActivas([]);

    patronActual.secuencia.forEach((pos, i) => {
      setTimeout(() => {
        setCeldasActivas([pos]);
        setTimeout(() => {
          setCeldasActivas([]);
        }, 500);
      }, i * 800);
    });

    const totalDuracion = patronActual.secuencia.length * 800;
    const timer = setTimeout(() => {
      setMostrarSecuencia(false);
      setTiempo(5);
    }, totalDuracion);

    return () => clearTimeout(timer);
  }, [nivel, juegoTerminado, patronActual]);

  useEffect(() => {
    if (mostrarSecuencia || juegoTerminado) return;

    const timer = setTimeout(() => {
      if (tiempo > 0) {
        setTiempo(t => t - 1);
      } else {
        manejarRespuestaIncompleta();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [tiempo, mostrarSecuencia, juegoTerminado, manejarRespuestaIncompleta]);

  const renderCuadricula = () => {
    return (
      <div className="cuadricula-memoria">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((pos) => (
          <button
            key={pos}
            className={`celda ${
              (mostrarSecuencia && celdasActivas.includes(pos)) ? "activo" : ""
            } ${
              respuestaUsuario.includes(pos) ? "seleccionado" : ""
            }`}
            onClick={() => manejarSeleccion(pos)}
            disabled={mostrarSecuencia}
          />
        ))}
      </div>
    );
  };

  return (
    <GameLayout
      title="Memoria Visoespacial Inversa"
      description={
        <>
          <p>Memoriza la secuencia de círculos y repítela en orden inverso.</p>
          <p>Tienes {tiempo} segundos para responder después de ver la secuencia.</p>
        </>
      }
      stats={{
        nivel,
        puntuacion,
        fallos: fallosSeguidos,
        tiempo: mostrarSecuencia ? "--" : tiempo
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: nivel > patrones.length,
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
      {!juegoTerminado && patronActual && (
        <div className="juego8-container">
          <div className="instruccion">
            {patronActual.instruccion}
          </div>

          {renderCuadricula()}

          {!mostrarSecuencia && (
            <button 
              className="boton-verificar"
              onClick={verificarYAvanzar}
              disabled={respuestaUsuario.length === 0}
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
