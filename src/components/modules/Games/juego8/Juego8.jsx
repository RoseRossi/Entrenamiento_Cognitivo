// Juego8.jsx (finaliza el juego tras 3 fallos en un solo ejercicio)
import React, { useState, useEffect, useCallback } from "react";
import { generarEjercicios, verificarRespuesta } from "./juego8_funciones";
import "./juego8_estilos.css";
import GameLayout from "../GameLayout";

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
  
  const ejercicio = ejercicios[indiceActual];

  const mostrarSecuenciaEjercicio = useCallback(() => {
    setMostrarSecuencia(true);
    setRespuestaUsuario([]);
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
      setTiempoBase(15); // o el valor correcto para ese intento
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
    setTiempoBase(30); // o el valor para nuevos ejercicios
    setTiempo(30);
    setMensaje("");
  };

  const verificarYProcesar = () => {
    const esCorrecta = verificarRespuesta(respuestaUsuario, ejercicio.secuencia);

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
    const porcentaje = Math.round((puntosTotales / puntosMaximos) * 100);
    return `Obtuviste ${puntosTotales} de ${puntosMaximos} puntos posibles. Rendimiento: ${porcentaje}%.`;
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
    window.location.reload();
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
        fallos: (indiceActual * 3) - puntosTotales,
        tiempo: mostrarSecuencia ? tiempoBase : tiempo
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: !juegoTerminado ? false : true,
        level: ejercicio?.amplitud - 1,
        score: puntosTotales,
        mistakes: puntosMaximos - puntosTotales,
        timeRemaining: tiempo
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
      onFallo={falloContador}
      onCorrectAnswer={puntosTotales}
    >
      {!juegoTerminado && ejercicio && (
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
    </GameLayout>
  );
};

export default Juego8;

