import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '../GameLayout/GameLayout';
import { niveles, obtenerEnsayo, verificarRespuesta, hayMasEnsayosEnNivel } from './juego4_funciones';
import { auth } from "../../../services/firebase/firebaseConfig";
import { gameService } from "../../../services/firebase/gameService";
import { userService } from "../../../services/firebase/userService";
import './juego4_estilos.css';

const Figura = ({ tipo, x, y, size = 16 }) => {
  const figuraProps = {
    fill: getFiguraColor(tipo),
    stroke: "black",
    strokeWidth: 0.5
  };

  const figuraElements = {
    cuadrado: (
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        {...figuraProps}
      />
    ),
    circulo: (
      <circle
        cx={x + size/2}
        cy={y + size/2}
        r={size/2}
        {...figuraProps}
      />
    ),
    triangulo: (
      <polygon
        points={`${x},${y + size} ${x + size/2},${y} ${x + size},${y + size}`}
        {...figuraProps}
      />
    ),
    diamante: (
      <polygon
        points={`${x + size/2},${y} ${x + size},${y + size/2} ${x + size/2},${y + size} ${x},${y + size/2}`}
        {...figuraProps}
      />
    ),
    cruz: (() => {
      const quarterSize = size / 4;
      return (
        <polygon
          points={`${x + quarterSize},${y} ${x + quarterSize * 3},${y} ${x + quarterSize * 3},${y + quarterSize} ${x + size},${y + quarterSize} ${x + size},${y + quarterSize * 3} ${x + quarterSize * 3},${y + quarterSize * 3} ${x + quarterSize * 3},${y + size} ${x + quarterSize},${y + size} ${x + quarterSize},${y + quarterSize * 3} ${x},${y + quarterSize * 3} ${x},${y + quarterSize} ${x + quarterSize},${y + quarterSize}`}
          {...figuraProps}
        />
      );
    })(),
    rectangulo: (
      <rect
        x={x}
        y={y + size / 4}
        width={size}
        height={size / 2}
        {...figuraProps}
      />
    ),
    estrella: (() => {
      const points = [
        `${x + size / 2},${y}`,
        `${x + size * 0.618},${y + size * 0.382}`,
        `${x + size},${y + size * 0.382}`,
        `${x + size * 0.691},${y + size * 0.618}`,
        `${x + size * 0.809},${y + size}`,
        `${x + size / 2},${y + size * 0.809}`,
        `${x + size * 0.191},${y + size}`,
        `${x + size * 0.309},${y + size * 0.618}`,
        `${x},${y + size * 0.382}`,
        `${x + size * 0.382},${y + size * 0.382}`,
      ];
      return (
        <polygon
          points={points.join(' ')}
          {...figuraProps}
        />
      );
    })(),
    hexagono: (() => {
      const halfSize = size / 2;
      const thirdHeight = Math.sin(Math.PI / 3) * halfSize;
      return (
        <polygon
          points={`${x + halfSize},${y} ${x + size},${y + thirdHeight} ${x + size},${y + size - thirdHeight} ${x + halfSize},${y + size} ${x},${y + size - thirdHeight} ${x},${y + thirdHeight}`}
          {...figuraProps}
        />
      );
    })()
  };

  return figuraElements[tipo] || null;
};

// Función helper para colores consistentes
const getFiguraColor = (tipo) => {
  const colores = {
    cuadrado: '#3b82f6',
    circulo: '#ef4444', 
    triangulo: '#22c55e',
    diamante: '#a855f7',
    cruz: '#f97316',
    rectangulo: '#14b8a6',
    estrella: '#eab308',
    hexagono: '#f97171'
  };
  return colores[tipo] || '#6b7280';
};

