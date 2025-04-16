import React, { useState, useEffect } from 'react';
import GameLayout from '../GameLayout';
import { niveles, obtenerEnsayo, verificarRespuesta } from './juego4_funciones';
import './juego4_estilos.css';

const Juego4 = () => {
  const [nivelActual, setNivelActual] = useState(1);
  const [puntuacion, setPuntuacion] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(niveles[0].tiempo);
  const [ensayoActual, setEnsayoActual] = useState(null);
  const [respuestasIncorrectas, setRespuestasIncorrectas] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [todosNivelesCompletados, setTodosNivelesCompletados] = useState(false);

  useEffect(() => {
    const nuevoEnsayo = obtenerEnsayo(nivelActual);
    setEnsayoActual(nuevoEnsayo);
  }, [nivelActual]);

  const manejarSeleccion = (opcion) => {
    if (juegoTerminado) return;

    const esCorrecta = verificarRespuesta(ensayoActual, opcion);

    if (esCorrecta) {
      const nuevaPuntuacion = puntuacion + 1;
      setPuntuacion(nuevaPuntuacion);
      setRespuestasIncorrectas(0);

      if (nivelActual === niveles.length && nuevaPuntuacion % 3 === 0) {
        setJuegoTerminado(true);
        setTodosNivelesCompletados(true);
        return;
      }

      if (nuevaPuntuacion > 0 && nuevaPuntuacion % 3 === 0 && nivelActual < niveles.length) {
        setNivelActual(nivelActual + 1);
        setTiempoRestante(niveles[nivelActual].tiempo);
      } else {
        const nuevoEnsayo = obtenerEnsayo(nivelActual);
        setEnsayoActual(nuevoEnsayo);
      }
    } else {
      const nuevasIncorrectas = respuestasIncorrectas + 1;
      setRespuestasIncorrectas(nuevasIncorrectas);

      if (nuevasIncorrectas >= 3) {
        setJuegoTerminado(true);
        setTodosNivelesCompletados(false);
      } else {
        const nuevoEnsayo = obtenerEnsayo(nivelActual);
        setEnsayoActual(nuevoEnsayo);
      }
    }
  };

  useEffect(() => {
    if (juegoTerminado) return;
    
    const timer = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setJuegoTerminado(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [juegoTerminado]);

  const reiniciarJuego = () => {
    setNivelActual(1);
    setPuntuacion(0);
    setTiempoRestante(niveles[0].tiempo);
    setRespuestasIncorrectas(0);
    setJuegoTerminado(false);
    setTodosNivelesCompletados(false);
    setEnsayoActual(obtenerEnsayo(1));
  };

  const generarAnalisis = () => {
    if (todosNivelesCompletados) {
      return "¡Excelente trabajo! Has completado todos los niveles demostrando un gran entendimiento de los patrones lógicos en las balanzas.";
    }
    
    const porcentajeAciertos = (puntuacion / (puntuacion + respuestasIncorrectas)) * 100;
    
    if (porcentajeAciertos >= 80) {
      return "Buen desempeño. Reconoces bien los patrones pero podrías mejorar tu velocidad de respuesta.";
    } else if (porcentajeAciertos >= 50) {
      return "Desempeño regular. Intenta analizar con más cuidado las relaciones entre las figuras antes de responder.";
    } else {
      return "Necesitas practicar más. Presta atención a las cantidades y tipos de figuras en cada lado de la balanza.";
    }
  };

  return (
    <GameLayout
      title="Juego de Balanzas"
      description="Selecciona la opción que equilibre la balanza según los patrones mostrados"
      stats={{
        nivel: juegoTerminado ? (todosNivelesCompletados ? niveles.length : nivelActual) : nivelActual,
        puntuacion,
        fallos: respuestasIncorrectas,
        tiempo: juegoTerminado ? 0 : tiempoRestante
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: todosNivelesCompletados,
        level: nivelActual,
        score: puntuacion,
        mistakes: respuestasIncorrectas,
        timeRemaining: tiempoRestante
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
    >
      {!juegoTerminado && (
        <div className="juego4-container">
          <div className="balanzas-container">
            <div className="balanza">
              <div className="lado-izquierdo">
                {ensayoActual?.balanza1.izquierda.map((item, index) => (
                  <div key={index} className="grupo-figuras">
                    <span className="contador-figuras">{item.cantidad} ×</span>
                    <div className="contenedor-figuras">
                      {Array(item.cantidad).fill().map((_, i) => (
                        <div key={i} className={`figura-individual ${item.figura}`}></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="separador">=</div>
              <div className="lado-derecho">
                {ensayoActual?.balanza1.derecha.map((item, index) => (
                  <div key={index} className="grupo-figuras">
                    <span className="contador-figuras">{item.cantidad} ×</span>
                    <div className="contenedor-figuras">
                      {Array(item.cantidad).fill().map((_, i) => (
                        <div key={i} className={`figura-individual ${item.figura}`}></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="balanza">
              <div className="lado-izquierdo">
                {ensayoActual?.balanza2.izquierda.map((item, index) => (
                  <div key={index} className="grupo-figuras">
                    <span className="contador-figuras">{item.cantidad} ×</span>
                    <div className="contenedor-figuras">
                      {Array(item.cantidad).fill().map((_, i) => (
                        <div key={i} className={`figura-individual ${item.figura}`}></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="separador">=</div>
              <div className="lado-derecho">
                {ensayoActual?.balanza2.derecha.map((item, index) => (
                  <div key={index} className="grupo-figuras">
                    <span className="contador-figuras">{item.cantidad} ×</span>
                    <div className="contenedor-figuras">
                      {Array(item.cantidad).fill().map((_, i) => (
                        <div key={i} className={`figura-individual ${item.figura}`}></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="balanza problema">
              <div className="lado-izquierdo">
                {ensayoActual?.problema.izquierda.map((item, index) => (
                  <div key={index} className="grupo-figuras">
                    <span className="contador-figuras">{item.cantidad} ×</span>
                    <div className="contenedor-figuras">
                      {Array(item.cantidad).fill().map((_, i) => (
                        <div key={i} className={`figura-individual ${item.figura}`}></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="separador">=</div>
              <div className="lado-derecho">
                <div className="interrogante">?</div>
              </div>
            </div>
          </div>

          <div className="opciones-container">
            <p className="pregunta">¿Qué equilibrará la balanza?</p>
            <div className="opciones">
              {ensayoActual?.opciones.map((opcion, index) => (
                <button 
                  key={index} 
                  className="opcion" 
                  onClick={() => manejarSeleccion(opcion)}
                >
                  <div className="contenedor-figuras">
                    <span className="contador-figuras">{opcion.cantidad} ×</span>
                    <div className={`figura-individual ${opcion.figura}`}></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </GameLayout>
  );
};

export default Juego4;