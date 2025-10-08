import React, { useState, useEffect, useCallback, useRef } from "react";
import GameLayout from "../GameLayout/GameLayout";
import { generarPalabrasOriginales, generarMarDePalabras, getDisplayTimeForLevel, getPalabrasCountForLevel, getSelectionTimeForLevel } from "./juego3_funciones";
import { auth } from "../../../services/firebase/firebaseConfig";
import { gameService } from "../../../services/firebase/gameService";
import { userService } from "../../../services/firebase/userService";
import JUEGO3_CONFIG from "./juego3_config";
import "./juego3_estilos.css";

const Juego3 = () => {
  const [palabraActual, setPalabraActual] = useState("");
  const [indicePalabra, setIndicePalabra] = useState(0);
  const [ronda, setRonda] = useState(1);
  const [nivel, setNivel] = useState(JUEGO3_CONFIG.START_LEVEL);
  const [palabrasOriginales, setPalabrasOriginales] = useState([]);
  const [mostrarMarDePalabras, setMostrarMarDePalabras] = useState(false);
  const [palabrasSeleccionadas, setPalabrasSeleccionadas] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [marDePalabras, setMarDePalabras] = useState([]);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [juegoIniciado, setJuegoIniciado] = useState(false);

  // Estados para scoring
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [tiempoSeleccion, setTiempoSeleccion] = useState(0);

  // Estados para Firebase
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [resultadoGuardado, setResultadoGuardado] = useState(false);
  const [tiemposPorRonda, setTiemposPorRonda] = useState([]);
  const [tiempoRondaActual, setTiempoRondaActual] = useState(null);
  const [nivelMaximoAlcanzado, setNivelMaximoAlcanzado] = useState(JUEGO3_CONFIG.START_LEVEL);

  // Ref para el timer de selección
  const selectionTimerRef = useRef(null);

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
      if (porcentajeRecuerdo >= 80 && precision >= 85 && nivelMaximoAlcanzado >= 5) {
        nivelJuego = 'avanzado';
      } else if (porcentajeRecuerdo >= 60 && precision >= 70 && nivelMaximoAlcanzado >= 3) {
        nivelJuego = 'intermedio';
      }

      // Score final basado en precisión, recuerdo y nivel alcanzado
      const scoreFinal = Math.round((porcentajeRecuerdo * 0.5) + (precision * 0.3) + (nivelMaximoAlcanzado * 2.86));

      const resultData = {
        userId: user.uid,
        gameId: 'aprendizaje_listas_verbales',
        cognitiveDomain: 'memoria',
        level: nivelJuego,
        score: scoreFinal,
        timeSpent: tiempoTranscurrido,
        correctAnswers: aciertos,
        totalQuestions: totalPalabrasOriginales,
        details: {
          nivelMaximoAlcanzado: nivelMaximoAlcanzado,
          rondasCompletadas: JUEGO3_CONFIG.ROUNDS_PER_LEVEL,
          totalAciertos: aciertos,
          totalErrores: errores,
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
  }, [user, tiempoInicio, resultado, palabrasSeleccionadas, marDePalabras, tiemposPorRonda, palabrasOriginales, nivelMaximoAlcanzado, aciertos, errores]);

  // Inicialización
  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  // Inicializar palabras para el nivel actual
  useEffect(() => {
    if (juegoIniciado) {
      const palabras = generarPalabrasOriginales(nivel);
      setPalabrasOriginales(palabras);
    }
  }, [nivel, juegoIniciado]);

  // Guardar resultado cuando el juego termine
  useEffect(() => {
    if (juegoTerminado && !resultadoGuardado && user && tiempoInicio && resultado) {
      guardarResultado();
    }
  }, [juegoTerminado, resultadoGuardado, user, tiempoInicio, resultado, guardarResultado]);

  // Lógica principal del juego
  useEffect(() => {
    if (juegoIniciado && ronda <= JUEGO3_CONFIG.ROUNDS_PER_LEVEL && palabrasOriginales.length > 0) {
      const displayTime = getDisplayTimeForLevel(nivel);

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
            if (ronda < JUEGO3_CONFIG.ROUNDS_PER_LEVEL) {
              setIndicePalabra(0);
              setPalabraActual("");
              setRonda(ronda + 1);
              setTiempoRondaActual(Date.now()); // Reiniciar tiempo para nueva ronda
            } else {
              setMostrarMarDePalabras(true);
              setMarDePalabras(generarMarDePalabras(palabrasOriginales));
            }
          }, 1000);
        }
      }, displayTime);

      return () => clearInterval(intervalo);
    }
  }, [indicePalabra, ronda, tiempoRondaActual, juegoIniciado, palabrasOriginales, nivel]);

  // Timer de selección
  useEffect(() => {
    if (mostrarMarDePalabras && !juegoTerminado) {
      const initialTime = getSelectionTimeForLevel(nivel);
      setTiempoSeleccion(initialTime);

      selectionTimerRef.current = setInterval(() => {
        setTiempoSeleccion(prev => {
          if (prev <= 1) {
            if (selectionTimerRef.current) {
              clearInterval(selectionTimerRef.current);
              selectionTimerRef.current = null;
            }

            // Si el tiempo se agota, verificar resultados automáticamente
            if (JUEGO3_CONFIG.FAIL_ON_TIMER_EXPIRY) {
              // Llamar a verificarResultados en el próximo tick para evitar problemas de estado
              setTimeout(() => {
                verificarResultados();
              }, 0);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (selectionTimerRef.current) {
          clearInterval(selectionTimerRef.current);
          selectionTimerRef.current = null;
        }
      };
    }
  }, [mostrarMarDePalabras, juegoTerminado, nivel]);

  const seleccionarPalabra = (palabra) => {
    if (!palabrasSeleccionadas.includes(palabra)) {
      setPalabrasSeleccionadas([...palabrasSeleccionadas, palabra]);
    } else {
      // Permitir deseleccionar
      setPalabrasSeleccionadas(palabrasSeleccionadas.filter(p => p !== palabra));
    }
  };

  const verificarResultados = () => {
    // Detener el timer de selección
    if (selectionTimerRef.current) {
      clearInterval(selectionTimerRef.current);
      selectionTimerRef.current = null;
    }

    const correctas = palabrasSeleccionadas.filter((p) => palabrasOriginales.includes(p));
    const incorrectas = palabrasSeleccionadas.filter(p => !palabrasOriginales.includes(p));

    const nuevoResultado = {
      correctas,
      total: palabrasSeleccionadas.length,
      falsasAlarmas: incorrectas
    };
    setResultado(nuevoResultado);

    // Actualizar contadores de aciertos y errores
    setAciertos(prev => prev + correctas.length);
    setErrores(prev => prev + incorrectas.length);

    // Verificar si pasa al siguiente nivel
    const porcentajeAcierto = correctas.length / palabrasOriginales.length;

    if (porcentajeAcierto >= JUEGO3_CONFIG.PASS_THRESHOLD && nivel < JUEGO3_CONFIG.MAX_LEVEL) {
      // Pasar al siguiente nivel
      const siguienteNivel = nivel + 1;
      setNivel(siguienteNivel);
      setNivelMaximoAlcanzado(prev => Math.max(prev, siguienteNivel));

      // Reiniciar para el siguiente nivel
      setPalabraActual("");
      setIndicePalabra(0);
      setRonda(1);
      setMostrarMarDePalabras(false);
      setPalabrasSeleccionadas([]);
      setResultado(null);
      setMarDePalabras([]);
      setTiempoRondaActual(Date.now());
    } else {
      // Terminar el juego
      setJuegoTerminado(true);
    }
  };

  const reiniciarJuego = () => {
    // Limpiar timer de selección si existe
    if (selectionTimerRef.current) {
      clearInterval(selectionTimerRef.current);
      selectionTimerRef.current = null;
    }

    setPalabraActual("");
    setIndicePalabra(0);
    setRonda(1);
    setNivel(JUEGO3_CONFIG.START_LEVEL);
    setPalabrasOriginales([]);
    setMostrarMarDePalabras(false);
    setPalabrasSeleccionadas([]);
    setResultado(null);
    setMarDePalabras([]);
    setJuegoTerminado(false);
    setJuegoIniciado(false);
    setResultadoGuardado(false);
    setTiemposPorRonda([]);
    setTiempoInicio(null);
    setTiempoRondaActual(null);
    setNivelMaximoAlcanzado(JUEGO3_CONFIG.START_LEVEL);
    setAciertos(0);
    setErrores(0);
    setTiempoSeleccion(0);
  };

  const generarAnalisis = () => {
    if (!resultado || !resultado.correctas || palabrasOriginales.length === 0) return "";

    const porcentajeRecuerdo = Math.round((resultado.correctas.length / palabrasOriginales.length) * 100);
    const precision = resultado.total > 0 ? Math.round((resultado.correctas.length / resultado.total) * 100) : 0;
    const falsasAlarmas = resultado.falsasAlarmas ? resultado.falsasAlarmas.length : 0;
    const pasaAlSiguienteNivel = porcentajeRecuerdo >= (JUEGO3_CONFIG.PASS_THRESHOLD * 100);

    let mensaje = '';

    if (porcentajeRecuerdo >= 90 && precision >= 90) {
      mensaje = `¡Excelente memoria! Recordaste ${porcentajeRecuerdo}% de las palabras con ${precision}% de precisión. `;
    } else if (porcentajeRecuerdo >= 70 && precision >= 75) {
      mensaje = `Buen rendimiento. Recordaste ${porcentajeRecuerdo}% de las palabras con ${precision}% de precisión. `;
    } else if (porcentajeRecuerdo >= 50) {
      mensaje = `Rendimiento moderado. Recordaste ${porcentajeRecuerdo}% de las palabras con ${precision}% de precisión. `;
      if (falsasAlarmas > 0) {
        mensaje += `Evita seleccionar ${falsasAlarmas} palabra(s) que no estaban en la lista. `;
      }
    } else {
      mensaje = `Recordaste solo ${porcentajeRecuerdo}% de las palabras. Intenta concentrarte más durante la presentación y crear asociaciones mentales. `;
    }

    // Agregar información sobre nivel alcanzado
    mensaje += `Alcanzaste el nivel ${nivelMaximoAlcanzado} de ${JUEGO3_CONFIG.MAX_LEVEL}. `;

    if (nivel >= JUEGO3_CONFIG.MAX_LEVEL) {
      mensaje += '¡Completaste todos los niveles! Tu memoria verbal es excelente.';
    } else if (pasaAlSiguienteNivel && nivel < JUEGO3_CONFIG.MAX_LEVEL) {
      mensaje += `¡Pasaste al nivel ${nivel}!`;
    } else {
      mensaje += 'No alcanzaste el 50% necesario para avanzar.';
    }

    return mensaje;
  };

  const obtenerProgreso = () => {
    if (ronda <= JUEGO3_CONFIG.ROUNDS_PER_LEVEL && !mostrarMarDePalabras) {
      return `Ronda ${ronda}/${JUEGO3_CONFIG.ROUNDS_PER_LEVEL} - Palabra ${indicePalabra}/${palabrasOriginales.length}`;
    } else if (mostrarMarDePalabras && !juegoTerminado) {
      return `Selección - ${palabrasSeleccionadas.length} palabras seleccionadas`;
    }
    return "Completado";
  };

  // Instrucciones del juego
  const InstruccionesJuego = () => (
    <div style={{ textAlign: 'center', fontSize: '18px', color: '#34495e' }}>
      <p><b>Instrucciones</b></p>
      <ul style={{ textAlign: 'left', maxWidth: 500, margin: '0 auto', fontSize: 16 }}>
        <li>Se mostrarán palabras una por una durante <b>{JUEGO3_CONFIG.ROUNDS_PER_LEVEL} rondas</b>.</li>
        <li>Comenzarás con <b>{JUEGO3_CONFIG.MIN_WORDS} palabras</b> en el nivel 1.</li>
        <li>Debes <b>memorizar</b> todas las palabras que aparecen.</li>
        <li>Después de las {JUEGO3_CONFIG.ROUNDS_PER_LEVEL} rondas, aparecerá un <b>"mar de palabras"</b> con las originales y palabras distractoras.</li>
        <li>Selecciona <b>solo las palabras que recuerdes</b> de las presentadas.</li>
        <li>Tendrás un <b>tiempo límite</b> para seleccionar ({JUEGO3_CONFIG.INITIAL_SELECTION_TIMER}s al inicio).</li>
        <li>Necesitas <b>al menos 50% correctas</b> para avanzar al siguiente nivel.</li>
        <li>En niveles superiores: <b>más palabras</b> y <b>menos tiempo</b> para todo.</li>
        <li>¡Enfoca tu atención y crea asociaciones mentales!</li>
      </ul>
    </div>
  );

  const iniciarJuego = () => {
    setJuegoIniciado(true);
    setTiempoInicio(Date.now());
    setTiempoRondaActual(Date.now());
  };

  return (
    <GameLayout
      title="Aprendizaje de Listas Verbales"
      showInstructions={!juegoIniciado}
      instructions={<InstruccionesJuego />}
      onStartGame={iniciarJuego}
      description={juegoIniciado ? `Memoriza las palabras que aparecen en ${JUEGO3_CONFIG.ROUNDS_PER_LEVEL} rondas, luego selecciona las que recuerdes del mar de palabras.` : null}
      stats={{
        nivel: `Nivel ${nivel} - Ronda ${ronda}`,
        puntuacion: aciertos || 0,
        progreso: obtenerProgreso(),
        tiempo: mostrarMarDePalabras && !juegoTerminado ? tiempoSeleccion : null
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: juegoTerminado,
        level: nivelMaximoAlcanzado,
        score: aciertos || 0,
        total: palabrasOriginales.length || 0,
        mistakes: errores || 0,
        precision: resultado && resultado.total > 0 ? Math.round((resultado.correctas.length / resultado.total) * 100) : 0
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
    >
      {!juegoTerminado && juegoIniciado ? (
        <div className="juego2-container">
          {!mostrarMarDePalabras ? (
            <div className="presentacion">
              <h2>Nivel {nivel} - Ronda {ronda}</h2>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                Palabras en este nivel: {palabrasOriginales.length} |
                Tiempo por palabra: {(getDisplayTimeForLevel(nivel) / 1000).toFixed(1)}s
              </p>
              <div className="palabra">{palabraActual}</div>
              {palabraActual && (
                <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                  Palabra {indicePalabra}/{palabrasOriginales.length}
                </p>
              )}
            </div>
          ) : (
            <div className="seleccion">
              <h2>Nivel {nivel} - Selecciona las palabras que recuerdas</h2>
              <p style={{ marginBottom: '15px', color: '#666', fontSize: '16px' }}>
                Seleccionadas: {palabrasSeleccionadas.length} |
                Meta: {palabrasOriginales.length} palabras originales |
                Necesitas: {Math.ceil(palabrasOriginales.length * JUEGO3_CONFIG.PASS_THRESHOLD)} para avanzar
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
        juegoTerminado && resultado && resultado.correctas ? (
          <div className="juego2-container">
            <div className="resultado">
              <h3>Resultados Finales</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px', textAlign: 'left' }}>
                <div>
                  <p><strong>📊 Total de Aciertos:</strong> {aciertos || 0}</p>
                  <p><strong>❌ Total de Errores:</strong> {errores || 0}</p>
                  <p><strong>🎯 Nivel Alcanzado:</strong> {nivelMaximoAlcanzado}/{JUEGO3_CONFIG.MAX_LEVEL}</p>
                </div>
                <div>
                  <p><strong>✅ Última ronda correctas:</strong> {resultado.correctas.length || 0}/{palabrasOriginales.length || 0}</p>
                  <p><strong>📝 Total seleccionadas:</strong> {resultado.total || 0}</p>
                  <p><strong>🎯 Precisión:</strong> {resultado.total > 0 ? Math.round((resultado.correctas.length / resultado.total) * 100) : 0}%</p>
                </div>
              </div>
              {resultado.falsasAlarmas && resultado.falsasAlarmas.length > 0 && (
                <p style={{ marginTop: '15px' }}><strong>⚠️ Falsas alarmas (última ronda):</strong> {resultado.falsasAlarmas.join(", ")}</p>
              )}
              <p style={{ marginTop: '15px' }}><strong>✓ Palabras correctas (última ronda):</strong> {resultado.correctas.join(", ")}</p>
            </div>

            <div style={{ textAlign: 'center', padding: '20px', marginTop: '20px' }}>
              {resultadoGuardado ? (
                <p style={{ color: '#22c55e', fontWeight: 'bold' }}>
                  ✓ Resultado guardado correctamente
                </p>
              ) : (
                <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                  ⏳ Guardando resultado...
                </p>
              )}
            </div>
          </div>
        ) : null
      )}
    </GameLayout>
  );
};

export default Juego3;