import React, { useEffect, useState } from "react";
import GameLayout from "../GameLayout";
import "./juego7_estilo.css";
import { generarCirculos, generarSecuencia } from "./juego7_funciones";

const Juego7 = () => {
  const [circulos, setCirculos] = useState([]);
  const [secuencia, setSecuencia] = useState([]);
  const [resaltando, setResaltando] = useState(false);
  const [respuesta, setRespuesta] = useState([]);
  const [amplitud, setAmplitud] = useState(3);
  const [fallos, setFallos] = useState(0);
  const [ensayos, setEnsayos] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  useEffect(() => {
    setCirculos(generarCirculos(10));
  }, []);

  useEffect(() => {
    if (circulos.length > 0) iniciarEnsayo();
  }, [circulos]);

  const iniciarEnsayo = () => {
    const nuevaSecuencia = generarSecuencia(circulos.length, amplitud);
    setSecuencia(nuevaSecuencia);
    setRespuesta([]);
    setResaltando(true);
    nuevaSecuencia.forEach((i, index) => {
      setTimeout(() => {
        document.getElementById(`circulo-${i}`).classList.add("resaltado");
        setTimeout(() => {
          document.getElementById(`circulo-${i}`).classList.remove("resaltado");
          if (index === nuevaSecuencia.length - 1) setResaltando(false);
        }, 333);
      }, index * 666);
    });
  };

  const manejarClick = (index) => {
    if (resaltando || respuesta.length >= secuencia.length || juegoTerminado) return;
    const nuevaRespuesta = [...respuesta, index];
    setRespuesta(nuevaRespuesta);

    if (nuevaRespuesta.length === secuencia.length) {
      const correcta = secuencia.every((val, i) => val === nuevaRespuesta[i]);
      if (correcta) {
        const nuevosEnsayos = ensayos + 1;
        setEnsayos(nuevosEnsayos);
        if (nuevosEnsayos % 3 === 0) setAmplitud(amplitud + 1);
        iniciarEnsayo();
      } else {
        const nuevosFallos = fallos + 1;
        setFallos(nuevosFallos);
        if (nuevosFallos >= 2) setJuegoTerminado(true);
        else iniciarEnsayo();
      }
    }
  };

  const reiniciarJuego = () => {
    setCirculos(generarCirculos(10));
    setSecuencia([]);
    setRespuesta([]);
    setAmplitud(3);
    setFallos(0);
    setEnsayos(0);
    setJuegoTerminado(false);
  };

  const generarAnalisis = () => {
    if (fallos >= 2) return "Has cometido dos errores. Intenta concentrarte más en la secuencia visual.";
    if (ensayos >= 6) return "¡Buen trabajo! Has demostrado una excelente memoria visual.";
    return "Sigue practicando para mejorar tu capacidad de recordar secuencias visuales.";
  };

  return (
    <GameLayout
      title="Juego de Memoria Visual"
      description="Observa y repite la secuencia de los círculos en el orden correcto."
      stats={{ amplitud, fallos }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: ensayos >= 6,
        level: amplitud,
        score: ensayos,
        mistakes: fallos,
        timeRemaining: null,
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
      onFallo={fallos}
      onCorrectAnswer={ensayos}
    >
      <div className="area-circulos">
        {circulos.map((pos, index) => (
          <div
            key={index}
            id={`circulo-${index}`}
            className={`circulo ${!resaltando ? 'seleccionable' : ''}`}
            style={{ top: pos.top, left: pos.left }}
            onClick={() => manejarClick(index)}
          ></div>
        ))}
      </div>
    </GameLayout>
  );
};

export default Juego7;
