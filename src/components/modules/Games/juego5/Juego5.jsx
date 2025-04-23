import React, { useEffect, useState } from "react";
import GameLayout from "../GameLayout";
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
          setMostrarPregunta(true);
          setPreguntas(generarPreguntas(secuencia));
        }
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [indiceActual, mostrarPregunta, secuencia]);

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
  };

  const generarAnalisis = () => {
    const porcentaje = puntuacion > 0 ? Math.round((puntuacion / 40) * 100) : 0;
    if (tiempo <= 0) return "Se acabó el tiempo. Intenta responder más rápido.";
    if (fallos >= 3) return "Has cometido demasiados errores. Intenta concentrarte más.";
    if (porcentaje >= 90) return "¡Excelente memoria! Has demostrado gran precisión.";
    if (porcentaje >= 70) return "Muy bien. Aún puedes mejorar un poco más.";
    if (porcentaje >= 50) return "Buen intento. Revisa tu estrategia de memorización.";
    return "Necesitas más práctica para mejorar tu retención visual.";
  };

  return (
    <GameLayout
      title="Juego de Memoria Visual"
      description="Memoriza la secuencia de formas. Luego responde si viste o no cada una."
      stats={{
        nivel: 1,
        puntuacion,
        fallos,
        tiempo,
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: respuestas.length === 40,
        level: 1,
        score: puntuacion,
        mistakes: fallos,
        timeRemaining: tiempo,
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
    >
      {!mostrarPregunta ? (
        <div className="secuencia">
          <h2>Memoriza las formas</h2>
          {indiceActual < secuencia.length && (
            <div className="forma">{secuencia[indiceActual]}</div>
          )}
        </div>
      ) : (
        <div className="preguntas">
          <h2>¿Esta forma apareció?</h2>
          {preguntas.length > respuestas.length && (
            <div className="pregunta">
              <div className="forma">{preguntas[respuestas.length]}</div>
              <div className="buttons">
                <button onClick={() => responder(preguntas[respuestas.length], "sí")}>Sí</button>
                <button onClick={() => responder(preguntas[respuestas.length], "no")}>No</button>
              </div>
            </div>
          )}

          {resultado && (
            <div className="resultado">
              <p>Correctas: {resultado.correctas} de {resultado.total}</p>
            </div>
          )}
        </div>
      )}
    </GameLayout>
  );
};

export default Juego5;