const BalancePan = ({ items, x, y, width = 80, height = 30, showQuestionMark = false }) => {
  if (showQuestionMark) {
    return (
      <text 
        x={x} 
        y={y + 5} 
        fontSize="24" 
        fill="black" 
        textAnchor="middle"
        dominantBaseline="middle"
      >
        ?
      </text>
    );
  }

  if (!items || items.length === 0) return null;

  // Calcular distribución inteligente de figuras
  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const figuraSize = Math.min(16, Math.max(8, width / Math.max(totalItems + 1, 4)));
  const spacing = Math.max(2, Math.min(4, figuraSize * 0.25));
  const maxPerRow = Math.floor(width / (figuraSize + spacing));
  
  // Calcular el layout completo primero
  const layout = [];
  let currentRow = 0;
  let currentCol = 0;
  
  items.forEach((item, itemIdx) => {
    for (let i = 0; i < item.cantidad; i++) {
      if (currentCol >= maxPerRow) {
        currentRow++;
        currentCol = 0;
      }
      
      layout.push({
        tipo: item.figura,
        row: currentRow,
        col: currentCol,
        itemIdx,
        figureIdx: i
      });
      
      currentCol++;
    }
  });

  // Calcular dimensiones reales del contenido
  const totalRows = Math.max(...layout.map(l => l.row)) + 1;
  
  // Calcular el ancho real de cada fila
  const getRowWidth = (rowIndex) => {
    const itemsInRow = layout.filter(l => l.row === rowIndex).length;
    return itemsInRow * figuraSize + (itemsInRow - 1) * spacing;
  };
  
  // Generar figuras centradas
  const figuras = layout.map((item, index) => {
    const rowWidth = getRowWidth(item.row);
    const rowStartX = x - rowWidth / 2; // Centrar cada fila individualmente
    
    const figX = rowStartX + item.col * (figuraSize + spacing);
    const figY = y - (totalRows * (figuraSize + spacing)) / 2 + item.row * (figuraSize + spacing);
    
    return (
      <Figura
        key={`${item.itemIdx}-${item.figureIdx}-${index}`}
        tipo={item.tipo}
        x={figX}
        y={figY}
        size={figuraSize}
      />
    );
  });

  return <g>{figuras}</g>; 
};

