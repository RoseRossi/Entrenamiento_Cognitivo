import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '../GameLayout/GameLayout';
import { niveles, obtenerEnsayo, verificarRespuesta } from './juego4_funciones';
import { auth } from "../../../services/firebase/firebaseConfig";
import { gameService } from "../../../services/firebase/gameService";
import { userService } from "../../../services/firebase/userService";
import './juego4_estilos.css';

const Figura = ({ tipo, cantidad, x, y }) => {
  const figuras = [];
  const tamañoFigura = 20;
  const espaciado = 8;
  const totalWidth = cantidad * tamañoFigura + (cantidad - 1) * espaciado;
  const startX = x - totalWidth / 2;
  const startY = y - tamañoFigura / 2;

  for (let i = 0; i < cantidad; i++) {
    const offsetX = startX + i * (tamañoFigura + espaciado);

    if (tipo === 'cuadrado') {
      figuras.push(
        <rect
          key={i}
          x={offsetX}
          y={startY}
          width={tamañoFigura}
          height={tamañoFigura}
          fill="blue"
          stroke="black"
        />
      );
    } else if (tipo === 'circulo') {
      figuras.push(
        <circle
          key={i}
          cx={offsetX + tamañoFigura / 2}
          cy={startY + tamañoFigura / 2}
          r={tamañoFigura / 2}
          fill="red"
          stroke="black"
        />
      );
    } else if (tipo === 'triangulo') {
      figuras.push(
        <polygon
          key={i}
          points={`${offsetX},${startY + tamañoFigura} ${offsetX + tamañoFigura / 2},${startY} ${
            offsetX + tamañoFigura
          },${startY + tamañoFigura}`}
          fill="green"
          stroke="black"
        />
      );
    } else if (tipo === 'diamante') {
      const halfSize = tamañoFigura / 2;
      figuras.push(
        <polygon
          key={i}
          points={`${offsetX + halfSize},${startY} ${offsetX + tamañoFigura},${startY + halfSize} ${
            offsetX + halfSize
          },${startY + tamañoFigura} ${offsetX},${startY + halfSize}`}
          fill="purple"
          stroke="black"
        />
      );
    } else if (tipo === 'cruz') {
      const quarterSize = tamañoFigura / 4;
      figuras.push(
        <polygon
          key={i}
          points={`${offsetX + quarterSize},${startY} ${offsetX + quarterSize * 3},${startY} ${
            offsetX + quarterSize * 3
          },${startY + quarterSize} ${offsetX + tamañoFigura},${startY + quarterSize} ${
            offsetX + tamañoFigura
          },${startY + quarterSize * 3} ${offsetX + quarterSize * 3},${startY + quarterSize * 3} ${
            offsetX + quarterSize * 3
          },${startY + tamañoFigura} ${offsetX + quarterSize},${startY + tamañoFigura} ${
            offsetX + quarterSize
          },${startY + quarterSize * 3} ${offsetX},${startY + quarterSize * 3} ${offsetX},${
            startY + quarterSize
          } ${offsetX + quarterSize},${startY + quarterSize}`}
          fill="orange"
          stroke="black"
        />
      );
    } else if (tipo === 'rectangulo') {
      figuras.push(
        <rect
          key={i}
          x={offsetX}
          y={startY + tamañoFigura / 4}
          width={tamañoFigura}
          height={tamañoFigura / 2}
          fill="teal"
          stroke="black"
        />
      );
    } else if (tipo === 'estrella') {
      const points = [
        `${offsetX + tamañoFigura / 2},${startY}`,
        `${offsetX + tamañoFigura * 0.618},${startY + tamañoFigura * 0.382}`,
        `${offsetX + tamañoFigura},${startY + tamañoFigura * 0.382}`,
        `${offsetX + tamañoFigura * 0.691},${startY + tamañoFigura * 0.618}`,
        `${offsetX + tamañoFigura * 0.809},${startY + tamañoFigura}`,
        `${offsetX + tamañoFigura / 2},${startY + tamañoFigura * 0.809}`,
        `${offsetX + tamañoFigura * 0.191},${startY + tamañoFigura}`,
        `${offsetX + tamañoFigura * 0.309},${startY + tamañoFigura * 0.618}`,
        `${offsetX},${startY + tamañoFigura * 0.382}`,
        `${offsetX + tamañoFigura * 0.382},${startY + tamañoFigura * 0.382}`,
      ];
      figuras.push(
        <polygon
          key={i}
          points={points.join(' ')}
          fill="gold"
          stroke="black"
        />
      );
    } else if (tipo === 'hexagono') {
      const halfSize = tamañoFigura / 2;
      const thirdHeight = Math.sin(Math.PI / 3) * halfSize;
      figuras.push(
        <polygon
          key={i}
          points={`${offsetX + halfSize},${startY} ${offsetX + tamañoFigura},${startY + thirdHeight} ${
            offsetX + tamañoFigura
          },${startY + tamañoFigura - thirdHeight} ${offsetX + halfSize},${startY + tamañoFigura} ${offsetX},${
            startY + tamañoFigura - thirdHeight
          } ${offsetX},${startY + thirdHeight}`}
          fill="coral"
          stroke="black"
        />
      );
    }
  }

  return <>{figuras}</>;
};

