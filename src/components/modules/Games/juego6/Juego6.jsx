import React, { useState, useEffect, useCallback, useRef } from "react";
import { generarEnsayo, verificarRespuesta, calcularRetraso } from "./juego6_funciones";
import GameLayout from "../GameLayout";
import { auth } from "../../../../services/firebase/firebaseConfig";
import { gameService } from "../../../../services/firebase/gameService";
import { userService } from "../../../../services/firebase/userService";
import "./juego6_estilos.css";
import { useMemo } from "react";

const MAX_FALLOS_PERMITIDOS = 3; // Nuevo constante para el límite de fallos

const Juego6 = ({ nivel = "basico" }) => {
  const [ensayoActual, setEnsayoActual] = useState(0);
  const [estadoJuego, setEstadoJuego] = useState({
    puntuacion: 0,
    respuestasCorrectas: 0,
    respuestasIncorrectas: 0,
    juegoTerminado: false,
  });
  const [flecha, setFlecha] = useState(null);
  const [estimulo, setEstimulo] = useState(null);
  const [mostrarEstimulo, setMostrarEstimulo] = useState(false);
  const [puedeResponder, setPuedeResponder] = useState(false);
  const [mostrarFlecha, setMostrarFlecha] = useState(false);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [aciertosCongruentes, setAciertosCongruentes] = useState(0);
  const [aciertosIncongruentes, setAciertosIncongruentes] = useState(0);
  const ensayoActualRef = useRef(null); // para guardar el ensayo actual con su tipo
  const [tiemposReaccion, setTiemposReaccion] = useState([]); // Guarda tiempos de reacción
  const tiempoInicioRef = useRef(null); // Marca el tiempo en que se muestra el estímulo

  // Estados para Firebase
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [resultadoGuardado, setResultadoGuardado] = useState(false);
  const [respuestasDetalladas, setRespuestasDetalladas] = useState([]);

  // Guardar resultado usando useCallback
  const guardarResultado = useCallback(async () => {
    if (!user) {
      console.log('No hay usuario autenticado para guardar resultado');
      return;
    }

    try {
      console.log('Guardando resultado del Juego 6...');
      
      const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000);
      const totalEnsayosPosibles = 100;
      const ensayosCompletados = ensayoActual;
      const respuestasCorrectas = estadoJuego.respuestasCorrectas;
      
      // Calcular métricas específicas del paradigma de Posner
      const porcentajeCompletado = Math.round((ensayosCompletados / totalEnsayosPosibles) * 100);
      const porcentajePrecision = ensayosCompletados > 0 ? Math.round((respuestasCorrectas / ensayosCompletados) * 100) : 0;
      
      // Separar ensayos por tipo
      const ensayosCongruentes = respuestasDetalladas.filter(r => r.congruente);
      const ensayosIncongruentes = respuestasDetalladas.filter(r => !r.congruente);
      
      // Calcular tiempos de reacción promedio por tipo
      const tiempoReaccionCongruente = ensayosCongruentes.length > 0 ? 
        Math.round(ensayosCongruentes.reduce((sum, r) => sum + r.tiempoReaccion, 0) / ensayosCongruentes.length) : 0;
      const tiempoReaccionIncongruente = ensayosIncongruentes.length > 0 ? 
        Math.round(ensayosIncongruentes.reduce((sum, r) => sum + r.tiempoReaccion, 0) / ensayosIncongruentes.length) : 0;
      
      // Calcular efecto de validez de la señal (diferencia entre incongruente y congruente)
      const efectoValidez = tiempoReaccionIncongruente - tiempoReaccionCongruente;
      
      // Determinar nivel basado en rendimiento
      let nivelJuego = 'basico';
      if (porcentajePrecision >= 85 && porcentajeCompletado >= 90 && efectoValidez < 100) {
        nivelJuego = 'avanzado';
      } else if (porcentajePrecision >= 70 && porcentajeCompletado >= 75 && efectoValidez < 150) {
        nivelJuego = 'intermedio';
      }

      // Score basado en precisión, completitud y eficiencia atencional
      const scoreBase = Math.round((porcentajePrecision * 0.6) + (porcentajeCompletado * 0.3));
      const bonusEficiencia = efectoValidez < 50 ? 10 : (efectoValidez < 100 ? 5 : 0);
      const scoreFinal = Math.min(100, scoreBase + bonusEficiencia);

      const resultData = {
        userId: user.uid,
        gameId: 'posner_haciendo_cola',
        cognitiveDomain: 'atencion',
        level: nivelJuego,
        score: scoreFinal,
        timeSpent: tiempoTranscurrido,
        correctAnswers: respuestasCorrectas,
        totalQuestions: ensayosCompletados,
        details: {
          totalEnsayosPosibles: totalEnsayosPosibles,
          porcentajeCompletado: porcentajeCompletado,
          porcentajePrecision: porcentajePrecision,
          fallosTotales: estadoJuego.respuestasIncorrectas,
          razonTermino: estadoJuego.respuestasIncorrectas >= MAX_FALLOS_PERMITIDOS ? 'limite_fallos' :
                       (ensayosCompletados >= totalEnsayosPosibles ? 'completado' : 'usuario_salio'),
          // Métricas específicas del paradigma de Posner
          aciertosCongruentes: aciertosCongruentes,
          aciertosIncongruentes: aciertosIncongruentes,
          totalEnsayosCongruentes: ensayosCongruentes.length,
          totalEnsayosIncongruentes: ensayosIncongruentes.length,
          tiempoReaccionCongruente: tiempoReaccionCongruente,
          tiempoReaccionIncongruente: tiempoReaccionIncongruente,
          efectoValidez: efectoValidez, // Clave métrica para atención encubierta
          tiempoReaccionPromedio: tiemposReaccion.length > 0 ? 
            Math.round(tiemposReaccion.reduce((a, b) => a + b, 0) / tiemposReaccion.length) : 0,
          tiempoReaccionMinimo: Math.min(...tiemposReaccion),
          tiempoReaccionMaximo: Math.max(...tiemposReaccion),
          variabilidadTiempoReaccion: tiemposReaccion.length > 1 ? 
            Math.round(Math.sqrt(tiemposReaccion.reduce((sum, rt) => {
              const mean = tiemposReaccion.reduce((a, b) => a + b, 0) / tiemposReaccion.length;
              return sum + Math.pow(rt - mean, 2);
            }, 0) / (tiemposReaccion.length - 1))) : 0,
          respuestasDetalladas: respuestasDetalladas,
          tiemposReaccionCompletos: tiemposReaccion
        }
      };

      // Guardar resultado del juego
      await gameService.saveGameResult(resultData);
      
      // Actualizar progreso del usuario en el dominio cognitivo
      await userService.updateUserProgress(user.uid, 'atencion', scoreFinal);
      
      console.log('Resultado del Juego 6 guardado exitosamente');
      setResultadoGuardado(true);
      
    } catch (error) {
      console.error('Error guardando resultado del Juego 6:', error);
    }
  }, [user, tiempoInicio, ensayoActual, estadoJuego, aciertosCongruentes, aciertosIncongruentes, tiemposReaccion, respuestasDetalladas]);

  // Inicialización
  useEffect(() => {
    setUser(auth.currentUser);
    setTiempoInicio(Date.now());
  }, []);

  // Guardar resultado cuando el juego termine
  useEffect(() => {
    if (estadoJuego.juegoTerminado && !resultadoGuardado && user && tiempoInicio) {
      guardarResultado();
    }
  }, [estadoJuego.juegoTerminado, resultadoGuardado, user, tiempoInicio, guardarResultado]);

  const formatearTiempo = useCallback((ms) => {
    if (isNaN(ms) || ms <= 0) return "0.0s";
    return `${(ms / 1000).toFixed(1)}s`;
  }, []);

  // Refs para manejar los timeouts y estado actual
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const puedeResponderRef = useRef(puedeResponder);
  const mostrarEstimuloRef = useRef(mostrarEstimulo);

  // Actualizar refs cuando cambia el estado
  useEffect(() => {
    puedeResponderRef.current = puedeResponder;
    mostrarEstimuloRef.current = mostrarEstimulo;
  }, [puedeResponder, mostrarEstimulo]);

  const limpiarTemporizadores = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  const terminarJuego = useCallback(() => {
    limpiarTemporizadores();
    setEstadoJuego(prev => ({ ...prev, juegoTerminado: true }));
  }, [limpiarTemporizadores]);

  const ensayos = useMemo(() => {
    const total = 100;
    const cantidadCongruentes = Math.round(total * 0.6);
    const mezcla = Array.from({ length: total }, (_, i) => i < cantidadCongruentes);

    // Fisher-Yates Shuffle
    for (let i = mezcla.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mezcla[i], mezcla[j]] = [mezcla[j], mezcla[i]];
    }

    return mezcla;
  }, []);

  const calcularTiempoVisible = (indiceEnsayo) => {
    const bloque = Math.floor(indiceEnsayo / 20); // Cada bloque tiene 20 ensayos
    return 6000 - (bloque * 500); // Baja 500ms por bloque, mínimo 4000ms
  };

  const iniciarEnsayo = useCallback(() => {
    setEnsayoActual((prevEnsayoActual) => {
      if (estadoJuego.juegoTerminado || prevEnsayoActual >= ensayos.length) return prevEnsayoActual;

      limpiarTemporizadores();

      const tipoEnsayo = ensayos[prevEnsayoActual]; // true = congruente, false = incongruente
      const { direccionFlecha, ubicacionEstimulo, congruente } = generarEnsayo(tipoEnsayo);
      ensayoActualRef.current = { congruente }; // ← guardamos para usar luego
      setFlecha(direccionFlecha);
      setEstimulo(ubicacionEstimulo);
      setMostrarEstimulo(false);
      setPuedeResponder(false);
      setMostrarFlecha(false);
      setRespuestaCorrecta(null);

      const tiempoVisible = calcularTiempoVisible(prevEnsayoActual);
      setTiempoRestante(Number(tiempoVisible) || 0);

      timeoutRef.current = setTimeout(() => {
        setMostrarFlecha(true); // Reemplaza "+" por la flecha

        // Después de 1000ms, volvemos a mostrar "+"
        timeoutRef.current = setTimeout(() => {
          setMostrarFlecha(false); // Vuelve el símbolo "+"

          // 100ms después, se muestra el estímulo y se activa la respuesta
          timeoutRef.current = setTimeout(() => {
            tiempoInicioRef.current = Date.now(); // Guarda el momento exacto en que aparece el estímulo
            setMostrarEstimulo(true);
            setPuedeResponder(true);

            // Timeout para respuesta
            timeoutRef.current = setTimeout(() => {
              if (puedeResponderRef.current) {
                setPuedeResponder(false);
                setMostrarEstimulo(false);
                limpiarTemporizadores();
                setEstadoJuego((prev) => {
                  const nuevoEstado = {
                    ...prev,
                    respuestasIncorrectas: prev.respuestasIncorrectas + 1,
                  };
                  if (nuevoEstado.respuestasIncorrectas >= MAX_FALLOS_PERMITIDOS) {
                    terminarJuego();
                  } else {
                    // Espera breve y luego incrementa el contador de ensayo
                    setTimeout(() => {
                      setEnsayoActual((prev) => prev + 1);
                    }, 500);
                  }
                  return nuevoEstado;
                });
              }

            }, tiempoVisible);

            // Inicia conteo regresivo
            intervalRef.current = setInterval(() => {
              setTiempoRestante((prev) => {
                const nuevoTiempo = Math.max(0, Number(prev) - 1000);
                if (nuevoTiempo <= 0) clearInterval(intervalRef.current);
                return nuevoTiempo;
              });
            }, 1000);
          }, 100); // <-- Esperar 100ms más para mostrar estímulo
        }, 1000); // <-- Flecha se muestra por 1000ms

      }, calcularRetraso());

      return prevEnsayoActual;
    });
  }, [
    estadoJuego.juegoTerminado,
    ensayos,
    //nivel,
    limpiarTemporizadores,
    terminarJuego,
  ]);

  const manejarRespuesta = useCallback((respuesta) => {
    let tiempoReaccion = 0;
    if (tiempoInicioRef.current !== null) {
      tiempoReaccion = Date.now() - tiempoInicioRef.current;
      setTiemposReaccion(prev => [...prev, tiempoReaccion]);
    }
    
    if (!puedeResponderRef.current || !mostrarEstimuloRef.current) return;

    const esCorrecta = verificarRespuesta(respuesta, estimulo);
    setRespuestaCorrecta(esCorrecta ? estimulo : null);

    // Registrar respuesta detallada
    const respuestaDetallada = {
      ensayoNumero: ensayoActual + 1,
      congruente: ensayoActualRef.current?.congruente || false,
      direccionFlecha: flecha,
      ubicacionEstimulo: estimulo,
      respuestaUsuario: respuesta,
      correcta: esCorrecta,
      tiempoReaccion: tiempoReaccion,
      tiempoRespuesta: Date.now() - tiempoInicio
    };
    setRespuestasDetalladas(prev => [...prev, respuestaDetallada]);

    // Contador separado por tipo de ensayo (congruente/incongruente)
    if (ensayoActualRef.current) {
      const { congruente } = ensayoActualRef.current;
      if (esCorrecta) {
        if (congruente) {
          setAciertosCongruentes((prev) => prev + 1);
        } else {
          setAciertosIncongruentes((prev) => prev + 1);
        }
      }
    }

    // Actualización del estado principal del juego
    setEstadoJuego((prev) => {
      const nuevoEstado = {
        ...prev,
        puntuacion: prev.puntuacion + (esCorrecta ? 1 : 0),
        respuestasCorrectas: prev.respuestasCorrectas + (esCorrecta ? 1 : 0),
        respuestasIncorrectas: prev.respuestasIncorrectas + (esCorrecta ? 0 : 1),
      };

      if (nuevoEstado.respuestasIncorrectas >= MAX_FALLOS_PERMITIDOS) {
        terminarJuego();
      }
      return nuevoEstado;
    });

    // Limpiar estado visual y lógica para siguiente ensayo
    setPuedeResponder(false);
    setMostrarEstimulo(false);
    limpiarTemporizadores();

    // Esperar para iniciar otro ensayo, o terminar juego
    setEnsayoActual((prev) => {
      const nuevo = prev + 1;
      if (nuevo >= 100) {
        terminarJuego();
      } else if (estadoJuego.respuestasIncorrectas + (esCorrecta ? 0 : 1) < MAX_FALLOS_PERMITIDOS) {
        timeoutRef.current = setTimeout(() => iniciarEnsayo(), 1000);
      }
      return nuevo;
    });
  }, [
    estimulo,
    flecha,
    ensayoActual,
    tiempoInicio,
    limpiarTemporizadores,
    terminarJuego,
    iniciarEnsayo,
    estadoJuego.respuestasIncorrectas,
  ]);

  useEffect(() => {
    iniciarEnsayo();

    const listener = (e) => {
      if (!puedeResponderRef.current) return;
      if (e.key === "ArrowLeft") manejarRespuesta("izquierda");
      if (e.key === "ArrowRight") manejarRespuesta("derecha");
    };

    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
      limpiarTemporizadores();
    };
  }, [iniciarEnsayo, manejarRespuesta, limpiarTemporizadores]);

  const reiniciarJuego = useCallback(() => {
    limpiarTemporizadores();
    setEnsayoActual(0);
    setEstadoJuego({
      puntuacion: 0,
      respuestasCorrectas: 0,
      respuestasIncorrectas: 0,
      juegoTerminado: false
    });
    setAciertosCongruentes(0);
    setAciertosIncongruentes(0);
    setResultadoGuardado(false);
    setRespuestasDetalladas([]);
    setTiemposReaccion([]);
    setTiempoInicio(Date.now());
    setTimeout(() => iniciarEnsayo(), 100); // Espera breve para asegurar el reset
  }, [iniciarEnsayo, limpiarTemporizadores]);

  const Caja = React.memo(({ lado, mostrar, correcta, onClick }) => (
    <div
      className={`caja ${mostrar ? "estimulo" : ""} ${correcta ? "correcta" : ""}`}
      onClick={onClick}
    >
      {mostrar && "★"}
    </div>
  ));

  const generarAnalisis = () => {
    const porcentajePrecision = ensayoActual > 0 ? Math.round((estadoJuego.respuestasCorrectas / ensayoActual) * 100) : 0;
    const tiempoPromedioReaccion = tiemposReaccion.length > 0 ? 
      Math.round(tiemposReaccion.reduce((a, b) => a + b, 0) / tiemposReaccion.length) : 0;
    
    const ensayosCongruentes = respuestasDetalladas.filter(r => r.congruente);
    const ensayosIncongruentes = respuestasDetalladas.filter(r => !r.congruente);
    const tiempoCongruente = ensayosCongruentes.length > 0 ? 
      Math.round(ensayosCongruentes.reduce((sum, r) => sum + r.tiempoReaccion, 0) / ensayosCongruentes.length) : 0;
    const tiempoIncongruente = ensayosIncongruentes.length > 0 ? 
      Math.round(ensayosIncongruentes.reduce((sum, r) => sum + r.tiempoReaccion, 0) / ensayosIncongruentes.length) : 0;
    const efectoValidez = tiempoIncongruente - tiempoCongruente;

    if (estadoJuego.respuestasIncorrectas >= MAX_FALLOS_PERMITIDOS) {
      return `Has alcanzado el límite de fallos. Completaste ${ensayoActual} ensayos con ${porcentajePrecision}% de precisión. Tu tiempo de reacción promedio fue ${tiempoPromedioReaccion}ms. Intenta mantener mayor concentración en la tarea.`;
    }
    
    if (ensayoActual >= 100) {
      return `¡Completaste todos los ensayos! Precisión: ${porcentajePrecision}%, tiempo de reacción promedio: ${tiempoPromedioReaccion}ms. Efecto de validez: ${efectoValidez}ms (diferencia entre ensayos incongruentes y congruentes). ${efectoValidez < 50 ? 'Excelente eficiencia atencional!' : efectoValidez < 100 ? 'Buena eficiencia atencional.' : 'Tu atención se beneficia moderadamente de las señales.'}`;
    }

    return `Tu atención visual ${aciertosCongruentes > aciertosIncongruentes ? 'responde mejor cuando las señales anticipan correctamente la ubicación del estímulo' : aciertosIncongruentes > aciertosCongruentes ? 'es más flexible y menos dependiente de señales externas' : 'es equilibrada entre ensayos con señales correctas e incorrectas'}.`;
  };

  return (
    <GameLayout
      title="Señalización de Posner"
      description={
        <div>
          <p>Fija tu vista en el <b>+</b> central. Aparecerá una flecha (← o →) y luego una estrella (★).</p>
          <p>Responde indicando en qué lado aparece el estímulo. Usa clics o flechas del teclado.</p>
        </div>
      }
      stats={{ 
        ensayo: ensayoActual + 1, 
        puntuacion: estadoJuego.puntuacion, 
        fallos: estadoJuego.respuestasIncorrectas, 
        tiempo: formatearTiempo(tiempoRestante),
        maxFallos: MAX_FALLOS_PERMITIDOS
      }}
      gameOver={estadoJuego.juegoTerminado}
      finalStats={{ 
        completado: estadoJuego.respuestasIncorrectas < MAX_FALLOS_PERMITIDOS, 
        ensayos: ensayoActual, 
        aciertos: estadoJuego.respuestasCorrectas, 
        errores: estadoJuego.respuestasIncorrectas, 
        puntuacionFinal: estadoJuego.puntuacion,
        motivoFin: estadoJuego.respuestasIncorrectas >= MAX_FALLOS_PERMITIDOS ? "Límite de fallos alcanzado" : "Juego completado"
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
      onFallo={estadoJuego.respuestasIncorrectas}
      onCorrectAnswer={estadoJuego.puntuacion}
    >
      {!estadoJuego.juegoTerminado ? (
        <div className="juego6-container">
          <div className="cajas-container">
            <Caja
              lado="izquierda"
              mostrar={mostrarEstimulo && estimulo === "izquierda"}
              correcta={respuestaCorrecta === "izquierda"}
              onClick={() => manejarRespuesta("izquierda")}
            />
            <div className="punto-fijacion">
              <span>{mostrarFlecha && flecha ? (flecha === "izquierda" ? "←" : "→") : "+"}</span>
            </div>
            <Caja
              lado="derecha"
              mostrar={mostrarEstimulo && estimulo === "derecha"}
              correcta={respuestaCorrecta === "derecha"}
              onClick={() => manejarRespuesta("derecha")}
            />
          </div>
          <div className="controles">
            <button onClick={() => manejarRespuesta("izquierda")} disabled={!puedeResponder}>Izquierda</button>
            <button onClick={() => manejarRespuesta("derecha")} disabled={!puedeResponder}>Derecha</button>
          </div>
        </div>
      ) : (
        // Mostrar estado de guardado cuando termine el juego
        <div className="juego6-container">
          <div style={{ textAlign: 'center', padding: '20px' }}>
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

export default Juego6;