const Juego4 = () => {
  const [nivelActual, setNivelActual] = useState(1);
  const [ensayoActual, setEnsayoActual] = useState(null);
  const [estadoJuego, setEstadoJuego] = useState({
    puntuacion: 0,
    tiempoRestante: 600, // 10 minutos TOTAL
    respuestasIncorrectas: 0, // Fallos consecutivos  
    fallosTotales: 0, // TODOS los fallos acumulados
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

  const [juegoIniciado, setJuegoIniciado] = useState(false);

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
    // Solo obtener ensayo si el juego ya está iniciado y no está terminado
    if (juegoIniciado && !estadoJuego.juegoTerminado) {
      const ensayo = obtenerEnsayo(nivelActual);
      setEnsayoActual(ensayo);
      setUltimoResultado(null);
    }
  }, [nivelActual, juegoIniciado, estadoJuego.juegoTerminado]);

  const manejarSeleccion = (opcion) => {
    if (estadoJuego.juegoTerminado || !ensayoActual || ultimoResultado) return;

    const esCorrecta = verificarRespuesta(ensayoActual, opcion);
    const tiempoRespuesta = Date.now() - tiempoInicio;
    
    // Registrar respuesta detallada
    const nuevaRespuesta = {
      nivelId: nivelActual,
      ensayoId: ensayoActual.id || `nivel${nivelActual}_${Date.now()}`,
      respuestaUsuario: opcion,
      respuestaCorrecta: ensayoActual.opciones[ensayoActual.respuestaCorrecta],
      correcta: esCorrecta,
      tiempoRespuesta: tiempoRespuesta,
      tiempoRestante: estadoJuego.tiempoRestante
    };
    setRespuestasDetalladas(prev => [...prev, nuevaRespuesta]);

    const nuevoEstado = { ...estadoJuego };

    if (esCorrecta) {
      nuevoEstado.puntuacion += 1;
      nuevoEstado.respuestasIncorrectas = 0;

      setUltimoResultado({ opcion, esCorrecta: true });

      setTimeout(() => {
        if (hayMasEnsayosEnNivel(nivelActual)) {
          const siguienteEnsayo = obtenerEnsayo(nivelActual);
          if (siguienteEnsayo) {
            setEnsayoActual(siguienteEnsayo);
            console.log(`➡️ Siguiente ensayo en nivel ${nivelActual}`);
          }
        } else {
          if (nivelActual >= niveles.length) {
            nuevoEstado.juegoTerminado = true;
            nuevoEstado.todosNivelesCompletados = true;
            console.log('🏆 ¡Todos los niveles completados!');
          } else {
            console.log(`📈 Avanzando del nivel ${nivelActual} al ${nivelActual + 1}`);
            setTiemposPorNivel(prev => [...prev, {
              nivel: nivelActual,
              tiempoTranscurrido: Date.now() - tiempoInicio
            }]);
            setNivelActual((prev) => prev + 1);
          }
        }

        setUltimoResultado(null);
        setEstadoJuego(nuevoEstado);
      }, 1000);

    } else {
      nuevoEstado.respuestasIncorrectas += 1;
      nuevoEstado.fallosTotales += 1;

      setUltimoResultado({ opcion, esCorrecta: false });

      if (nuevoEstado.respuestasIncorrectas >= 3) {
        nuevoEstado.juegoTerminado = true;
        console.log('❌ Juego terminado por 3 fallos consecutivos');
        
        setTimeout(() => {
          setEstadoJuego(nuevoEstado);
          setUltimoResultado(null);
        }, 1500);
      } else {
        console.log(`❌ Fallo ${nuevoEstado.respuestasIncorrectas}/3 en ejercicio ${ensayoActual.id}. Intenta de nuevo.`);
        
        setTimeout(() => {
          setUltimoResultado(null);
          setEstadoJuego(nuevoEstado);
        }, 1500);
      }

      setEstadoJuego(nuevoEstado);
    }
  };

  const renderBalanza = (balanza, showQuestionMark = false) => {
    // Coordenadas de los platillos (relativas al viewBox)
    const platilloIzq = { x: 56.5, y: 115, width: 80, height: 25 };
    const platilloDer = { x: 243.5, y: 115, width: 80, height: 25 };

    return (
      <svg 
        className="balanza-svg" 
        viewBox="0 0 309 250" 
        style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Estructura de la balanza */}
        <rect width="309" height="250" fill="white" />
        <line x1="58.4567" y1="35.7965" x2="99.4567" y2="127.796" stroke="black" />
        <line x1="58.4491" y1="36.2197" x2="13.4492" y2="128.22" stroke="black" />
        <path d="M72 221C72 215.477 76.4772 211 82 211H218C223.523 211 228 215.477 228 221V227H72V221Z" fill="#334458" />
        <path d="M63 231C63 228.791 64.7909 227 67 227H232C234.209 227 236 228.791 236 231V239H63V231Z" fill="#232D36" />
        <path fillRule="evenodd" clipRule="evenodd" d="M56.5 148C82.1812 148 103 139.046 103 128H10C10 139.046 30.8188 148 56.5 148Z" fill="#D9D9D9" />
        <rect x="6" y="125" width="101" height="6" rx="2" fill="#ADADAD" />
        <line x1="245.457" y1="35.7965" x2="286.457" y2="127.796" stroke="black" />
        <line x1="245.449" y1="36.2197" x2="200.449" y2="128.22" stroke="black" />
        <path fillRule="evenodd" clipRule="evenodd" d="M243.5 148C269.181 148 290 139.046 290 128H197C197 139.046 217.819 148 243.5 148Z" fill="#D9D9D9" />
        <rect x="193" y="125" width="101" height="6" rx="2" fill="#ADADAD" />
        <rect x="142" y="12" width="16" height="212" rx="8" fill="#242E37" />
        <ellipse cx="152.083" cy="35.9277" rx="95.0038" ry="4" transform="rotate(-0.101434 152.083 35.9277)" fill="#252E38" />
        <circle cx="150" cy="36" r="3" fill="white" />

        {/* Platillo izquierdo con posicionamiento inteligente */}
        <BalancePan
          items={balanza.izquierda}
          x={platilloIzq.x}
          y={platilloIzq.y}
          width={platilloIzq.width}
          height={platilloIzq.height}
        />

        {/* Platillo derecho */}
        <BalancePan
          items={balanza.derecha}
          x={platilloDer.x}
          y={platilloDer.y}
          width={platilloDer.width}
          height={platilloDer.height}
          showQuestionMark={showQuestionMark}
        />
      </svg>
    );
  };

  const reiniciarJuego = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setEstadoJuego({
      puntuacion: 0,
      tiempoRestante: 600,
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
    
    setJuegoIniciado(false); // Volver a mostrar instrucciones
    
    setNivelActual(1);
    const primerEnsayo = obtenerEnsayo(1, true); // true = reiniciar índices
    setEnsayoActual(primerEnsayo);
    
    console.log('🔄 Juego reiniciado completamente');
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

  const InstruccionesJuego4 = () => (
    <div style={{ textAlign: 'left', fontSize: '16px', lineHeight: '1.6', color: '#34495e' }}>
      <h3 style={{ color: '#3498db', marginBottom: '15px' }}> ¿Cómo funciona?</h3>
      <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
        <li style={{ marginBottom: '8px' }}>Se te muestran <strong>tres balanzas</strong> con conjuntos de formas geométricas</li>
        <li style={{ marginBottom: '8px' }}>Las dos primeras balanzas están <strong>equilibradas</strong> y te muestran las relaciones</li>
        <li style={{ marginBottom: '8px' }}>La tercera balanza tiene un <strong>signo de interrogación (?)</strong> en el lado derecho</li>
        <li style={{ marginBottom: '8px' }}>Tu tarea es <strong>determinar qué conjunto de formas</strong> equilibrará esa balanza</li>
      </ul>

      <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}> Reglas del juego:</h3>
      <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
        <li style={{ marginBottom: '8px' }}>Analiza las <strong>relaciones y proporciones</strong> entre las formas</li>
        <li style={{ marginBottom: '8px' }}>Si cometes <strong>3 errores consecutivos</strong>, el juego termina</li>
        <li style={{ marginBottom: '8px' }}>Tienes <strong>tiempo limitado</strong> para completar todos los niveles</li>
        <li style={{ marginBottom: '8px' }}>La dificultad aumenta con <strong>más formas y relaciones complejas</strong></li>
      </ul>
    </div>
  );

  const iniciarJuego = () => {
    setJuegoIniciado(true);
    
    const primerEnsayo = obtenerEnsayo(1, true); // Reiniciar índices al iniciar
    setEnsayoActual(primerEnsayo);
    
    console.log('Juego iniciado');
  };

  return (
    <GameLayout
      title="Balance de Balanzas - WAIS IV"
      showInstructions={!juegoIniciado}
      instructions={<InstruccionesJuego4 />}
      onStartGame={iniciarJuego}
      description={juegoIniciado ? (
        <div>
          <p>Determina qué conjunto de figuras equilibrará la tercera balanza.</p>
          <p>Analiza las relaciones mostradas en las dos primeras balanzas.</p>
          <p style={{ color: '#3498db', fontWeight: 'bold' }}>
             Nivel {nivelActual}/4
          </p>
          <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>
             Cuidado: 3 errores consecutivos terminan el juego
          </p>
        </div>
      ) : null}
      stats={{
        nivel: nivelActual,
        puntuacion: estadoJuego.puntuacion,
        fallos: estadoJuego.fallosTotales,
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
                  ? ultimoResultado.esCorrecta ? 'correct' : 'incorrect'
                  : ''
              }`}
              onClick={() => manejarSeleccion(opcion)}
              disabled={!ensayoActual || !!ultimoResultado || estadoJuego.juegoTerminado}
              style={{ 
                opacity: (!ensayoActual || !!ultimoResultado || estadoJuego.juegoTerminado) ? 1 : 1,
                cursor: (!ensayoActual || !!ultimoResultado || estadoJuego.juegoTerminado) ? 'not-allowed' : 'pointer'
              }}
            >
              <svg width="100%" height="60" viewBox="0 0 120 60">
                <BalancePan
                  items={[opcion]}
                  x={60}
                  y={30}
                  width={100}
                  height={40}
                />
              </svg>
            </button>
          ))}
        </div>
      </div>
    ) : (
      <div className="juego4-container">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          {resultadoGuardado ? (
            <p style={{ color: '#22c55e', fontWeight: 'bold' }}>
               Resultado guardado correctamente
            </p>
          ) : (
            <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>
               Guardando resultado
              <span className="loading-spinner"></span>
            </p>
          )}
        </div>
      </div>
    )}
    </GameLayout>
  );
};

export default Juego4;