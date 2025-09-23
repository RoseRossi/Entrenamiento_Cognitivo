import React, { useState, useEffect, useCallback, useRef, useMemo, useReducer } from "react";
import { generarEnsayo, verificarRespuesta } from "./juego6_funciones";
import GameLayout from "../GameLayout/GameLayout";
import { auth } from "../../../services/firebase/firebaseConfig";
import { gameService } from "../../../services/firebase/gameService";
import { userService } from "../../../services/firebase/userService";
import "./juego6_estilos.css";

// Configuración de niveles progresivos
const CONFIGURACION_NIVELES = {
  0: { // Tutorial (ensayos 1-10)
    nombre: "Tutorial",
    ensayoInicio: 1,
    ensayoFin: 10,
    validezFlecha: 0.8,
    soaMin: 300,
    soaMax: 500,
    duracionEstimulo: 800,
    iti: 600,
    limiteRespuesta: 1500,
    descripcion: "Flechas y estrella grandes; sin cambios de color",
    maxFallos: 3
  },
  1: { // Básico (ensayos 11-60)
    nombre: "Básico",
    ensayoInicio: 11,
    ensayoFin: 60,
    validezFlecha: 0.7,
    soaMin: 250,
    soaMax: 450,
    duracionEstimulo: 700,
    iti: 550,
    limiteRespuesta: 1200,
    descripcion: "Ligera variación de color de flechas",
    maxFallos: 4
  },
  2: { // Intermedio (ensayos 61-80)
    nombre: "Intermedio",
    ensayoInicio: 61,
    ensayoFin: 80,
    validezFlecha: 0.6,
    soaMin: 200,
    soaMax: 400,
    duracionEstimulo: 600,
    iti: 500,
    limiteRespuesta: 1000,
    descripcion: "10% ensayos 'neutros' (sin señal); tamaños normales",
    maxFallos: 4
  },
  3: { // Avanzado (ensayos 81-100)
    nombre: "Avanzado",
    ensayoInicio: 81,
    ensayoFin: 100,
    validezFlecha: 0.6,
    soaMin: 150,
    soaMax: 350,
    duracionEstimulo: 500,
    iti: 450,
    limiteRespuesta: 900,
    descripcion: "10% catch trials (sin objetivo); colores/forma ligeramente variables",
    maxFallos: 3
  },
  4: { // Experto (ensayos 101-110)
    nombre: "Experto",
    ensayoInicio: 101,
    ensayoFin: 110,
    validezFlecha: 0.55,
    soaMin: 100,
    soaMax: 300,
    duracionEstimulo: 400,
    iti: 400,
    limiteRespuesta: 800,
    descripcion: "15% neutros, 10% catch; estrella pequeña; jitter en posiciones",
    maxFallos: 3
  }
};

const TOTAL_ENSAYOS = 110;

// Estados del juego usando reducer
const initialGameState = {
  ensayoActual: 1, // Empezar desde 1
  puntuacion: 0,
  respuestasCorrectas: 0,
  respuestasIncorrectas: 0,
  juegoTerminado: false,
  mostrarEstimulo: false,
  puedeResponder: false,
  mostrarFlecha: false,
  tiempoJugando: 0, // Cronómetro continuo en segundos
  juegoIniciado: false,
  nivelActual: 0 // Nivel actual (0-4)
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'INICIAR_JUEGO':
      return {
        ...state,
        juegoIniciado: true,
        tiempoJugando: 0
      };
    case 'ACTUALIZAR_TIEMPO_JUEGO':
      return {
        ...state,
        tiempoJugando: state.tiempoJugando + 1
      };
    case 'ACTUALIZAR_NIVEL':
      return {
        ...state,
        nivelActual: action.nivel
      };
    case 'INICIAR_ENSAYO':
      return {
        ...state,
        mostrarEstimulo: false,
        puedeResponder: false,
        mostrarFlecha: false
      };
    case 'MOSTRAR_FLECHA':
      return { ...state, mostrarFlecha: true };
    case 'OCULTAR_FLECHA':
      return { ...state, mostrarFlecha: false };
    case 'MOSTRAR_ESTIMULO':
      return { ...state, mostrarEstimulo: true, puedeResponder: true };
    case 'PROCESAR_RESPUESTA':
      return {
        ...state,
        puntuacion: state.puntuacion + (action.esCorrecta ? 1 : 0),
        respuestasCorrectas: state.respuestasCorrectas + (action.esCorrecta ? 1 : 0),
        respuestasIncorrectas: state.respuestasIncorrectas + (action.esCorrecta ? 0 : 1),
        mostrarEstimulo: false,
        puedeResponder: false
      };
    case 'TIMEOUT_ENSAYO':
      return {
        ...state,
        respuestasIncorrectas: state.respuestasIncorrectas + 1,
        mostrarEstimulo: false,
        puedeResponder: false
      };
    case 'SIGUIENTE_ENSAYO':
      return { ...state, ensayoActual: state.ensayoActual + 1 };
    case 'TERMINAR_JUEGO':
      return { ...state, juegoTerminado: true };
    case 'REINICIAR_JUEGO':
      return { ...initialGameState };
    default:
      return state;
  }
};

