import React, { useState, useEffect } from "react";
import { patrones, verificarRespuesta } from "./juego2_funciones";
import "./juego2_estilos.css";

const Juego2 = () => {
  const [indiceActual, setIndiceActual] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [tiempo, setTiempo] = useState(30); // Tiempo límite por pregunta

  useEffect(() => {
    if (tiempo > 0) {
      const timer = setTimeout(() => setTiempo(tiempo - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [tiempo]);

  // Check if there are no more patterns
  if (indiceActual >= patrones.length) {
    return (
      <div className="juego-container">
        <h2>¡Felicidades! Has completado todas las pruebas.</h2>
        <p>Puntuación final: {puntuacion}</p>
        <button onClick={() => { 
          setIndiceActual(0);
          setTiempo(30);
          setPuntuacion(0);
        }}>
          Reiniciar
        </button>
      </div>
    );
  }

  const patronActual = patrones[indiceActual];

  const manejarSeleccion = (opcion) => {
    if (verificarRespuesta(opcion, patronActual.correct)) {
      setPuntuacion(puntuacion + 1);
      setIndiceActual((prev) => prev + 1);
      setTiempo(30); // Reinicia el tiempo
    } else {
      alert("Respuesta incorrecta. Intenta de nuevo.");
    }
  };

  return (
    <div className="juego-container">
      <h1>Juego de Matrices Progresivas</h1>
      <p>Puntuación: {puntuacion}</p>
      <p>Tiempo restante: {tiempo}s</p>

      <div className="grid">
        {patronActual.grid.map((cell, index) => (
          <div key={index} className="grid-cell">
            {cell || "?"}
          </div>
        ))}
      </div>

      <div className="options">
        {patronActual.options.map((option, index) => (
          <button key={index} className="option-btn" onClick={() => manejarSeleccion(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Juego2;
