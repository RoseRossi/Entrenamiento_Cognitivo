import React, { useState, useEffect } from "react";
import "./juego1_estilos.css";
import { generarFormacion, verificarRespuesta } from "./juego1_funciones";

const Juego1 = () => {
  const [shapes, setShapes] = useState({});
  const [statement, setStatement] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    nuevaRonda();
  }, []);

  const nuevaRonda = () => {
    const { nuevaFormacion, nuevaDeclaracion } = generarFormacion();
    setShapes(nuevaFormacion);
    setStatement(nuevaDeclaracion);
    setIsCorrect(null);
  };

  const manejarRespuesta = (respuestaUsuario) => {
    setIsCorrect(verificarRespuesta(statement, shapes, respuestaUsuario));
  };

  return (
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
        <button onClick={() => manejarRespuesta(true)}>Verdadero</button>
        <button onClick={() => manejarRespuesta(false)}>Falso</button>
      </div>
      {isCorrect !== null && (
        <p className={`feedback ${isCorrect ? "correct" : "incorrect"}`}>
          {isCorrect ? "¡Correcto!" : "Incorrecto"}
        </p>
      )}
      <button className="new-round" onClick={nuevaRonda}>
        Nueva ronda
      </button>
    </div>
  );
};

export default Juego1;
