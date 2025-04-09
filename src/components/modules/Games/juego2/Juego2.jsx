import React, { useState, useEffect } from "react";
import { patrones, verificarRespuesta } from "./juego2_funciones";
import "./juego2_estilos.css";

const Juego2 = () => {
  const [indiceActual, setIndiceActual] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [nivel, setNivel] = useState(0);
  const [tiempo, setTiempo] = useState(30);
  const [estadoOpciones, setEstadoOpciones] = useState([]);
  const [fallosSeguidos, setFallosSeguidos] = useState(0); // NUEVO

  const patronActual = indiceActual < patrones.length ? patrones[indiceActual] : null;

  // useEffect para calcular el nivel dinámico
  useEffect(() => {
    if (!patronActual) return;

    if (patronActual.nivel === 0) {
      setNivel(0);
    } else {
      const inicio3x3 = patrones.findIndex(p => p.nivel === 1);
      const posicionAbsoluta = indiceActual - inicio3x3;
      const nuevoNivel = Math.floor(posicionAbsoluta / 5) + 1;
      setNivel(nuevoNivel);
    }
  }, [indiceActual, patronActual]);

  // useEffect para el tiempo regresivo
  useEffect(() => {
    if (!patronActual || patronActual.nivel === 0) return;
    if (tiempo > 0) {
      const timer = setTimeout(() => setTiempo(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      alert("¡Se acabó el tiempo!");
      setIndiceActual(0);
      setPuntuacion(0);
      setNivel(0);
      setTiempo(30);
      setFallosSeguidos(0);
    }
  }, [tiempo, patronActual]);

  if (!patronActual) {
    return (
      <div className="pantalla-final">
        <div className="tarjeta-final">
          <h2 className="titulo-final">¡Felicidades!</h2>
          <p className="mensaje-final">Has completado todas las pruebas.</p>
          <p className="puntuacion-final">Puntuación final: <strong>{puntuacion}</strong></p>
          <button
            className="boton-reiniciar"
            onClick={() => {
              setIndiceActual(0);
              setTiempo(30);
              setPuntuacion(0);
              setNivel(0);
              setFallosSeguidos(0);
            }}
          >
            Reiniciar juego
          </button>
        </div>
      </div>
    );
  }  

  const esEnsayo = patronActual.nivel === 0;

  const manejarSeleccion = (indiceSeleccionado) => {
    const esCorrecta = verificarRespuesta(indiceSeleccionado, patronActual.correct);

    const nuevosEstados = patronActual.options.map((_, idx) =>
      idx === indiceSeleccionado ? (esCorrecta ? "correct" : "incorrect") : ""
    );
    setEstadoOpciones(nuevosEstados);

    setTimeout(() => {
      setEstadoOpciones([]);

      if (esCorrecta) {
        setFallosSeguidos(0); // Reiniciar fallos al acertar

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
        // Aumentar el contador de fallos
        setFallosSeguidos(prev => {
          const nuevosFallos = prev + 1;
          if (nuevosFallos >= 3) {
            alert("Has fallado 3 veces seguidas. La subprueba ha finalizado.");
            setIndiceActual(patrones.length); // Termina el juego
          }
          return nuevosFallos;
        });
      }
    }, 1000);
  };

  return (
    <div className="juego-container">
      <h1  >Juego de Matrices Progresivas</h1>
       <div className="stats-container">
          <span>Puntuación: <strong>{puntuacion}</strong></span>
          <span>Nivel: <strong>{nivel}</strong></span>
          <span>Fallos: <strong>{fallosSeguidos}</strong></span>
          {!esEnsayo && <span>Tiempo: <strong>{tiempo}s</strong></span>}
        </div>

      <div className="grid">
        {patronActual.grid.map((img, index) => (
          <div key={index} className="grid-cell">
            <img src={img} alt={`matriz-${index}`} className="imagen-matriz" />
          </div>
        ))}
      </div>

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
  );
};

export default Juego2;
