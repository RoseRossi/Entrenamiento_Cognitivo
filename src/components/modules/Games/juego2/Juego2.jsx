import React, { useState, useEffect } from "react";
import { patrones, verificarRespuesta } from "./juego2_funciones";
import "./juego2_estilos.css";

const Juego2 = () => {
  const [indiceActual, setIndiceActual] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [tiempo, setTiempo] = useState(30);

  useEffect(() => {
    if (puntuacion >= 2) {
      setNivel(n => n + 1); 
      setTiempo(20); 
    }
  }, [puntuacion]); 
  

  useEffect(() => {
    if (tiempo > 0) {
      const timer = setTimeout(() => setTiempo(tiempo - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      alert("¡Se acabó el tiempo!");
      setIndiceActual(0);
      setPuntuacion(0);
      setNivel(1);
      setTiempo(30);
    }
  }, [tiempo]);

  if (indiceActual >= patrones.length) {
    return (
      <div className="juego-container">
        <h2>¡Felicidades! Has completado todas las pruebas.</h2>
        <p>Puntuación final: {puntuacion}</p>
        <button
          onClick={() => {
            setIndiceActual(0);
            setTiempo(30);
            setPuntuacion(0);
            setNivel(1);
          }}
        >
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
      setTiempo(Math.max(10, 30 - nivel * 5)); // Reinicia el tiempo y ajusta por nivel
    } else {
      alert("Respuesta incorrecta. Intenta de nuevo.");
    }
  };

  const obtenerMatriz = () => {
    return nivel >= 2 ? 4 : 3; // 3x3 en nivel 1, 4x4 en nivel 2
  };
  
  return (
    <div className="juego-container">
      <h1>Juego de Matrices Progresivas</h1>
      <p>Puntuación: {puntuacion}</p>
      <p>Nivel: {nivel}</p>
      <p>Tiempo restante: {tiempo}s</p>
  
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${obtenerMatriz()}, 80px)`, // Corrige el tamaño de la cuadrícula
          gridTemplateRows: `repeat(${obtenerMatriz()}, 80px)`, // Asegura filas correctas
        }}
      >
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
