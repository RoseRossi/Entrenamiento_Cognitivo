import React, { useState, useEffect, useCallback } from "react";
import GameLayout from "../GameLayout";
import { palabrasOriginales, generarMarDePalabras } from "./juego3_funciones";
import { auth } from "../../../../services/firebase/firebaseConfig";
import { gameService } from "../../../../services/firebase/gameService";
import { userService } from "../../../../services/firebase/userService";
import "./juego3_estilos.css";

const Juego3 = () => {
  const [palabraActual, setPalabraActual] = useState("");
  const [indicePalabra, setIndicePalabra] = useState(0);
  const [ronda, setRonda] = useState(1);
  const [mostrarMarDePalabras, setMostrarMarDePalabras] = useState(false);
  const [palabrasSeleccionadas, setPalabrasSeleccionadas] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [marDePalabras, setMarDePalabras] = useState([]);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  
  // Estados para Firebase
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [resultadoGuardado, setResultadoGuardado] = useState(false);
  const [tiemposPorRonda, setTiemposPorRonda] = useState([]);
  const [tiempoRondaActual, setTiempoRondaActual] = useState(null);

  // Guardar resultado usando useCallback
  const guardarResultado = useCallback(async () => {
    if (!user) {
      console.log('No hay usuario autenticado para guardar resultado');
      return;
    }

    try {
      console.log('Guardando resultado del Juego 3...');
      
      const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000);
      const palabrasCorrectas = resultado ? resultado.correctas.length : 0;
      const totalPalabrasOriginales = palabrasOriginales.length;
      const totalSeleccionadas = resultado ? resultado.total : 0;
      
      // Calcular métricas de memoria
      const porcentajeRecuerdo = Math.round((palabrasCorrectas / totalPalabrasOriginales) * 100);
      const precision = totalSeleccionadas > 0 ? Math.round((palabrasCorrectas / totalSeleccionadas) * 100) : 0;
      
      // Calcular falsas alarmas (palabras distractoras seleccionadas)
      const falsasAlarmas = totalSeleccionadas - palabrasCorrectas;
      const tasaFalsasAlarmas = totalSeleccionadas > 0 ? Math.round((falsasAlarmas / totalSeleccionadas) * 100) : 0;

      // Determinar nivel basado en rendimiento
      let nivelJuego = 'basico';
      if (porcentajeRecuerdo >= 80 && precision >= 85) {
        nivelJuego = 'avanzado';
      } else if (porcentajeRecuerdo >= 60 && precision >= 70) {
        nivelJuego = 'intermedio';
      }

      // Score final basado en precisión y recuerdo
      const scoreFinal = Math.round((porcentajeRecuerdo * 0.7) + (precision * 0.3));

      const resultData = {
        userId: user.uid,
        gameId: 'aprendizaje_listas_verbales',
        cognitiveDomain: 'memoria',
        level: nivelJuego,
        score: scoreFinal,
        timeSpent: tiempoTranscurrido,
        correctAnswers: palabrasCorrectas,
        totalQuestions: totalPalabrasOriginales,
        details: {
          rondasCompletadas: 3,
          palabrasCorrectas: palabrasCorrectas,
          totalSeleccionadas: totalSeleccionadas,
          falsasAlarmas: falsasAlarmas,
          porcentajeRecuerdo: porcentajeRecuerdo,
          precision: precision,
          tasaFalsasAlarmas: tasaFalsasAlarmas,
          tiemposPorRonda: tiemposPorRonda,
          tiempoPromedioRonda: tiemposPorRonda.length > 0 ? 
            Math.round((tiemposPorRonda.reduce((a, b) => a + b, 0) / tiemposPorRonda.length) * 100) / 100 : 0,
          palabrasOriginales: palabrasOriginales,
          palabrasSeleccionadas: palabrasSeleccionadas,
          palabrasCorrectasDetalle: resultado ? resultado.correctas : [],
          marDePalabrasGenerado: marDePalabras
        }
      };

      // Guardar resultado del juego
      await gameService.saveGameResult(resultData);
      
      // Actualizar progreso del usuario en el dominio cognitivo
      await userService.updateUserProgress(user.uid, 'memoria', scoreFinal);
      
      console.log('Resultado del Juego 3 guardado exitosamente');
      setResultadoGuardado(true);
      
    } catch (error) {
      console.error('Error guardando resultado del Juego 3:', error);
    }
  }, [user, tiempoInicio, resultado, palabrasSeleccionadas, marDePalabras, tiemposPorRonda]);

  // Inicialización
  useEffect(() => {
    setUser(auth.currentUser);
    setTiempoInicio(Date.now());
    setTiempoRondaActual(Date.now());
  }, []);

  // Guardar resultado cuando el juego termine
  useEffect(() => {
    if (juegoTerminado && !resultadoGuardado && user && tiempoInicio && resultado) {
      guardarResultado();
    }
  }, [juegoTerminado, resultadoGuardado, user, tiempoInicio, resultado, guardarResultado]);

  // Lógica principal del juego
  useEffect(() => {
    if (ronda <= 3) {
      const intervalo = setInterval(() => {
        if (indicePalabra < palabrasOriginales.length) {
          setPalabraActual(palabrasOriginales[indicePalabra]);
          setIndicePalabra(indicePalabra + 1);
        } else {
          clearInterval(intervalo);
          
          // Registrar tiempo de la ronda
          const tiempoRonda = Date.now() - tiempoRondaActual;
          setTiemposPorRonda(prev => [...prev, tiempoRonda]);
          
          setTimeout(() => {
            if (ronda < 3) {
              setIndicePalabra(0);
              setPalabraActual("");
              setRonda(ronda + 1);
              setTiempoRondaActual(Date.now()); // Reiniciar tiempo para nueva ronda
            } else {
              setMostrarMarDePalabras(true);
              setMarDePalabras(generarMarDePalabras());
            }
          }, 1000);
        }
      }, 1000);

      return () => clearInterval(intervalo);
    }
  }, [indicePalabra, ronda, tiempoRondaActual]);

  const seleccionarPalabra = (palabra) => {
    if (!palabrasSeleccionadas.includes(palabra)) {
      setPalabrasSeleccionadas([...palabrasSeleccionadas, palabra]);
    } else {
      // Permitir deseleccionar
      setPalabrasSeleccionadas(palabrasSeleccionadas.filter(p => p !== palabra));
    }
  };

  const verificarResultados = () => {
    const correctas = palabrasSeleccionadas.filter((p) => palabrasOriginales.includes(p));
    const nuevoResultado = { 
      correctas, 
      total: palabrasSeleccionadas.length,
      falsasAlarmas: palabrasSeleccionadas.filter(p => !palabrasOriginales.includes(p))
    };
    setResultado(nuevoResultado);
    setJuegoTerminado(true);
  };

  const reiniciarJuego = () => {
    setPalabraActual("");
    setIndicePalabra(0);
    setRonda(1);
    setMostrarMarDePalabras(false);
    setPalabrasSeleccionadas([]);
    setResultado(null);
    setMarDePalabras([]);
    setJuegoTerminado(false);
    setResultadoGuardado(false);
    setTiemposPorRonda([]);
    setTiempoInicio(Date.now());
    setTiempoRondaActual(Date.now());
  };

  const generarAnalisis = () => {
    if (!resultado) return "";
    
    const porcentajeRecuerdo = Math.round((resultado.correctas.length / palabrasOriginales.length) * 100);
    const precision = resultado.total > 0 ? Math.round((resultado.correctas.length / resultado.total) * 100) : 0;
    const falsasAlarmas = resultado.falsasAlarmas ? resultado.falsasAlarmas.length : 0;

    if (porcentajeRecuerdo >= 90 && precision >= 90) {
      return `¡Excelente memoria! Recordaste ${porcentajeRecuerdo}% de las palabras con ${precision}% de precisión. Tu capacidad de memoria verbal es excepcional.`;
    } else if (porcentajeRecuerdo >= 70 && precision >= 75) {
      return `Buen rendimiento. Recordaste ${porcentajeRecuerdo}% de las palabras con ${precision}% de precisión. Tu memoria verbal está bien desarrollada.`;
    } else if (porcentajeRecuerdo >= 50) {
      return `Rendimiento moderado. Recordaste ${porcentajeRecuerdo}% de las palabras con ${precision}% de precisión. ${falsasAlarmas > 0 ? `Evita seleccionar ${falsasAlarmas} palabra(s) que no estaban en la lista.` : ''}`;
    } else {
      return `Necesitas practicar más. Recordaste solo ${porcentajeRecuerdo}% de las palabras. Intenta concentrarte más durante la presentación y crear asociaciones mentales.`;
    }
  };

  const obtenerProgreso = () => {
    if (ronda <= 3 && !mostrarMarDePalabras) {
      return `Ronda ${ronda}/3 - Palabra ${indicePalabra}/${palabrasOriginales.length}`;
    } else if (mostrarMarDePalabras && !juegoTerminado) {
      return `Selección - ${palabrasSeleccionadas.length} palabras seleccionadas`;
    }
    return "Completado";
  };

  return (
    <GameLayout
      title="Aprendizaje de Listas Verbales"
      description="Memoriza las palabras que aparecen en 3 rondas, luego selecciona las que recuerdes del mar de palabras."
      stats={{
        nivel: `Ronda ${ronda}`,
        puntuacion: resultado ? resultado.correctas.length : 0,
        progreso: obtenerProgreso()
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: juegoTerminado,
        score: resultado ? resultado.correctas.length : 0,
        total: palabrasOriginales.length,
        precision: resultado && resultado.total > 0 ? Math.round((resultado.correctas.length / resultado.total) * 100) : 0
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
    >
      {!juegoTerminado ? (
        <div className="juego2-container">
          {!mostrarMarDePalabras ? (
            <div className="presentacion">
              <h2>Ronda {ronda}</h2>
              <div className="palabra">{palabraActual}</div>
              {palabraActual && (
                <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                  Palabra {indicePalabra}/{palabrasOriginales.length}
                </p>
              )}
            </div>
          ) : (
            <div className="seleccion">
              <h2>Selecciona las palabras que recuerdas</h2>
              <p style={{ marginBottom: '10px', color: '#666' }}>
                Seleccionadas: {palabrasSeleccionadas.length} | 
                Meta: {palabrasOriginales.length} palabras originales
              </p>
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
              <button 
                className="verificar" 
                onClick={verificarResultados}
                disabled={palabrasSeleccionadas.length === 0}
              >
                Verificar Resultados
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="juego2-container">
          <div className="resultado">
            <h3>Resultados</h3>
            <p><strong>Palabras correctas:</strong> {resultado.correctas.length}/{palabrasOriginales.length}</p>
            <p><strong>Total seleccionadas:</strong> {resultado.total}</p>
            <p><strong>Precisión:</strong> {resultado.total > 0 ? Math.round((resultado.correctas.length / resultado.total) * 100) : 0}%</p>
            {resultado.falsasAlarmas && resultado.falsasAlarmas.length > 0 && (
              <p><strong>Falsas alarmas:</strong> {resultado.falsasAlarmas.join(", ")}</p>
            )}
            <p><strong>Palabras correctas:</strong> {resultado.correctas.join(", ")}</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '20px', marginTop: '20px' }}>
            {resultadoGuardado ? (
              <p style={{ color: '#22c55e', fontWeight: 'bold' }}>
                Resultado guardado correctamente
              </p>
            ) : (
              <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                Guardando resultado...
              </p>
            )}
          </div>
        </div>
      )}
    </GameLayout>
  );
};

export default Juego3;