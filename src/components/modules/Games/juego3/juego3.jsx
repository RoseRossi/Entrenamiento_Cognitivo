import React, { useState, useEffect } from "react";
import "./juego3_estilos.css";
import { palabrasOriginales, generarMarDePalabras } from "./juego3_funciones";

const Juego3 = () => {
  const [palabraActual, setPalabraActual] = useState("");
  const [indicePalabra, setIndicePalabra] = useState(0);
  const [ronda, setRonda] = useState(1);
  const [mostrarMarDePalabras, setMostrarMarDePalabras] = useState(false);
  const [palabrasSeleccionadas, setPalabrasSeleccionadas] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [marDePalabras, setMarDePalabras] = useState([]);

  useEffect(() => {
    if (ronda <= 3) {
      const intervalo = setInterval(() => {
        if (indicePalabra < palabrasOriginales.length) {
          setPalabraActual(palabrasOriginales[indicePalabra]);
          setIndicePalabra(indicePalabra + 1);
        } else {
          clearInterval(intervalo);
          setTimeout(() => {
            if (ronda < 3) {
              setIndicePalabra(0);
              setPalabraActual("");
              setRonda(ronda + 1);
            } else {
              setMostrarMarDePalabras(true);
              setMarDePalabras(generarMarDePalabras());
            }
          }, 1000);
        }
      }, 1000);

      return () => clearInterval(intervalo);
    }
  }, [indicePalabra, ronda]);

  const seleccionarPalabra = (palabra) => {
    if (!palabrasSeleccionadas.includes(palabra)) {
      setPalabrasSeleccionadas([...palabrasSeleccionadas, palabra]);
    }
  };

  const verificarResultados = () => {
    const correctas = palabrasSeleccionadas.filter((p) => palabrasOriginales.includes(p));
    setResultado({ correctas, total: palabrasSeleccionadas.length });
  };

  return (
    <div className="juego2-container">
      {!mostrarMarDePalabras ? (
        <div className="presentacion">
          <h2>Ronda {ronda}</h2>
          <div className="palabra">{palabraActual}</div>
        </div>
      ) : (
        <div className="seleccion">
          <h2>Selecciona las palabras que recuerdas</h2>
          <div className="palabras-grid">
            {marDePalabras.map((palabra, index) => (
              <button
                key={index}
                onClick={() => seleccionarPalabra(palabra)}
                className={palabrasSeleccionadas.includes(palabra) ? "seleccionada" : ""}
              >
                {palabra}
              </button>
            ))}
          </div>
          <button className="verificar" onClick={verificarResultados}>Verificar</button>
          {resultado && (
            <div className="resultado">
              <p>Palabras correctas: {resultado.correctas.length}</p>
              <p>Total seleccionadas: {resultado.total}</p>
              <p>Correctas: {resultado.correctas.join(", ")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Juego3;