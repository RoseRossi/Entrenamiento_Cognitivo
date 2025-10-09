import React, { useEffect, useState, useCallback, useRef } from "react";
import GameLayout from "../GameLayout/GameLayout";
import { auth } from "../../../services/firebase/firebaseConfig";
import { gameService } from "../../../services/firebase/gameService";
import { userService } from "../../../services/firebase/userService";
import { generarCirculos, generarSecuencia, JUEGO7_CONFIG } from "./juego7_funciones";
import "./juego7_estilo.css";

const Juego7 = () => {
  // Estado del nivel actual
  const [nivelActual, setNivelActual] = useState(JUEGO7_CONFIG.START_LEVEL);

  // Estados del juego
  const [circulos, setCirculos] = useState([]);
  const [secuencia, setSecuencia] = useState([]);
  const [resaltando, setResaltando] = useState(false);
  const [respuesta, setRespuesta] = useState([]);
  const [amplitud, setAmplitud] = useState(3); // Longitud de la secuencia actual
  const [amplitudInicial, setAmplitudInicial] = useState(3); // Para rastrear la amplitud inicial del nivel
  const [fallosConsecutivos, setFallosConsecutivos] = useState(0);
  const [aciertosSeguidos, setAciertosSeguidos] = useState(0); // Para seguimiento de aciertos consecutivos
  const [ensayos, setEnsayos] = useState(0);
  const [aciertos, setAciertos] = useState(0); // Total de aciertos (score)
  const [fallosTotales, setFallosTotales] = useState(0); // Total de fallos
  const [fallosEnSecuenciaActual, setFallosEnSecuenciaActual] = useState(0); // Fallos en la secuencia actual
  const [tiempo, setTiempo] = useState(0); // Tiempo restante para responder
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [juegoIniciado, setJuegoIniciado] = useState(false);

  // Estados para Firebase
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [resultadoGuardado, setResultadoGuardado] = useState(false);
  const [ensayosDetallados, setEnsayosDetallados] = useState([]);
  const [tiempoInicioEnsayo, setTiempoInicioEnsayo] = useState(null);

  // Refs para seguimiento de estado
  const ensayoActualRef = useRef(null);
  const ensayoIniciadoRef = useRef(false);
  const timerRef = useRef(null); // Para el temporizador de respuesta

  // Función para obtener configuración del nivel actual
  const getNivelConfig = useCallback(() => {
    const levels = ['BASICO', 'INTERMEDIO', 'AVANZADO'];
    const levelKey = levels[nivelActual - 1];
    return JUEGO7_CONFIG.LEVELS[levelKey];
  }, [nivelActual]);

  // Guardar resultado usando useCallback
  const guardarResultado = useCallback(async () => {
    if (!user) {
      console.log('No hay usuario autenticado para guardar resultado');
      return;
    }

    try {
      console.log('Guardando resultado del Juego 7...');

      const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000);
      const amplitudMaxima = amplitud;
      const ensayosCompletados = ensayos;
      const ensayosCorrectos = ensayosDetallados.filter(e => e.correcto).length;

      // Obtener nombre del nivel actual
      const levelConfig = getNivelConfig();

      // Calcular métricas específicas de memoria de trabajo visuoespacial
      const spanMemoria = amplitudMaxima; // Amplitud máxima alcanzada
      const porcentajePrecision = ensayosDetallados.length > 0 ? Math.round((ensayosCorrectos / ensayosDetallados.length) * 100) : 0;
      const eficienciaProgresion = amplitudMaxima - 3; // Progreso desde amplitud inicial

      // Analizar patrones de errores
      const erroresPorAmplitud = {};
      ensayosDetallados.forEach(ensayo => {
        if (!ensayo.correcto) {
          const amp = ensayo.amplitud;
          erroresPorAmplitud[amp] = (erroresPorAmplitud[amp] || 0) + 1;
        }
      });

      // Determinar nivel basado en span alcanzado y precisión
      let nivelJuego = levelConfig.nombre.toLowerCase();
      if (spanMemoria >= 6 && porcentajePrecision >= 80) {
        nivelJuego = 'avanzado';
      } else if (spanMemoria >= 5 && porcentajePrecision >= 70) {
        nivelJuego = 'intermedio';
      }

      // Score basado en span máximo y eficiencia
      const scoreSpan = Math.min(70, (spanMemoria - 3) * 10);
      const scorePrecision = porcentajePrecision * 0.3;
      const scoreFinal = Math.round(scoreSpan + scorePrecision);

      const resultData = {
        userId: user.uid,
        gameId: 'corsi_blocks',
        cognitiveDomain: 'memoria',
        level: nivelJuego,
        score: scoreFinal,
        timeSpent: tiempoTranscurrido,
        correctAnswers: ensayosCorrectos,
        totalQuestions: ensayosDetallados.length,
        details: {
          spanMemoriaVisuoespacial: spanMemoria,
          amplitudMaximaAlcanzada: amplitudMaxima,
          ensayosCompletados: ensayosCompletados,
          ensayosCorrectos: ensayosCorrectos,
          porcentajePrecision: porcentajePrecision,
          eficienciaProgresion: eficienciaProgresion,
          fallosTotales: fallosConsecutivos,
          razonTermino: fallosConsecutivos >= JUEGO7_CONFIG.FALLOS_CONSECUTIVOS_PARA_TERMINAR ? 'dos_fallos_consecutivos' :
            (spanMemoria >= 9 ? 'span_maximo_alcanzado' : 'usuario_salio'),
          erroresPorAmplitud: erroresPorAmplitud,
          secuenciasGeneradas: ensayosDetallados.map(e => e.secuenciaOriginal),
          respuestasUsuario: ensayosDetallados.map(e => e.respuestaUsuario),
          tiempoPromedioRespuesta: ensayosDetallados.length > 0 ?
            Math.round(ensayosDetallados.reduce((sum, e) => sum + e.tiempoRespuesta, 0) / ensayosDetallados.length) : 0,
          posicionesCirculos: circulos, // Configuración espacial usada
          ensayosDetallados: ensayosDetallados
        }
      };

      // Guardar resultado del juego
      await gameService.saveGameResult(resultData);

      // Actualizar progreso del usuario en el dominio cognitivo
      await userService.updateUserProgress(user.uid, 'memoria', scoreFinal);

      console.log('Resultado del Juego 7 guardado exitosamente');
      setResultadoGuardado(true);

    } catch (error) {
      console.error('Error guardando resultado del Juego 7:', error);
    }
  }, [user, tiempoInicio, amplitud, ensayos, fallosConsecutivos, ensayosDetallados, circulos, getNivelConfig]);

  // Inicialización del usuario y tiempo
  useEffect(() => {
    setUser(auth.currentUser);
    setTiempoInicio(Date.now());
  }, []);

  // Guardar resultado cuando el juego termine
  useEffect(() => {
    if (juegoTerminado && !resultadoGuardado && user && tiempoInicio) {
      guardarResultado();
    }
  }, [juegoTerminado, resultadoGuardado, user, tiempoInicio, guardarResultado]);

  // Generar círculos cuando cambia el nivel y el juego ha iniciado
  useEffect(() => {
    if (!juegoIniciado) return;

    const levelConfig = getNivelConfig();
    console.log('Generando círculos para nivel:', levelConfig.nombre, 'Amplitud inicial:', levelConfig.secuenciaInicial);

    // Resetear flag de ensayo iniciado
    ensayoIniciadoRef.current = false;

    // Generar círculos
    const nuevosCirculos = generarCirculos(levelConfig.numCirculos);
    setCirculos(nuevosCirculos);

    // Configurar amplitud - esto debe hacerse antes de que se genere la secuencia
    setAmplitudInicial(levelConfig.secuenciaInicial);
    setAmplitud(levelConfig.secuenciaInicial);

    console.log('Círculos generados:', nuevosCirculos.length, 'Amplitud configurada:', levelConfig.secuenciaInicial);
  }, [nivelActual, juegoIniciado, getNivelConfig]);

  // Función para iniciar un nuevo ensayo
  const iniciarEnsayo = useCallback(() => {
    if (circulos.length === 0) return;

    const levelConfig = getNivelConfig();
    // Usar amplitud actual, pero si es el primer ensayo, usar la amplitud inicial del nivel
    const amplitudActual = amplitud > 0 ? amplitud : levelConfig.secuenciaInicial;
    const nuevaSecuencia = generarSecuencia(circulos.length, amplitudActual);

    console.log('Iniciando ensayo:', {
      amplitud: amplitudActual,
      longitudSecuencia: nuevaSecuencia.length,
      secuencia: nuevaSecuencia,
      tiempoResaltado: levelConfig.tiempoResaltado,
      tiempoEntrePasos: levelConfig.tiempoEntrePasos
    });

    setSecuencia(nuevaSecuencia);
    setRespuesta([]);
    setResaltando(true);
    setTiempoInicioEnsayo(Date.now());

    // Resaltar cada círculo en secuencia
    nuevaSecuencia.forEach((i, index) => {
      // Calcular tiempos absolutos desde el inicio, empezando con 500ms de delay inicial
      const DELAY_INICIAL = 500;
      const tiempoInicio = DELAY_INICIAL + (levelConfig.tiempoResaltado + levelConfig.tiempoEntrePasos) * index;
      const tiempoFin = tiempoInicio + levelConfig.tiempoResaltado;

      // Mostrar el círculo
      setTimeout(() => {
        const circulo = document.getElementById(`circulo-${i}`);
        console.log(`Resaltando círculo ${index + 1}/${nuevaSecuencia.length} (id: circulo-${i}) en t=${tiempoInicio}ms`);

        if (circulo) {
          circulo.classList.add("resaltado");
        } else {
          console.error(`No se encontró el círculo con id: circulo-${i}`);
        }
      }, tiempoInicio);

      // Ocultar el círculo
      setTimeout(() => {
        const circulo = document.getElementById(`circulo-${i}`);
        if (circulo) {
          circulo.classList.remove("resaltado");
          console.log(`Círculo ${index + 1}/${nuevaSecuencia.length} resaltado removido en t=${tiempoFin}ms`);
        }

        // Si es el último círculo, terminar fase de resaltado después del intervalo final
        if (index === nuevaSecuencia.length - 1) {
          setTimeout(() => {
            console.log('Finalizando fase de resaltado');
            setResaltando(false);
          }, levelConfig.tiempoEntrePasos);
        }
      }, tiempoFin);
    });
  }, [circulos, amplitud, getNivelConfig]);

  // Iniciar primer ensayo cuando se generan los círculos
  useEffect(() => {
    // Solo iniciar si tenemos círculos, el juego ha iniciado, no estamos resaltando y no hay secuencia
    if (circulos.length > 0 && juegoIniciado && !resaltando && secuencia.length === 0 && !ensayoIniciadoRef.current) {
      console.log('Starting ensayo with delay...');
      ensayoIniciadoRef.current = true;

      // Delay para asegurar que el DOM está listo
      const timer = setTimeout(() => {
        iniciarEnsayo();
      }, 300);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circulos.length, juegoIniciado, resaltando, secuencia.length]);

  // Temporizador para responder la secuencia
  useEffect(() => {
    // Limpiar temporizador existente
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Iniciar temporizador solo cuando termine la fase de resaltado
    if (!resaltando && secuencia.length > 0 && !juegoTerminado) {
      const levelConfig = getNivelConfig();

      // Calcular tiempo según nivel: BASICO/INTERMEDIO = 4 seg/elemento, AVANZADO = 2 seg/elemento
      const segundosPorElemento = nivelActual <= 2 ? 4 : 2;
      const tiempoTotal = secuencia.length * segundosPorElemento;

      setTiempo(tiempoTotal);
      setFallosEnSecuenciaActual(0); // Resetear fallos de la secuencia actual

      // Iniciar cuenta regresiva
      timerRef.current = setInterval(() => {
        setTiempo((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            // Tiempo agotado = juego terminado
            setJuegoTerminado(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [resaltando, secuencia.length, juegoTerminado, getNivelConfig, nivelActual]);

  // Función para manejar clics en los círculos
  const manejarClick = (index) => {
    if (resaltando || respuesta.length >= secuencia.length || juegoTerminado) return;

    const nuevaRespuesta = [...respuesta, index];
    setRespuesta(nuevaRespuesta);

    // Verificar si este click individual es correcto
    const posicionActual = nuevaRespuesta.length - 1;
    const esClickCorrecto = secuencia[posicionActual] === index;

    // Actualizar contadores inmediatamente para reproducir sonidos
    if (esClickCorrecto) {
      setAciertos(prev => prev + 1);
    } else {
      // Click incorrecto = fallo inmediato
      setFallosTotales(prev => prev + 1);
      setFallosEnSecuenciaActual(prev => prev + 1);

      // Verificar si alcanzó 3 fallos (terminar juego inmediatamente)
      const nuevosFallosEnSecuencia = fallosEnSecuenciaActual + 1;
      if (nuevosFallosEnSecuencia >= 3) {
        // Limpiar temporizador
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setJuegoTerminado(true);
        return; // Salir inmediatamente
      }
    }

    // Verificar si se completó la secuencia
    if (nuevaRespuesta.length === secuencia.length) {
      // Limpiar el temporizador al completar la secuencia
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const correcta = secuencia.every((val, i) => val === nuevaRespuesta[i]);
      const tiempoRespuesta = Date.now() - tiempoInicioEnsayo;

      const levelConfig = getNivelConfig();

      // Registrar ensayo detallado
      const ensayoDetallado = {
        ensayoNumero: ensayos + 1,
        amplitud: amplitud,
        amplitudInicial: amplitudInicial,
        nivel: levelConfig.nombre,
        secuenciaOriginal: [...secuencia],
        respuestaUsuario: [...nuevaRespuesta],
        correcto: correcta,
        tiempoRespuesta: tiempoRespuesta,
        tiempoMostrando: secuencia.length * (levelConfig.tiempoResaltado + levelConfig.tiempoEntrePasos),
        posicionesUsadas: secuencia.map(idx => circulos[idx]),
        erroresEnPosicion: correcta ? [] : secuencia.map((orig, i) => ({
          posicion: i,
          esperado: orig,
          recibido: nuevaRespuesta[i] || null,
          correcto: orig === nuevaRespuesta[i]
        }))
      };
      setEnsayosDetallados(prev => [...prev, ensayoDetallado]);

      if (correcta) {
        // Incrementar contador de ensayos exitosos
        const nuevosEnsayos = ensayos + 1;
        setEnsayos(nuevosEnsayos);

        // Resetear fallos consecutivos
        setFallosConsecutivos(0);

        // Incrementar aciertos seguidos
        const nuevosAciertosSeguidos = aciertosSeguidos + 1;
        setAciertosSeguidos(nuevosAciertosSeguidos);

        // Aumentar amplitud cada 3 aciertos consecutivos
        if (nuevosAciertosSeguidos >= JUEGO7_CONFIG.ACIERTOS_PARA_AUMENTAR) {
          setAmplitud(prev => prev + 1);
          setAciertosSeguidos(0); // Resetear contador
        }

        // Verificar si se alcanzó el span máximo teórico
        if (amplitud >= 9) {
          setJuegoTerminado(true);
        } else {
          setTimeout(() => iniciarEnsayo(), 1000);
        }
      } else {
        // Incrementar fallos consecutivos en la misma amplitud
        const nuevosFallosConsecutivos = fallosConsecutivos + 1;
        setFallosConsecutivos(nuevosFallosConsecutivos);

        // Resetear aciertos seguidos
        setAciertosSeguidos(0);

        // Terminar juego si hay 2 fallos consecutivos en la misma amplitud
        if (nuevosFallosConsecutivos >= JUEGO7_CONFIG.FALLOS_CONSECUTIVOS_PARA_TERMINAR) {
          setJuegoTerminado(true);
        } else {
          setTimeout(() => iniciarEnsayo(), 1000);
        }
      }
    }
  };

  // Función para reiniciar el juego
  const reiniciarJuego = () => {
    const levelConfig = getNivelConfig();

    // Limpiar temporizador
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    ensayoIniciadoRef.current = false; // Resetear flag
    setCirculos(generarCirculos(levelConfig.numCirculos));
    setSecuencia([]);
    setRespuesta([]);
    setAmplitud(levelConfig.secuenciaInicial);
    setAmplitudInicial(levelConfig.secuenciaInicial);
    setFallosConsecutivos(0);
    setAciertosSeguidos(0);
    setEnsayos(0);
    setAciertos(0); // Resetear aciertos totales
    setFallosTotales(0); // Resetear fallos totales
    setFallosEnSecuenciaActual(0); // Resetear fallos en secuencia actual
    setTiempo(0); // Resetear tiempo
    setJuegoTerminado(false);
    setResultadoGuardado(false);
    setEnsayosDetallados([]);
    setTiempoInicio(Date.now());
  };

  // Generar análisis de resultados
  const generarAnalisis = () => {
    const spanAlcanzado = amplitud;
    const porcentajePrecision = ensayosDetallados.length > 0 ?
      Math.round((ensayosDetallados.filter(e => e.correcto).length / ensayosDetallados.length) * 100) : 0;

    if (tiempo <= 0) {
      return `Se acabó el tiempo. Tu span de memoria visuoespacial alcanzado fue ${spanAlcanzado} elementos con ${porcentajePrecision}% de precisión. Intenta responder más rápido para avanzar más.`;
    }

    if (fallosTotales >= 3) {
      return `Has cometido 3 errores en total y el juego ha terminado. Tu span de memoria visuoespacial alcanzado fue ${spanAlcanzado} elementos con ${porcentajePrecision}% de precisión. Intenta concentrarte más en cada círculo antes de hacer clic.`;
    }

    if (fallosConsecutivos >= JUEGO7_CONFIG.FALLOS_CONSECUTIVOS_PARA_TERMINAR) {
      return `Has cometido ${JUEGO7_CONFIG.FALLOS_CONSECUTIVOS_PARA_TERMINAR} errores consecutivos en la misma amplitud y el juego ha terminado. Tu span de memoria visuoespacial alcanzado fue ${spanAlcanzado} elementos con ${porcentajePrecision}% de precisión. Intenta crear estrategias visuales para recordar mejor las secuencias.`;
    }

    if (spanAlcanzado >= 7) {
      return `¡Excelente span de memoria visuoespacial! Alcanzaste ${spanAlcanzado} elementos con ${porcentajePrecision}% de precisión. Tu capacidad para recordar secuencias espaciales está muy desarrollada.`;
    }

    if (spanAlcanzado >= 5) {
      return `Buen rendimiento. Tu span de memoria visuoespacial es ${spanAlcanzado} elementos con ${porcentajePrecision}% de precisión. Esto está dentro del rango normal-alto para adultos.`;
    }

    if (spanAlcanzado >= 4) {
      return `Rendimiento promedio. Tu span de memoria visuoespacial es ${spanAlcanzado} elementos con ${porcentajePrecision}% de precisión. Puedes mejorar practicando técnicas de visualización espacial.`;
    }

    return `Tu span de memoria visuoespacial es ${spanAlcanzado} elementos con ${porcentajePrecision}% de precisión. Sigue practicando para desarrollar mejores estrategias de memorización espacial.`;
  };

  // Obtener información de progreso
  const obtenerProgreso = () => {
    const levelConfig = getNivelConfig();
    return `Nivel: ${levelConfig.nombre} | Span: ${amplitud} | Ensayos: ${ensayos} | Fallos consecutivos: ${fallosConsecutivos}/${JUEGO7_CONFIG.FALLOS_CONSECUTIVOS_PARA_TERMINAR}`;
  };

  // Componente de instrucciones
  const InstruccionesJuego = () => {
    const levelConfig = getNivelConfig();
    return (
      <div style={{ textAlign: 'center', fontSize: '18px', color: '#34495e', maxWidth: '600px', margin: '0 auto' }}>
        <h3>Bloques de Corsi - Memoria Visuoespacial</h3>
        <p><strong>Nivel: {levelConfig.nombre}</strong></p>
        <p>Este juego evalúa tu memoria de trabajo visuoespacial a través de dos fases:</p>

        <div style={{ textAlign: 'left', margin: '20px auto', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p><strong>Fase de Presentación:</strong></p>
          <ul style={{ marginLeft: '20px' }}>
            <li>Se mostrarán {levelConfig.numCirculos} círculos azules distribuidos aleatoriamente</li>
            <li>Algunos círculos se resaltarán en naranja secuencialmente</li>
            <li>Cada círculo se resalta por {levelConfig.tiempoResaltado}ms</li>
            <li>Hay un intervalo de {levelConfig.tiempoEntrePasos}ms entre cada resaltado</li>
          </ul>

          <p><strong>Fase de Respuesta:</strong></p>
          <ul style={{ marginLeft: '20px' }}>
            <li>Debes hacer clic en los círculos en el mismo orden en que fueron resaltados</li>
            <li>El juego registra la precisión y el tiempo de respuesta</li>
            <li style={{ color: '#e74c3c', fontWeight: 'bold' }}>⏱️ Tiempo límite: {nivelActual <= 2 ? '4 segundos' : '2 segundos'} por cada elemento de la secuencia</li>
            <li style={{ color: '#e74c3c', fontWeight: 'bold' }}>❌ Hacer clic en un círculo incorrecto cuenta como fallo</li>
            <li style={{ color: '#e74c3c', fontWeight: 'bold' }}>⚠️ El juego termina después de 3 fallos totales</li>
          </ul>
        </div>

        <p><strong>Progresión:</strong></p>
        <ul style={{ textAlign: 'left', marginLeft: '20px' }}>
          <li>Comienzas con una secuencia de {levelConfig.secuenciaInicial} círculos</li>
          <li>La secuencia aumenta en +1 después de cada {JUEGO7_CONFIG.ACIERTOS_PARA_AUMENTAR} aciertos consecutivos</li>
          <li>También termina después de {JUEGO7_CONFIG.FALLOS_CONSECUTIVOS_PARA_TERMINAR} fallos consecutivos en la misma amplitud</li>
        </ul>
      </div>
    );
  };

  // Iniciar el juego
  const iniciarJuego = () => {
    setJuegoIniciado(true);
  };

  return (
    <GameLayout
      title="Bloques de Corsi"
      showInstructions={!juegoIniciado}
      instructions={<InstruccionesJuego />}
      onStartGame={iniciarJuego}
      description={juegoIniciado ? `Observa y repite la secuencia de los círculos en el orden correcto. Cada ${JUEGO7_CONFIG.ACIERTOS_PARA_AUMENTAR} aciertos consecutivos aumenta la dificultad.` : null}
      stats={{
        nivel: getNivelConfig().nombre,
        puntuacion: aciertos, // Score (total aciertos)
        fallos: fallosTotales, // Total fallos
        tiempo: tiempo, // Tiempo restante para responder
        progreso: obtenerProgreso()
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: amplitud >= 9,
        level: amplitud,
        score: ensayos,
        mistakes: fallosConsecutivos,
        span: amplitud,
        precision: ensayosDetallados.length > 0 ?
          Math.round((ensayosDetallados.filter(e => e.correcto).length / ensayosDetallados.length) * 100) : 0
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
      onFallo={fallosTotales}
      onCorrectAnswer={aciertos}
    >
      {!juegoTerminado ? (
        <div className="juego7-contenido">
          {/* Texto informativo arriba con altura fija */}
          <div className="info">
            <p>{resaltando ? `Observa la secuencia... (${amplitud} elementos)` :
              `Repite la secuencia (${respuesta.length}/${secuencia.length}) - Tiempo: ${tiempo}s - Fallos: ${fallosTotales}/3`}</p>
          </div>

          {/* Área de círculos debajo del texto */}
          <div className="area-circulos">
            {circulos.map((pos, index) => (
              <div
                key={index}
                id={`circulo-${index}`}
                className={`circulo ${!resaltando ? 'seleccionable' : ''}`}
                style={{ top: pos.top, left: pos.left }}
                onClick={() => manejarClick(index)}
              ></div>
            ))}
          </div>
        </div>
      ) : (
        // Mostrar estado de guardado cuando termine el juego
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="resultado">
            <h3>Resultados Finales</h3>
            <p><strong>Span de memoria visuoespacial:</strong> {amplitud} elementos</p>
            <p><strong>Ensayos completados:</strong> {ensayos}</p>
            <p><strong>Precisión:</strong> {ensayosDetallados.length > 0 ?
              Math.round((ensayosDetallados.filter(e => e.correcto).length / ensayosDetallados.length) * 100) : 0}%</p>
            <p><strong>Fallos consecutivos:</strong> {fallosConsecutivos}/{JUEGO7_CONFIG.FALLOS_CONSECUTIVOS_PARA_TERMINAR}</p>
          </div>

          <div style={{ marginTop: '20px' }}>
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

export default Juego7;