const Juego4 = () => {
  const [nivelActual, setNivelActual] = useState(1);
  const [ensayoActual, setEnsayoActual] = useState(null);
  const [estadoJuego, setEstadoJuego] = useState({
    puntuacion: 0,
    tiempoRestante: niveles[0].tiempo,
    respuestasIncorrectas: 0,
    fallosTotales: 0, 
    juegoTerminado: false,
    todosNivelesCompletados: false,
  });
  const [ultimoResultado, setUltimoResultado] = useState(null); 
  const timerRef = useRef(null);

  // Estados para Firebase
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [resultadoGuardado, setResultadoGuardado] = useState(false);
  const [respuestasDetalladas, setRespuestasDetalladas] = useState([]);
  const [tiemposPorNivel, setTiemposPorNivel] = useState([]);

  // Guardar resultado usando useCallback
  const guardarResultado = useCallback(async () => {
    if (!user) {
      console.log('No hay usuario autenticado para guardar resultado');
      return;
    }

    try {
      console.log('Guardando resultado del Juego 4...');
      
      const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000);
      const totalEnsayosPosibles = niveles.reduce((total, nivel) => total + nivel.ensayos.length, 0);
      const ensayosCompletados = respuestasDetalladas.length;
      const respuestasCorrectas = respuestasDetalladas.filter(r => r.correcta).length;
      
      // Calcular porcentajes
      const porcentajeCompletado = Math.round((ensayosCompletados / totalEnsayosPosibles) * 100);
      const porcentajePrecision = ensayosCompletados > 0 ? Math.round((respuestasCorrectas / ensayosCompletados) * 100) : 0;
      
      // Determinar nivel basado en rendimiento
      let nivelJuego = 'basico';
      if (estadoJuego.todosNivelesCompletados || (nivelActual >= 3 && porcentajePrecision >= 80)) {
        nivelJuego = 'avanzado';
      } else if (nivelActual >= 2 && porcentajePrecision >= 60) {
        nivelJuego = 'intermedio';
      }

      // Score final basado en niveles completados y precisión
      const scoreBaseNiveles = (nivelActual / niveles.length) * 60; // 60% por niveles completados
      const scorePrecision = porcentajePrecision * 0.4; // 40% por precisión
      const scoreFinal = Math.round(scoreBaseNiveles + scorePrecision);

      const resultData = {
        userId: user.uid,
        gameId: 'balance_balanza',
        cognitiveDomain: 'funciones_ejecutivas',
        level: nivelJuego,
        score: scoreFinal,
        timeSpent: tiempoTranscurrido,
        correctAnswers: respuestasCorrectas,
        totalQuestions: ensayosCompletados,
        details: {
          nivelesCompletados: nivelActual,
          totalNiveles: niveles.length,
          ensayosCompletados: ensayosCompletados,
          totalEnsayosPosibles: totalEnsayosPosibles,
          porcentajeCompletado: porcentajeCompletado,
          porcentajePrecision: porcentajePrecision,
          fallosTotales: estadoJuego.fallosTotales,
          fallosConsecutivos: estadoJuego.respuestasIncorrectas,
          todosNivelesCompletados: estadoJuego.todosNivelesCompletados,
          razonTermino: estadoJuego.todosNivelesCompletados ? 'completado' :
                       (estadoJuego.respuestasIncorrectas >= 3 ? 'tres_fallos_consecutivos' :
                       (estadoJuego.tiempoRestante <= 0 ? 'tiempo_agotado' : 'usuario_salio')),
          tiemposPorNivel: tiemposPorNivel,
          tiempoPromedioRespuesta: ensayosCompletados > 0 ? 
            Math.round((tiempoTranscurrido / ensayosCompletados) * 100) / 100 : 0,
          respuestasDetalladas: respuestasDetalladas,
          puntajeMaximoPosible: totalEnsayosPosibles
        }
      };

      // Guardar resultado del juego
      await gameService.saveGameResult(resultData);
      
      // Actualizar progreso del usuario en el dominio cognitivo
      await userService.updateUserProgress(user.uid, 'funciones_ejecutivas', scoreFinal);
      
      console.log(' Resultado del Juego 4 guardado exitosamente');
      setResultadoGuardado(true);
      
    } catch (error) {
      console.error(' Error guardando resultado del Juego 4:', error);
    }
  }, [user, tiempoInicio, estadoJuego, nivelActual, respuestasDetalladas, tiemposPorNivel]);

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

  // Timer effect
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (!estadoJuego.juegoTerminado && estadoJuego.tiempoRestante > 0) {
      timerRef.current = setInterval(() => {
        setEstadoJuego(prev => {
          const newTime = prev.tiempoRestante - 1;

          if (newTime <= 0) {
            clearInterval(timerRef.current);
            return {
              ...prev,
              tiempoRestante: 0,
              juegoTerminado: true
            };
          }

          return {
            ...prev,
            tiempoRestante: newTime
          };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [estadoJuego.juegoTerminado, estadoJuego.tiempoRestante, nivelActual]);

  useEffect(() => {
    const ensayo = obtenerEnsayo(nivelActual);
    setEnsayoActual(ensayo);
    setUltimoResultado(null); 

    setEstadoJuego((prev) => ({
      ...prev,
      tiempoRestante: niveles[nivelActual - 1]?.tiempo || 0,
    }));
  }, [nivelActual]);

  const manejarSeleccion = (opcion) => {
    if (estadoJuego.juegoTerminado || !ensayoActual) return;
  
    const esCorrecta = verificarRespuesta(ensayoActual, opcion);
    const tiempoRespuesta = Date.now() - tiempoInicio;
    
    // Registrar respuesta detallada
    const nuevaRespuesta = {
      nivelId: nivelActual,
      ensayoId: ensayoActual.id || `nivel${nivelActual}_${Date.now()}`,
      respuestaUsuario: opcion,
      respuestaCorrecta: ensayoActual.respuestaCorrecta,
      correcta: esCorrecta,
      tiempoRespuesta: tiempoRespuesta,
      tiempoRestante: estadoJuego.tiempoRestante
    };
    setRespuestasDetalladas(prev => [...prev, nuevaRespuesta]);

    const nuevoEstado = { ...estadoJuego };
  
    if (esCorrecta) {
      nuevoEstado.puntuacion += 1;
      nuevoEstado.respuestasIncorrectas = 0; // Reiniciar fallos consecutivos
      nuevoEstado.fallosTotales = nuevoEstado.fallosTotales || 0;
  
      // Actualizar el feedback visual
      setUltimoResultado({ opcion, esCorrecta: true });
  
      // Avanzar al siguiente ensayo o nivel
      setTimeout(() => {
        if (nivelActual === niveles.length && nuevoEstado.puntuacion % 3 === 0) {
          nuevoEstado.juegoTerminado = true;
          nuevoEstado.todosNivelesCompletados = true;
        } else if (nuevoEstado.puntuacion % 3 === 0 && nivelActual < niveles.length) {
          // Registrar tiempo del nivel completado
          setTiemposPorNivel(prev => [...prev, {
            nivel: nivelActual,
            tiempoTranscurrido: Date.now() - tiempoInicio
          }]);
          setNivelActual((prev) => prev + 1);
        } else {
          setEnsayoActual(obtenerEnsayo(nivelActual));
        }
  
        setUltimoResultado(null); // Resetear feedback visual
        setEstadoJuego(nuevoEstado);
      }, 300); // Agregar un pequeño retraso para evitar conflictos
    } else {
      nuevoEstado.respuestasIncorrectas += 1;
      nuevoEstado.fallosTotales += 1;
  
      // Actualizar el feedback visual
      setUltimoResultado({ opcion, esCorrecta: false });
  
      // Finalizar el juego si hay 3 fallos consecutivos
      if (nuevoEstado.respuestasIncorrectas >= 3) {
        nuevoEstado.juegoTerminado = true;
      }
  
      setEstadoJuego(nuevoEstado);
    }
  };

  const renderBalanza = (balanza, showQuestionMark = false) => (
    <svg className="balanza-svg" viewBox="0 0 309 250" width="300" height="260" xmlns="http://www.w3.org/2000/svg">
      <rect width="309" height="250" fill="white" />
      <line x1="58.4567" y1="35.7965" x2="99.4567" y2="127.796" stroke="black" />
      <line x1="58.4491" y1="36.2197" x2="13.4492" y2="128.22" stroke="black" />
      <path
        d="M72 221C72 215.477 76.4772 211 82 211H218C223.523 211 228 215.477 228 221V227H72V221Z"
        fill="#334458"
      />
      <path
        d="M63 231C63 228.791 64.7909 227 67 227H232C234.209 227 236 228.791 236 231V239H63V231Z"
        fill="#232D36"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M56.5 148C82.1812 148 103 139.046 103 128H10C10 139.046 30.8188 148 56.5 148Z"
        fill="#D9D9D9"
      />
      <rect x="6" y="125" width="101" height="6" rx="2" fill="#ADADAD" />
      <line x1="245.457" y1="35.7965" x2="286.457" y2="127.796" stroke="black" />
      <line x1="245.449" y1="36.2197" x2="200.449" y2="128.22" stroke="black" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M243.5 148C269.181 148 290 139.046 290 128H197C197 139.046 217.819 148 243.5 148Z"
        fill="#D9D9D9"
      />
      <rect x="193" y="125" width="101" height="6" rx="2" fill="#ADADAD" />
      <rect x="142" y="12" width="16" height="212" rx="8" fill="#242E37" />
      <ellipse
        cx="152.083"
        cy="35.9277"
        rx="95.0038"
        ry="4"
        transform="rotate(-0.101434 152.083 35.9277)"
        fill="#252E38"
      />
      <circle cx="150" cy="36" r="3" fill="white" />

      {balanza.izquierda.map((item, i) => (
        <Figura
          key={`izq-${i}`}
          tipo={item.figura}
          cantidad={item.cantidad}
          x={50}
          y={110}
        />
      ))}

      {showQuestionMark ? (
        <text x="243.5" y="120" fontSize="30" fill="black" textAnchor="middle">?</text>
      ) : (
        balanza.derecha.map((item, i) => (
          <Figura
            key={`der-${i}`}
            tipo={item.figura}
            cantidad={item.cantidad}
            x={235}
            y={110}
          />
        ))
      )}
    </svg>
  );

  const reiniciarJuego = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setNivelActual(1);
    setEnsayoActual(obtenerEnsayo(1));
    setEstadoJuego({
      puntuacion: 0,
      tiempoRestante: niveles[0].tiempo,
      respuestasIncorrectas: 0,
      fallosTotales: 0,
      juegoTerminado: false,
      todosNivelesCompletados: false,
    });
    setUltimoResultado(null);
    setResultadoGuardado(false);
    setRespuestasDetalladas([]);
    setTiemposPorNivel([]);
    setTiempoInicio(Date.now());
  };

  const generarAnalisis = () => {
    const ensayosCompletados = respuestasDetalladas.length;
    const respuestasCorrectas = respuestasDetalladas.filter(r => r.correcta).length;
    const porcentajePrecision = ensayosCompletados > 0 ? Math.round((respuestasCorrectas / ensayosCompletados) * 100) : 0;

    if (estadoJuego.juegoTerminado || estadoJuego.respuestasIncorrectas >= 3) {
      const porcentajeCompletado = (nivelActual / niveles.length) * 100;
  
      if (estadoJuego.todosNivelesCompletados) {
        return `¡Excelente! Has completado todos los niveles con ${porcentajePrecision}% de precisión y un total de ${estadoJuego.fallosTotales} fallos. Demostraste una gran capacidad de razonamiento lógico y matemático, aplicando habilidades de resolución de problemas y comprensión de proporciones.`;
      } else if (porcentajeCompletado >= 75) {
        return `Buen trabajo. Has completado ${Math.round(porcentajeCompletado)}% de los niveles con ${porcentajePrecision}% de precisión y un total de ${estadoJuego.fallosTotales} fallos. Sigue practicando para mejorar tu razonamiento proporcional.`;
      } else if (estadoJuego.respuestasIncorrectas >= 3) {
        return `Has cometido tres errores consecutivos. Completaste ${Math.round(porcentajeCompletado)}% con ${porcentajePrecision}% de precisión. Intenta analizar más cuidadosamente las relaciones entre las formas.`;
      } else {
        return `Has completado ${Math.round(porcentajeCompletado)}% de los niveles con ${porcentajePrecision}% de precisión y ${estadoJuego.fallosTotales} fallos. Sigue practicando para mejorar tu razonamiento lógico.`;
      }
    } else if (estadoJuego.tiempoRestante <= 0) {
      return `Se te acabó el tiempo. Lograste completar ${nivelActual - 1} niveles con ${porcentajePrecision}% de precisión y ${estadoJuego.fallosTotales} fallos. Intenta ser más rápido en la identificación de las relaciones.`;
    }
    return "";
  };

  return (
    <GameLayout
      title="Balance de Balanzas - WAIS IV"
      description="Determina qué conjunto de figuras equilibrará la tercera balanza basándote en las relaciones mostradas en las dos primeras balanzas"
      stats={{
        nivel: nivelActual,
        puntuacion: estadoJuego.puntuacion,
        fallos: estadoJuego.respuestasIncorrectas,
        tiempo: estadoJuego.tiempoRestante,
      }}
      gameOver={estadoJuego.juegoTerminado}
      finalStats={{
        completed: estadoJuego.todosNivelesCompletados,
        level: nivelActual,
        score: estadoJuego.puntuacion,
        mistakes: estadoJuego.fallosTotales,
        timeRemaining: estadoJuego.tiempoRestante,
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
      onFallo={estadoJuego.respuestasIncorrectas}
      onCorrectAnswer={estadoJuego.puntuacion}
    >
      {!estadoJuego.juegoTerminado && ensayoActual ? (
        <div className="juego4-container">
          <div className="balanzas-container">
            {renderBalanza(ensayoActual.balanza1)}
            {renderBalanza(ensayoActual.balanza2)}
            {renderBalanza({
              izquierda: ensayoActual.problema.izquierda,
              derecha: []
            }, true)}
          </div>
          <div className="opciones-container">
            {ensayoActual.opciones?.map((opcion, i) => (
              <button
                key={i}
                className={`opcion-boton ${
                  ultimoResultado?.opcion.figura === opcion.figura &&
                  ultimoResultado?.opcion.cantidad === opcion.cantidad
                    ? ultimoResultado.esCorrecta
                      ? 'correct'
                      : 'incorrect'
                    : ''
                }`}
                data-figura={opcion.figura}
                data-cantidad={opcion.cantidad}
                onClick={() => manejarSeleccion(opcion)}
                disabled={!ensayoActual}
              >
                <svg width="100%" height="100%" viewBox="0 0 200 80">
                  <Figura
                    tipo={opcion.figura}
                    cantidad={opcion.cantidad}
                    x={100}
                    y={40}
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Mostrar estado de guardado cuando termine el juego
        <div className="juego4-container">
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

export default Juego4;