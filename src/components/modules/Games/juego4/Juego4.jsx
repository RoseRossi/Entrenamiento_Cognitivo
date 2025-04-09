import React, { useState, useEffect } from 'react';
import './juego4_estilos.css';
import { niveles, obtenerEnsayo, verificarRespuesta } from './juego4_funciones';

const Juego4 = () => {
  const [nivelActual, setNivelActual] = useState(1);
  const [puntuacion, setPuntuacion] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(niveles[0].tiempo);
  const [ensayoActual, setEnsayoActual] = useState(null);
  const [respuestasIncorrectas, setRespuestasIncorrectas] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [todosNivelesCompletados, setTodosNivelesCompletados] = useState(false);

  // Iniciar el juego automáticamente al montar el componente
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

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="juego-container">
      {juegoTerminado ? (
        todosNivelesCompletados ? (
          <div className="pantalla-final-completo">
            <h1>¡Felicidades!</h1>
            <p>¡Has completado todas las pruebas</p>
            <p>Puntuación final: {puntuacion}</p>
            <div className="estadisticas">
              <p>Niveles completados: {niveles.length}</p>
              <p>Respuestas correctas: {puntuacion}</p>
            </div>
            <button onClick={() => window.location.reload()} className="boton-reiniciar">
              Jugar nuevamente
            </button>
          </div>
        ) : (
          <div className="pantalla-final">
            <h1>Juego Terminado</h1>
            <p>Puntuación: {puntuacion}</p>
            <p>Nivel alcanzado: {niveles[nivelActual - 1]?.nombre || 'Nivel 1'}</p>
            <button onClick={() => window.location.reload()}>Jugar de nuevo</button>
          </div>
        )
      ) : (
        <>
          <div className="info-juego">
            <p>Nivel: {niveles[nivelActual - 1]?.nombre}</p>
            <p>Puntuación: {puntuacion}</p>
            <p>Tiempo: {formatearTiempo(tiempoRestante)}</p>
          </div>

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
            <p>¿Qué equilibrará la balanza?</p>
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
        </>
      )}
    </div>
  );
};

export default Juego4;