// Hook para determinar nivel actual basado en ensayo
const useNivelActual = (ensayoActual) => {
  return useMemo(() => {
    for (let nivel = 0; nivel <= 4; nivel++) {
      const config = CONFIGURACION_NIVELES[nivel];
      if (ensayoActual >= config.ensayoInicio && ensayoActual <= config.ensayoFin) {
        return nivel;
      }
    }
    return 4; // Por defecto experto
  }, [ensayoActual]);
};

// Hook personalizado para cálculos estadísticos
const useEstadisticas = (respuestasDetalladas, tiemposReaccion) => {
  return useMemo(() => {
    if (!respuestasDetalladas.length) {
      return {
        tiempoCongruente: 0,
        tiempoIncongruente: 0,
        efectoValidez: 0,
        tiempoPromedio: 0,
        precision: 0
      };
    }
    
    const congruentes = respuestasDetalladas.filter(r => r.congruente && r.correcta);
    const incongruentes = respuestasDetalladas.filter(r => !r.congruente && r.correcta);
    
    const tiempoCongruente = congruentes.length > 0 ? 
      Math.round(congruentes.reduce((sum, r) => sum + r.tiempoReaccion, 0) / congruentes.length) : 0;
    const tiempoIncongruente = incongruentes.length > 0 ? 
      Math.round(incongruentes.reduce((sum, r) => sum + r.tiempoReaccion, 0) / incongruentes.length) : 0;
    
    const efectoValidez = tiempoIncongruente - tiempoCongruente;
    const tiempoPromedio = tiemposReaccion.length > 0 ? 
      Math.round(tiemposReaccion.reduce((a, b) => a + b, 0) / tiemposReaccion.length) : 0;
    const precision = respuestasDetalladas.length > 0 ? 
      Math.round((respuestasDetalladas.filter(r => r.correcta).length / respuestasDetalladas.length) * 100) : 0;
    
    return {
      tiempoCongruente,
      tiempoIncongruente,
      efectoValidez,
      tiempoPromedio,
      precision
    };
  }, [respuestasDetalladas, tiemposReaccion]);
};

const Juego6 = () => {
  // Estado principal usando reducer
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
  // Determinar nivel actual
  const nivelActual = useNivelActual(gameState.ensayoActual);
  const configNivel = CONFIGURACION_NIVELES[nivelActual];
  
  // Estados específicos del juego
  const [flecha, setFlecha] = useState(null);
  const [estimulo, setEstimulo] = useState(null);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(null);
  const [aciertosCongruentes, setAciertosCongruentes] = useState(0);
  const [aciertosIncongruentes, setAciertosIncongruentes] = useState(0);
  const [tiemposReaccion, setTiemposReaccion] = useState([]);
  const [respuestasDetalladas, setRespuestasDetalladas] = useState([]);
  
  // Estados para Firebase
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [resultadoGuardado, setResultadoGuardado] = useState(false);
  
  // Refs
  const ensayoActualRef = useRef(null);
  const tiempoInicioRef = useRef(null);
  const timeoutsRef = useRef(new Map());
  const tiempoJuegoRef = useRef(null);
  
  // Hook para estadísticas
  const estadisticas = useEstadisticas(respuestasDetalladas, tiemposReaccion);
  
  // Actualizar nivel cuando cambie el ensayo
  useEffect(() => {
    if (gameState.nivelActual !== nivelActual) {
      dispatch({ type: 'ACTUALIZAR_NIVEL', nivel: nivelActual });
    }
  }, [nivelActual, gameState.nivelActual]);
  
  // Función para limpiar timeouts e intervals
  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();

  }, []);

    // Función separada para limpiar todo incluyendo cronómetro
  const clearAllIncludingTimer = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
    
    // Limpiar contador de tiempo de juego
    if (tiempoJuegoRef.current) {
      clearInterval(tiempoJuegoRef.current);
      tiempoJuegoRef.current = null;
    }
  }, []);

  // Función para crear timeout manejado
  const setManagedTimeout = useCallback((id, callback, delay) => {
    const existingTimeout = timeoutsRef.current.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    const timeoutId = setTimeout(() => {
      callback();
      timeoutsRef.current.delete(id);
    }, delay);
    
    timeoutsRef.current.set(id, timeoutId);
    return timeoutId;
  }, []);
  
  // Tipos de flechas adaptados al nivel
  const tiposFlechas = useMemo(() => {
    const flechasBase = [
      { izquierda: "←", derecha: "→", color: "#3498db", nombre: "flecha-basica" }
    ];
    
    // Añadir variaciones según el nivel
    if (nivelActual >= 1) { // Básico en adelante
      flechasBase.push(
        { izquierda: "⇐", derecha: "⇒", color: "#e74c3c", nombre: "flecha-doble" },
        { izquierda: "◄", derecha: "►", color: "#9b59b6", nombre: "triangulo" }
      );
    }
    
    if (nivelActual >= 3) { // Avanzado en adelante
      flechasBase.push(
        { izquierda: "⬅", derecha: "➡", color: "#f39c12", nombre: "flecha-gruesa" },
        { izquierda: "↞", derecha: "↠", color: "#1abc9c", nombre: "flecha-curva" },
        { izquierda: "⟵", derecha: "⟶", color: "#e67e22", nombre: "flecha-larga" }
      );
    }
    
    return flechasBase;
  }, [nivelActual]);
  
  // Memoización de ensayos para todo el juego
  const ensayos = useMemo(() => {
    const todosLosEnsayos = [];
    
    // Generar ensayos para cada nivel
    for (let nivel = 0; nivel <= 4; nivel++) {
      const config = CONFIGURACION_NIVELES[nivel];
      const totalEnsayosNivel = config.ensayoFin - config.ensayoInicio + 1;
      const cantidadCongruentes = Math.round(totalEnsayosNivel * config.validezFlecha);
      
      const ensayosNivel = Array.from({ length: totalEnsayosNivel }, (_, i) => i < cantidadCongruentes);
      
      // Fisher-Yates Shuffle para este nivel
      for (let i = ensayosNivel.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ensayosNivel[i], ensayosNivel[j]] = [ensayosNivel[j], ensayosNivel[i]];
      }
      
      todosLosEnsayos.push(...ensayosNivel);
    }
    
    return todosLosEnsayos;
  }, []);

  // Función para calcular SOA según nivel actual
  const calcularSOA = useCallback(() => {
    return Math.random() * (configNivel.soaMax - configNivel.soaMin) + configNivel.soaMin;
  }, [configNivel]);

  // Función para terminar el juego
  const terminarJuego = useCallback(() => {
    console.log('Terminando juego');
    clearAllIncludingTimer(); // Usar la función que incluye el timer
    dispatch({ type: 'TERMINAR_JUEGO' });
  }, [clearAllIncludingTimer]);

  // Iniciar contador de tiempo de juego
  const iniciarContadorTiempo = useCallback(() => {
    if (tiempoJuegoRef.current) {
      clearInterval(tiempoJuegoRef.current);
    }
    
    tiempoJuegoRef.current = setInterval(() => {
      dispatch({ type: 'ACTUALIZAR_TIEMPO_JUEGO' });
    }, 1000); // Actualizar cada segundo
  }, []);

  // Guardar resultado optimizado
  const guardarResultado = useCallback(async () => {
    if (!user || resultadoGuardado) {
      console.log('No hay usuario autenticado o resultado ya guardado');
      return;
    }

    try {
      console.log('Guardando resultado del Juego 6...');
      
      const tiempoTranscurrido = gameState.tiempoJugando;
      const ensayosCompletados = gameState.ensayoActual - 1; // -1 porque empezamos desde 1
      
      const porcentajeCompletado = Math.round((ensayosCompletados / TOTAL_ENSAYOS) * 100);
      
      // Separar ensayos por tipo con validación
      const ensayosCongruentes = respuestasDetalladas.filter(r => r && r.congruente);
      const ensayosIncongruentes = respuestasDetalladas.filter(r => r && !r.congruente);
      
      // Score optimizado
      const scoreBase = Math.round((estadisticas.precision * 0.6) + (porcentajeCompletado * 0.3));
      const bonusEficiencia = estadisticas.efectoValidez < 50 ? 10 : (estadisticas.efectoValidez < 100 ? 5 : 0);
      const scoreFinal = Math.min(100, scoreBase + bonusEficiencia);

      // Cálculos seguros para evitar errores
      const calcularVariabilidad = () => {
        if (tiemposReaccion.length <= 1) return 0;
        const mean = estadisticas.tiempoPromedio;
        const variance = tiemposReaccion.reduce((sum, rt) => sum + Math.pow(rt - mean, 2), 0) / (tiemposReaccion.length - 1);
        return Math.round(Math.sqrt(variance));
      };

      const resultData = {
        userId: user.uid,
        gameId: 'posner_haciendo_cola',
        cognitiveDomain: 'atencion',
        level: `progresivo_0-4`,
        score: scoreFinal,
        timeSpent: tiempoTranscurrido,
        correctAnswers: gameState.respuestasCorrectas,
        totalQuestions: ensayosCompletados,
        details: {
          modalidadJuego: 'progresivo',
          nivelAlcanzado: nivelActual,
          totalEnsayosPosibles: TOTAL_ENSAYOS,
          porcentajeCompletado,
          porcentajePrecision: estadisticas.precision,
          fallosTotales: gameState.respuestasIncorrectas,
          razonTermino: gameState.ensayoActual > TOTAL_ENSAYOS ? 'completado' : 'usuario_salio',
          aciertosCongruentes,
          aciertosIncongruentes,
          totalEnsayosCongruentes: ensayosCongruentes.length,
          totalEnsayosIncongruentes: ensayosIncongruentes.length,
          tiempoReaccionCongruente: estadisticas.tiempoCongruente,
          tiempoReaccionIncongruente: estadisticas.tiempoIncongruente,
          efectoValidez: estadisticas.efectoValidez,
          tiempoReaccionPromedio: estadisticas.tiempoPromedio,
          tiempoReaccionMinimo: tiemposReaccion.length > 0 ? Math.min(...tiemposReaccion) : 0,
          tiempoReaccionMaximo: tiemposReaccion.length > 0 ? Math.max(...tiemposReaccion) : 0,
          variabilidadTiempoReaccion: calcularVariabilidad(),
          respuestasDetalladas,
          tiemposReaccionCompletos: tiemposReaccion,
          configuracionNiveles: CONFIGURACION_NIVELES
        }
      };

      await gameService.saveGameResult(resultData);
      await userService.updateUserProgress(user.uid, 'atencion', scoreFinal);
      
      console.log('Resultado del Juego 6 guardado exitosamente');
      setResultadoGuardado(true);
      
    } catch (error) {
      console.error('Error guardando resultado del Juego 6:', error);
    }
  }, [user, gameState, aciertosCongruentes, aciertosIncongruentes, tiemposReaccion, respuestasDetalladas, estadisticas, resultadoGuardado, nivelActual]);

  // Función para iniciar ensayo adaptada al nivel progresivo
  const iniciarEnsayo = useCallback(() => {
    console.log('=== INICIANDO ENSAYO ===', gameState.ensayoActual, 'Nivel:', nivelActual, configNivel.nombre);
    
    if (gameState.juegoTerminado || gameState.ensayoActual > TOTAL_ENSAYOS) {
      console.log('Juego terminado o ensayos completados');
      return;
    }

    clearAll();

    const indiceEnsayo = gameState.ensayoActual - 1; // Convertir a índice 0-based
    const tipoEnsayo = ensayos[indiceEnsayo];
    const { direccionFlecha, ubicacionEstimulo, congruente } = generarEnsayo(tipoEnsayo);
    
    // Seleccionar tipo de flecha según nivel actual
    const tipoFlecha = tiposFlechas[Math.floor(Math.random() * tiposFlechas.length)];
    
    ensayoActualRef.current = { congruente, tipoFlecha };
    setFlecha(direccionFlecha);
    setEstimulo(ubicacionEstimulo);
    setRespuestaCorrecta(null);

    dispatch({ type: 'INICIAR_ENSAYO' });

    // Usar SOA del nivel actual
    const soa = calcularSOA();
    console.log('Configuración ensayo:', { direccionFlecha, ubicacionEstimulo, congruente, soa, nivel: configNivel.nombre });
    
    // 1. Mostrar flecha después del SOA
    setManagedTimeout('mostrar-flecha', () => {
      console.log('>>> Mostrando flecha');
      dispatch({ type: 'MOSTRAR_FLECHA' });
      
      // 2. Ocultar flecha después de 1 segundo
      setManagedTimeout('ocultar-flecha', () => {
        console.log('>>> Ocultando flecha');
        dispatch({ type: 'OCULTAR_FLECHA' });
        
        // 3. Mostrar estímulo después del ITI
        setManagedTimeout('mostrar-estimulo', () => {
          console.log('>>> Mostrando estímulo');
          tiempoInicioRef.current = Date.now();
          dispatch({ type: 'MOSTRAR_ESTIMULO' });

          // 4. Timeout para respuesta según nivel actual
          setManagedTimeout('timeout-respuesta', () => {
            console.log('>>> Timeout de respuesta alcanzado');
            dispatch({ type: 'TIMEOUT_ENSAYO' });
            
            // Continuar al siguiente ensayo después del timeout
            setManagedTimeout('siguiente-ensayo-timeout', () => {
              if (gameState.ensayoActual < TOTAL_ENSAYOS) {
                dispatch({ type: 'SIGUIENTE_ENSAYO' });
              } else {
                terminarJuego();
              }
            }, 500);
          }, configNivel.duracionEstimulo);
          
        }, configNivel.iti);
      }, 1000);
    }, soa);
  }, [gameState.ensayoActual, gameState.juegoTerminado, ensayos, clearAll, calcularSOA, terminarJuego, setManagedTimeout, tiposFlechas, configNivel, nivelActual]);

  // Función para manejar respuestas
  const manejarRespuesta = useCallback((respuesta) => {
    if (!gameState.puedeResponder || !gameState.mostrarEstimulo) {
      console.log('No puede responder en este momento');
      return;
    }

    console.log('>>> RESPUESTA RECIBIDA:', respuesta);

    let tiempoReaccion = 0;
    if (tiempoInicioRef.current !== null) {
      tiempoReaccion = Date.now() - tiempoInicioRef.current;
      setTiemposReaccion(prev => [...prev, tiempoReaccion]);
    }

    const esCorrecta = verificarRespuesta(respuesta, estimulo);
    setRespuestaCorrecta(esCorrecta ? estimulo : null);

    // Registrar respuesta detallada
    const respuestaDetallada = {
      ensayoNumero: gameState.ensayoActual,
      nivel: nivelActual,
      nombreNivel: configNivel.nombre,
      congruente: ensayoActualRef.current?.congruente || false,
      direccionFlecha: flecha,
      tipoFlecha: ensayoActualRef.current?.tipoFlecha?.nombre || 'desconocido',
      colorFlecha: ensayoActualRef.current?.tipoFlecha?.color || '#000000',
      ubicacionEstimulo: estimulo,
      respuestaUsuario: respuesta,
      correcta: esCorrecta,
      tiempoReaccion,
      tiempoRespuesta: gameState.tiempoJugando
    };
    setRespuestasDetalladas(prev => [...prev, respuestaDetallada]);

    // Actualizar contadores por tipo
    if (ensayoActualRef.current && esCorrecta) {
      const { congruente } = ensayoActualRef.current;
      if (congruente) {
        setAciertosCongruentes(prev => prev + 1);
      } else {
        setAciertosIncongruentes(prev => prev + 1);
      }
    }

    dispatch({ type: 'PROCESAR_RESPUESTA', esCorrecta });
    clearAll();

    console.log('Respuesta procesada:', { esCorrecta, tiempoReaccion });

    // Continuar al siguiente ensayo
    if (gameState.ensayoActual < TOTAL_ENSAYOS) {
      setManagedTimeout('siguiente-ensayo', () => {
        dispatch({ type: 'SIGUIENTE_ENSAYO' });
      }, 1000);
    } else {
      terminarJuego();
    }
  }, [gameState.puedeResponder, gameState.mostrarEstimulo, gameState.ensayoActual, gameState.tiempoJugando, estimulo, flecha, clearAll, terminarJuego, setManagedTimeout, nivelActual, configNivel]);

  // Función para iniciar el juego
  const iniciarJuego = useCallback(() => {
    console.log('=== INICIANDO JUEGO PROGRESIVO ===');
    dispatch({ type: 'INICIAR_JUEGO' });
    iniciarContadorTiempo();
    
    // Iniciar contador inmediatamente
    iniciarContadorTiempo();

    // Pequeño delay para asegurar que el estado se actualice
    setTimeout(() => {
      iniciarEnsayo();
    }, 100);
  }, [iniciarEnsayo, iniciarContadorTiempo]);

  // Inicialización
  useEffect(() => {
    console.log('Componente montado, inicializando juego progresivo...');
    setUser(auth.currentUser);
    setTiempoInicio(Date.now());
    
    // Iniciar automáticamente sin delay
    if (!gameState.juegoIniciado && !gameState.juegoTerminado) {
      iniciarJuego();
    }

    return () => {
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar resultado cuando termine
  useEffect(() => {
    if (gameState.juegoTerminado && !resultadoGuardado && user && tiempoInicio) {
      guardarResultado();
    }
  }, [gameState.juegoTerminado, resultadoGuardado, user, tiempoInicio, guardarResultado]);

  // Efecto para continuar ensayos
  useEffect(() => {
    if (gameState.ensayoActual > 1 && !gameState.juegoTerminado && gameState.juegoIniciado) {
      console.log('Continuando con ensayo:', gameState.ensayoActual, 'Nivel:', configNivel.nombre);
      const timeoutId = setTimeout(() => {
        iniciarEnsayo();
      }, 200);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.ensayoActual]);

  // Event listeners para teclado
  useEffect(() => {
    const listener = (e) => {
      if (!gameState.puedeResponder) return;
      if (e.key === "ArrowLeft") manejarRespuesta("izquierda");
      if (e.key === "ArrowRight") manejarRespuesta("derecha");
    };

    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [gameState.puedeResponder, manejarRespuesta]);

  // Función para reiniciar el juego
  const reiniciarJuego = useCallback(() => {
    console.log('=== REINICIANDO JUEGO PROGRESIVO ===');
    clearAllIncludingTimer(); // Usar la función que incluye el timer
    dispatch({ type: 'REINICIAR_JUEGO' });
    setFlecha(null);
    setEstimulo(null);
    setRespuestaCorrecta(null);
    setAciertosCongruentes(0);
    setAciertosIncongruentes(0);
    setResultadoGuardado(false);
    setRespuestasDetalladas([]);
    setTiemposReaccion([]);
    setTiempoInicio(Date.now());
    
    setTimeout(() => {
      iniciarJuego();
    }, 500);
  }, [clearAllIncludingTimer, iniciarJuego]);

  // Componente Caja adaptado al nivel actual
  const Caja = React.memo(({ lado, mostrar, correcta, onClick }) => {
    const estiloTamaño = nivelActual === 0 ? { // Tutorial
      fontSize: '3rem', 
      width: '120px', 
      height: '120px' 
    } : nivelActual === 4 ? { // Experto
      fontSize: '1.5rem', 
      width: '80px', 
      height: '80px' 
    } : {};

    return (
      <div
        className={`caja ${mostrar ? "estimulo" : ""} ${correcta ? "correcta" : ""}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={`Caja ${lado}`}
        style={estiloTamaño}
      >
        {mostrar && "★"}
      </div>
    );
  });

  // Función para generar análisis
  const generarAnalisis = useCallback(() => {
    const porcentajeCompletado = Math.round(((gameState.ensayoActual - 1) / TOTAL_ENSAYOS) * 100);
    
    if (gameState.ensayoActual > TOTAL_ENSAYOS) {
      return `¡Completaste todos los niveles! Progresión: Tutorial → Básico → Intermedio → Avanzado → Experto. Precisión: ${estadisticas.precision}%, tiempo de reacción promedio: ${estadisticas.tiempoPromedio}ms. Efecto de validez: ${estadisticas.efectoValidez}ms. ${estadisticas.efectoValidez < 50 ? 'Excelente eficiencia atencional!' : estadisticas.efectoValidez < 100 ? 'Buena eficiencia atencional.' : 'Tu atención se beneficia moderadamente de las señales.'}`;
    }

    return `Progreso: ${porcentajeCompletado}% completado. Nivel actual: ${configNivel.nombre}. Tu atención visual ${aciertosCongruentes > aciertosIncongruentes ? 'responde mejor cuando las señales anticipan correctamente la ubicación del estímulo' : aciertosIncongruentes > aciertosCongruentes ? 'es más flexible y menos dependiente de señales externas' : 'es equilibrada entre ensayos con señales correctas e incorrectas'}.`;
  }, [gameState.ensayoActual, estadisticas, aciertosCongruentes, aciertosIncongruentes, configNivel]);

  return (
    <GameLayout
      title="Señalización de Posner - Progresivo"
      description={
        <div>
          <p>Fija tu vista en el <b>+</b> central. Aparecerá una flecha (← o →) y luego una estrella (★).</p>
          <p>Responde indicando en qué lado aparece el estímulo. Usa clics o flechas del teclado.</p>
          <p><em>El juego progresa automáticamente a través de 5 niveles de dificultad.</em></p>
          <p><strong>Nivel actual:</strong> {configNivel.nombre} - {configNivel.descripcion}</p>
        </div>
      }
      stats={{ 
        nivel: nivelActual,
        ensayo: `${gameState.ensayoActual}/${TOTAL_ENSAYOS}`, 
        puntuacion: gameState.puntuacion, 
        fallos: gameState.respuestasIncorrectas, 
        tiempo: gameState.tiempoJugando
      }}
      gameOver={gameState.juegoTerminado}
      finalStats={{ 
        completado: gameState.ensayoActual > TOTAL_ENSAYOS, 
        ensayos: `${gameState.ensayoActual - 1}/${TOTAL_ENSAYOS}`, 
        aciertos: gameState.respuestasCorrectas, 
        errores: gameState.respuestasIncorrectas, 
        puntuacionFinal: gameState.puntuacion,
        tiempo: gameState.tiempoJugando,
        level: `${configNivel.nombre} (Nivel ${nivelActual})`,
        motivoFin: gameState.ensayoActual > TOTAL_ENSAYOS ? "Juego completado" : "Juego interrumpido"
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
      // nivel={nivelActual}
      // tiempoTranscurrido={formatearCronometro(gameState.tiempoJugando)}
      onFallo={gameState.respuestasIncorrectas}
      onCorrectAnswer={gameState.puntuacion}
    >
      {!gameState.juegoTerminado ? (
        <div className="juego6-container">
          {!gameState.juegoIniciado ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3>Señalización de Posner - Modo Progresivo</h3>
              <p>Progresarás automáticamente a través de 5 niveles:</p>
              <div style={{ textAlign: 'left', maxWidth: '400px', margin: '20px auto' }}>
                <p>📚 <strong>Nivel 0 - Tutorial:</strong> Ensayos 1-10</p>
                <p>🎯 <strong>Nivel 1 - Básico:</strong> Ensayos 11-60</p>
                <p>⚡ <strong>Nivel 2 - Intermedio:</strong> Ensayos 61-80</p>
                <p>🔥 <strong>Nivel 3 - Avanzado:</strong> Ensayos 81-100</p>
                <p>🏆 <strong>Nivel 4 - Experto:</strong> Ensayos 101-110</p>
              </div>
              <button 
                onClick={iniciarJuego}
                style={{
                  padding: '15px 30px',
                  fontSize: '18px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginTop: '20px'
                }}
              >
                Iniciar Juego Progresivo
              </button>
            </div>
          ) : (
            <>
              <div className="info-nivel" style={{ textAlign: 'center', marginBottom: '20px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#2c3e50' }}>
                  🎮 Nivel {nivelActual}: {configNivel.nombre}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#7f8c8d' }}>
                  Ensayos {configNivel.ensayoInicio}-{configNivel.ensayoFin} | {configNivel.descripcion}
                </p>
              </div>
              <div className="cajas-container">
                <Caja
                  lado="izquierda"
                  mostrar={gameState.mostrarEstimulo && estimulo === "izquierda"}
                  correcta={respuestaCorrecta === "izquierda"}
                  onClick={() => manejarRespuesta("izquierda")}
                />
                <div className="punto-fijacion">
                  <span 
                    style={{ 
                      color: ensayoActualRef.current?.tipoFlecha?.color || "#000000",
                      fontSize: nivelActual === 0 ? "3.5rem" : nivelActual === 4 ? "2rem" : "2.5rem",
                      fontWeight: "bold"
                    }}
                  >
                    {gameState.mostrarFlecha && flecha && ensayoActualRef.current?.tipoFlecha ? 
                      (flecha === "izquierda" ? 
                        ensayoActualRef.current.tipoFlecha.izquierda : 
                        ensayoActualRef.current.tipoFlecha.derecha
                      ) : 
                      "+"
                    }
                  </span>
                </div>
                <Caja
                  lado="derecha"
                  mostrar={gameState.mostrarEstimulo && estimulo === "derecha"}
                  correcta={respuestaCorrecta === "derecha"}
                  onClick={() => manejarRespuesta("derecha")}
                />
              </div>
              <div className="controles">
                <button 
                  onClick={() => manejarRespuesta("izquierda")} 
                  disabled={!gameState.puedeResponder}
                  aria-label="Responder izquierda"
                >
                  Izquierda (←)
                </button>
                <button 
                  onClick={() => manejarRespuesta("derecha")} 
                  disabled={!gameState.puedeResponder}
                  aria-label="Responder derecha"
                >
                  Derecha (→)
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="juego6-container">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {resultadoGuardado ? (
              <p style={{ color: '#22c55e', fontWeight: 'bold' }}>
                ✅ Resultado guardado correctamente
              </p>
            ) : (
              <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                ⏳ Guardando resultado...
              </p>
            )}
          </div>
        </div>
      )}
    </GameLayout>
  );
};

export default Juego6;