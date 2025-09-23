import React, { useState, useEffect } from 'react';
import { auth } from '../../services/firebase/firebaseConfig';
import { gameService } from '../../services/firebase/gameService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Reports.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [gameResults, setGameResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGameDetails, setSelectedGameDetails] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('history'); // Estado para el acordeón

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const gameNames = {
    'razonamiento_gramatical': 'Razonamiento Gramatical',
    'matrices_progresivas': 'Matrices Progresivas', 
    'aprendizaje_listas_verbales': 'Aprendizaje de Listas Verbales',
    'balance_balanza': 'Balance de Balanza',
    'reconociendo_objetos': 'Reconociendo Objetos',
    'posner_haciendo_cola': 'Posner Haciendo Cola',
    'forward_memory_span': 'Forward Memory Span',
    'reverse_memory_span': 'Reverse Memory Span'
  };

  const cognitiveDomains = {
    'lenguaje': 'Lenguaje',
    'razonamiento_abstracto': 'Razonamiento Abstracto',
    'memoria': 'Memoria',
    'atencion': 'Atención',
    'funciones_ejecutivas': 'Funciones Ejecutivas',
    'memoria_trabajo': 'Memoria de Trabajo'
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      loadGameResults(currentUser.uid);
    }
  }, []);

  const loadGameResults = async (userId) => {
    try {
      setLoading(true);
      const results = await gameService.getUserGameResults(userId);
      // Ordenar por fecha ascendente (menor a mayor)
      const sortedResults = results.sort((a, b) => 
        new Date(a.createdAt.toDate()) - new Date(b.createdAt.toDate())
      );
      setGameResults(sortedResults);
    } catch (error) {
      console.error('Error loading game results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener fechas mínima y máxima de los resultados
  const getDateLimits = () => {
    if (gameResults.length === 0) return { min: '', max: '' };
    const dates = gameResults.map(result => result.createdAt.toDate());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  };

  const dateLimits = getDateLimits();

  // Inicializar fechas al cargar resultados
  useEffect(() => {
    if (gameResults.length > 0) {
      setCustomStartDate(dateLimits.min);
      setCustomEndDate(dateLimits.max);
    }   
  }, [gameResults.length, dateLimits.min, dateLimits.max]);

  // FILTRO PRINCIPAL: por juego y por fechas
  const filterResults = () => {
    let filtered = [...gameResults];

    // Filtrar por juego si no es 'all'
    if (selectedGame !== 'all') {
      filtered = filtered.filter(result => result.gameId === selectedGame);
    }

    // Filtrar por rango de fechas si ambos están definidos
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999); // Incluir todo el día final
      filtered = filtered.filter(result => {
        const resultDate = result.createdAt.toDate();
        return resultDate >= startDate && resultDate <= endDate;
      });
    }

    // Ordenar por fecha ascendente
    filtered.sort((a, b) => new Date(a.createdAt.toDate()) - new Date(b.createdAt.toDate()));
    return filtered;
  };

  const getChartData = () => {
    const filtered = filterResults();

    // Agrupar por fecha y calcular promedio de puntuación
    const dateScores = {};
    filtered.forEach(result => {
      const date = new Date(result.createdAt.toDate()).toLocaleDateString('es-ES');
      if (!dateScores[date]) {
        dateScores[date] = { total: 0, count: 0, results: [] };
      }
      dateScores[date].total += result.score;
      dateScores[date].count += 1;
      dateScores[date].results.push(result);
    });

    // Ordenar fechas de menor a mayor
    const dates = Object.keys(dateScores)
      .map(dateStr => {
        const [day, month, year] = dateStr.split('/');
        return new Date(`${year}-${month}-${day}`);
      })
      .sort((a, b) => a - b)
      .map(dateObj => dateObj.toLocaleDateString('es-ES'));

    const scores = dates.map(date =>
      Math.round(dateScores[date].total / dateScores[date].count)
    );

    // Agregar información del juego con mayor puntaje por fecha
    const highestScoreGameByDate = dates.map(date => {
      const results = dateScores[date].results;
      const highestResult = results.reduce((max, current) =>
        current.score > max.score ? current : max
      );
      return {
        game: gameNames[highestResult.gameId] || highestResult.gameId,
        score: highestResult.score,
        gameId: highestResult.gameId
      };
    });

    return {
      labels: dates,
      datasets: [
        {
          label: 'Puntuación Promedio',
          data: scores,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: true,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: 'rgb(59, 130, 246)',
          pointHoverBackgroundColor: 'rgb(29, 78, 216)',
          pointHoverBorderColor: 'rgb(29, 78, 216)',
          highestScoreData: highestScoreGameByDate
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Progreso de Puntuaciones a lo Largo del Tiempo',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const dataset = context.dataset;
            const dataIndex = context.dataIndex;
            if (dataset.highestScoreData && dataset.highestScoreData[dataIndex]) {
              const highestGame = dataset.highestScoreData[dataIndex];
              return [
                `Puntaje más alto: ${highestGame.score}`,
                `Juego: ${highestGame.game}`
              ];
            }
            return null;
          },
          label: function(context) {
            return `Puntuación Promedio: ${context.parsed.y}`;
          }
        },
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.8)',
        borderWidth: 1,
        cornerRadius: 6,
        padding: 10
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Puntuación'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Fecha'
        }
      }
    },
    onClick: () => {
      setShowChartModal(true);
    }
  };

  const showGameDetails = (result) => {
    const detailsData = getGameSpecificDetails(result);
    setSelectedGameDetails(detailsData);
    setShowDetailsModal(true);
  };

  const getGameSpecificDetails = (result) => {
    const baseInfo = {
      game: gameNames[result.gameId] || result.gameId,
      domain: cognitiveDomains[result.cognitiveDomain] || result.cognitiveDomain,
      date: formatDate(result),
      level: result.level,
      score: result.score,
      timeSpent: result.timeSpent
    };

    switch(result.gameId) {
      case 'razonamiento_gramatical': // Comprensión de Textos (Razonamiento gramatical)
        return {
          gameId: result.gameId,
          sessionInfo: baseInfo,
          specificMetrics: {
            title: "Análisis de Razonamiento Gramatical",
            metrics: [
              {
                label: "Puntuación Total",
                value: `${result.correctAnswers || 0} - ${(result.totalQuestions - result.correctAnswers) || 0}`,
                description: "(Respuestas correctas - incorrectas)"
              },
              {
                label: "Tiempo Promedio por Enunciado",
                value: result.totalQuestions > 0 ? `${Math.round(result.timeSpent / result.totalQuestions)}s` : 'N/A',
                description: "Velocidad de procesamiento de texto"
              },
              {
                label: "Dificultad Alcanzada",
                value: result.details?.difficultyLevel || result.level,
                description: "Complejidad de estructuras gramaticales"
              },
              {
                label: "Elementos Complejos Procesados",
                value: result.details?.complexElementsHandled || 'Información no disponible',
                description: "Negaciones, distractores, estructuras complejas"
              }
            ],
            evolution: result.details?.grammaticalEvolution || "Mejora en velocidad y precisión en desarrollo"
          }
        };

      case 'matrices_progresivas': // Razonamiento con Matrices
        return {
          gameId: result.gameId,
          sessionInfo: baseInfo,
          specificMetrics: {
            title: "Análisis de Matrices Progresivas",
            metrics: [
              {
                label: "Ensayos Correctos",
                value: result.correctAnswers || 0,
                description: "Total de matrices resueltas correctamente"
              },
              {
                label: "Nivel de Dificultad",
                value: getDifficultyLevel(result.level),
                description: "Complejidad de patrones abstractos"
              },
              {
                label: "Tiempo Promedio por Matriz",
                value: result.totalQuestions > 0 ? `${Math.round(result.timeSpent / result.totalQuestions)}s` : 'N/A',
                description: "Velocidad de razonamiento abstracto"
              },
              {
                label: "Intentos Fallidos",
                value: result.details?.failedAttempts || 'N/A',
                description: "Errores antes de completar"
              }
            ],
            evolution: result.details?.matrixEvolution || "Capacidad de resolver problemas complejos en desarrollo"
          }
        };

      case 'aprendizaje_listas_verbales': // Recordar Secuencias (Aprendizaje de listas verbales)
        return {
          gameId: result.gameId,
          sessionInfo: baseInfo,
          specificMetrics: {
            title: "Análisis de Memoria Episódica",
            metrics: [
              {
                label: "Palabras por Ronda",
                value: result.details?.wordsPerRound || 'N/A',
                description: "Progreso en las tres repeticiones"
              },
              {
                label: "Puntuación Final",
                value: result.details?.finalRecall || result.score,
                description: "Total recordado en última ronda"
              },
              {
                label: "Retención Entre Rondas",
                value: result.details?.retentionRate ? `${result.details.retentionRate}%` : 'N/A',
                description: "Porcentaje de mantenimiento"
              },
              {
                label: "Confusiones con Distractores",
                value: result.details?.distractorConfusions || 'N/A',
                description: "Palabras incorrectamente recordadas"
              }
            ],
            evolution: result.details?.memoryEvolution || "Aumento de palabras recordadas en desarrollo"
          }
        };

      case 'balance_balanza': // Planificación y Estrategia (Balance de balanza)
        return {
          gameId: result.gameId,
          sessionInfo: baseInfo,
          specificMetrics: {
            title: "Análisis de Funciones Ejecutivas",
            metrics: [
              {
                label: "Respuestas Correctas",
                value: result.correctAnswers || 0,
                description: "Balanzas resueltas correctamente"
              },
              {
                label: "Tiempo por Balanza",
                value: result.totalQuestions > 0 ? `${Math.round(result.timeSpent / result.totalQuestions)}s` : 'N/A',
                description: "Velocidad de razonamiento lógico"
              },
              {
                label: "Complejidad Alcanzada",
                value: result.details?.complexityLevel || result.level,
                description: "Relaciones proporcionales avanzadas"
              },
              {
                label: "Errores Típicos",
                value: result.details?.commonErrors || 'Análisis en proceso',
                description: "Patrones de error identificados"
              }
            ],
            evolution: result.details?.executiveEvolution || "Mejora en resolución de problemas complejos"
          }
        };

      case 'reconociendo_objetos': // Control Atencional (Reconocimiento de objetos)
        return {
          gameId: result.gameId,
          sessionInfo: baseInfo,
          specificMetrics: {
            title: "Análisis de Memoria Visual",
            metrics: [
              {
                label: "Aciertos vs Errores",
                value: `${result.correctAnswers || 0} / ${(result.totalQuestions - result.correctAnswers) || 0}`,
                description: "Reconocimiento correcto de objetos"
              },
              {
                label: "Tiempo de Reacción",
                value: result.details?.averageReactionTime || 'N/A',
                description: "Velocidad de procesamiento visual"
              },
              {
                label: "Porcentaje de Éxito",
                value: result.totalQuestions > 0 ? `${Math.round((result.correctAnswers / result.totalQuestions) * 100)}%` : 'N/A',
                description: "Precisión global"
              },
              {
                label: "Análisis de Errores",
                value: result.details?.errorAnalysis || 'Falsos positivos vs negativos en análisis',
                description: "Tipo de errores cometidos"
              }
            ],
            evolution: result.details?.visualEvolution || "Mejora en rapidez y precisión visual"
          }
        };

      case 'posner_haciendo_cola': // Memoria de Trabajo (Posner haciendo cola)
        return {
          gameId: result.gameId,
          sessionInfo: baseInfo,
          specificMetrics: {
            title: "Análisis de Atención Visual",
            metrics: [
              {
                label: "Respuestas Correctas",
                value: result.correctAnswers || 0,
                description: "Total de ensayos atencionales correctos"
              },
              {
                label: "Tiempo de Reacción",
                value: result.details?.averageReactionTime || 'N/A',
                description: "Velocidad de respuesta (ms)"
              },
              {
                label: "Diferencia Válido/No Válido",
                value: result.details?.validityDifference || 'N/A',
                description: "Efecto de la señal de orientación"
              },
              {
                label: "Aciertos Bajo Distracción",
                value: result.details?.distractionAccuracy ? `${result.details.distractionAccuracy}%` : 'N/A',
                description: "Resistencia a interferencias"
              }
            ],
            evolution: result.details?.attentionEvolution || "Reducción del tiempo de reacción con práctica"
          }
        };

      case 'forward_memory_span': // Razonamiento Verbal (Forward memory span)
        return {
          gameId: result.gameId,
          sessionInfo: baseInfo,
          specificMetrics: {
            title: "Análisis de Memoria de Trabajo Visoespacial",
            metrics: [
              {
                label: "Secuencia Máxima",
                value: result.details?.maxSequenceLength || result.level,
                description: "Longitud máxima alcanzada"
              },
              {
                label: "Ensayos Correctos",
                value: result.correctAnswers || 0,
                description: "Total de secuencias reproducidas correctamente"
              },
              {
                label: "Precisión Global",
                value: result.totalQuestions > 0 ? `${Math.round((result.correctAnswers / result.totalQuestions) * 100)}%` : 'N/A',
                description: "Porcentaje de clics en orden correcto"
              },
              {
                label: "Tiempo por Clic",
                value: result.details?.averageClickTime || 'N/A',
                description: "Velocidad de respuesta promedio"
              }
            ],
            evolution: result.details?.spanEvolution || "Comparación del span máximo a lo largo del tiempo"
          }
        };

      case 'reverse_memory_span': // Flexibilidad Cognitiva (Reverse memory span)
        return {
          gameId: result.gameId,
          sessionInfo: baseInfo,
          specificMetrics: {
            title: "Análisis de Memoria de Trabajo Inversa",
            metrics: [
              {
                label: "Nivel Máximo Inverso",
                value: result.details?.maxReverseLevel || result.level,
                description: "Longitud máxima en orden inverso"
              },
              {
                label: "Correctos vs Incorrectos",
                value: `${result.correctAnswers || 0} / ${(result.totalQuestions - result.correctAnswers) || 0}`,
                description: "Rendimiento en secuencias inversas"
              },
              {
                label: "Tiempo por Respuesta",
                value: result.details?.averageResponseTime || 'N/A',
                description: "Velocidad de procesamiento inverso"
              },
              {
                label: "Precisión Inversa",
                value: result.totalQuestions > 0 ? `${Math.round((result.correctAnswers / result.totalQuestions) * 100)}%` : 'N/A',
                description: "Exactitud en orden inverso"
              }
            ],
            evolution: result.details?.reverseEvolution || "Comparación forward vs reverse span"
          }
        };

      default:
        return {
          gameId: result.gameId,
          sessionInfo: baseInfo,
          specificMetrics: {
            title: "Análisis General",
            metrics: [
              {
                label: "Rendimiento",
                value: `${result.score}/100`,
                description: "Puntuación obtenida"
              },
              {
                label: "Precisión",
                value: result.totalQuestions > 0 ? `${Math.round((result.correctAnswers / result.totalQuestions) * 100)}%` : 'N/A',
                description: "Porcentaje de aciertos"
              }
            ],
            evolution: "Análisis específico en desarrollo"
          }
        };
    }
  };

  const getDifficultyLevel = (level) => {
    if (level <= 3) return 'Básico';
    if (level <= 6) return 'Medio';
    return 'Avanzado';
  };

  const formatDate = (result) => {
    return new Date(result.createdAt.toDate()).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e'; // Verde
    if (score >= 60) return '#f59e0b'; // Amarillo
    return '#ef4444'; // Rojo
  };

  const filteredResults = filterResults();

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading">Cargando reportes...</div>
      </div>
    );
  }

  // Función para calcular estadísticas acumuladas por juego
  const getAccumulatedStats = () => {
    const gameStats = {};
    
    gameResults.forEach(result => {
      const gameId = result.gameId;
      
      if (!gameStats[gameId]) {
        gameStats[gameId] = {
          gameName: gameNames[gameId] || gameId,
          totalSessions: 0,
          totalScore: 0,
          totalTime: 0,
          totalCorrect: 0,
          totalQuestions: 0,
          scores: [],
          levels: [],
          details: [],
          firstSession: result.createdAt.toDate(),
          lastSession: result.createdAt.toDate()
        };
      }
      
      const stats = gameStats[gameId];
      stats.totalSessions++;
      stats.totalScore += result.score;
      stats.totalTime += result.timeSpent;
      stats.totalCorrect += result.correctAnswers || 0;
      stats.totalQuestions += result.totalQuestions || 0;
      stats.scores.push(result.score);
      stats.levels.push(result.level);
      stats.details.push(result.details || {});
      
      // Actualizar fechas
      const sessionDate = result.createdAt.toDate();
      if (sessionDate < stats.firstSession) stats.firstSession = sessionDate;
      if (sessionDate > stats.lastSession) stats.lastSession = sessionDate;
    });
    
    return gameStats;
  };

  // Función para obtener estadísticas específicas por juego
  const getGameSpecificStats = (gameId, stats) => {
    const avgScore = stats.totalSessions > 0 ? Math.round(stats.totalScore / stats.totalSessions) : 0;
    const accuracy = stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;
    
    switch(gameId) {
      case 'razonamiento_gramatical':
        return {
          primaryMetric: { label: "Precisión Promedio", value: `${accuracy}%` },
          secondaryMetric: { label: "Tiempo Promedio por Enunciado", value: `${Math.round(stats.totalTime / stats.totalQuestions)}s` },
          progressMetric: { label: "Mejora en Puntuación", value: getScoreImprovement(stats.scores) },
          specialMetric: { label: "Nivel Máximo Alcanzado", value: getMaxLevel(stats.details) }
        };

      case 'matrices_progresivas':
        return {
          primaryMetric: { label: "Nivel Máximo de Dificultad", value: getMaxDifficultyLevel(stats.levels) },
          secondaryMetric: { label: "Porcentaje de Aciertos Global", value: `${accuracy}%` },
          progressMetric: { label: "Mejora en Puntuación", value: getScoreImprovement(stats.scores) },
          specialMetric: { label: "Tiempo Promedio por Matriz", value: `${Math.round(stats.totalTime / stats.totalQuestions)}s` }
        };

      case 'aprendizaje_listas_verbales':
        return {
          primaryMetric: { label: "Promedio de Palabras Recordadas", value: Math.round(stats.totalCorrect / stats.totalSessions) },
          secondaryMetric: { label: "Mejor Sesión", value: `${Math.max(...stats.scores)} palabras` },
          progressMetric: { label: "Mejora en Retención", value: getScoreImprovement(stats.scores) },
          specialMetric: { label: "Precisión Global", value: `${accuracy}%` }
        };

      case 'balance_balanza':
        return {
          primaryMetric: { label: "Problemas Resueltos Correctamente", value: stats.totalCorrect },
          secondaryMetric: { label: "Tiempo Promedio por Balanza", value: `${Math.round(stats.totalTime / stats.totalQuestions)}s` },
          progressMetric: { label: "Mejora en Puntuación", value: getScoreImprovement(stats.scores) },
          specialMetric: { label: "Nivel de Complejidad Máximo", value: getMaxLevel(stats.details) }
        };

      case 'reconociendo_objetos':
        return {
          primaryMetric: { label: "Precisión de Reconocimiento", value: `${accuracy}%` },
          secondaryMetric: { label: "Tiempo de Reacción Promedio", value: getAverageReactionTime(stats.details) },
          progressMetric: { label: "Mejora en Velocidad", value: getReactionTimeImprovement(stats.details) },
          specialMetric: { label: "Mejor Precisión", value: `${Math.max(...stats.scores)}%` }
        };

      case 'posner_haciendo_cola':
        return {
          primaryMetric: { label: "Tiempo de Reacción Promedio", value: getAverageReactionTime(stats.details) },
          secondaryMetric: { label: "Precisión Atencional", value: `${accuracy}%` },
          progressMetric: { label: "Mejora en Tiempo de Reacción", value: getReactionTimeImprovement(stats.details) },
          specialMetric: { label: "Sesiones Completadas", value: stats.totalSessions }
        };

      case 'forward_memory_span':
        return {
          primaryMetric: { label: "Longitud Máxima Alcanzada", value: getMaxSpanLength(stats.details) },
          secondaryMetric: { label: "Promedio de Niveles", value: getAverageLevel(stats.levels) },
          progressMetric: { label: "Evolución de Precisión", value: getScoreImprovement(stats.scores) },
          specialMetric: { label: "Secuencias Correctas Total", value: stats.totalCorrect }
        };

      case 'reverse_memory_span':
        return {
          primaryMetric: { label: "Longitud Máxima Inversa", value: getMaxReverseSpan(stats.details) },
          secondaryMetric: { label: "Promedio de Niveles", value: getAverageLevel(stats.levels) },
          progressMetric: { label: "Evolución de Precisión", value: getScoreImprovement(stats.scores) },
          specialMetric: { label: "Comparación con Forward Span", value: getForwardVsReverse(stats.details) }
        };

      default:
        return {
          primaryMetric: { label: "Puntuación Promedio", value: avgScore },
          secondaryMetric: { label: "Precisión Global", value: `${accuracy}%` },
          progressMetric: { label: "Sesiones Completadas", value: stats.totalSessions },
          specialMetric: { label: "Tiempo Total", value: formatDuration(stats.totalTime) }
        };
    }
  };

  // Funciones auxiliares para cálculos específicos
  const getScoreImprovement = (scores) => {
    if (scores.length < 2) return "Necesita más sesiones";
    const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
    const secondHalf = scores.slice(Math.ceil(scores.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const improvement = secondAvg - firstAvg;
    return improvement > 0 ? `+${improvement.toFixed(1)}%` : `${improvement.toFixed(1)}%`;
  };

  const getMaxLevel = (details) => {
    const levels = details.map(d => d?.nivelMaximoAlcanzado || 0).filter(l => l > 0);
    return levels.length > 0 ? Math.max(...levels) : 'N/A';
  };

  const getMaxDifficultyLevel = (levels) => {
    const levelMap = { 'basico': 1, 'intermedio': 2, 'avanzado': 3 };
    const maxLevel = Math.max(...levels.map(l => levelMap[l] || 0));
    return Object.keys(levelMap).find(key => levelMap[key] === maxLevel) || 'N/A';
  };

  const getAverageReactionTime = (details) => {
    const times = details.map(d => d?.averageReactionTime).filter(t => t && !isNaN(t));
    if (times.length === 0) return 'N/A';
    return `${Math.round(times.reduce((a, b) => a + b, 0) / times.length)}ms`;
  };

  const getReactionTimeImprovement = (details) => {
    const times = details.map(d => d?.averageReactionTime).filter(t => t && !isNaN(t));
    if (times.length < 2) return "Necesita más sesiones";
    const firstHalf = times.slice(0, Math.ceil(times.length / 2));
    const secondHalf = times.slice(Math.ceil(times.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const improvement = firstAvg - secondAvg; // Menor tiempo es mejor
    return improvement > 0 ? `-${improvement.toFixed(0)}ms` : `+${Math.abs(improvement).toFixed(0)}ms`;
  };

  const getMaxSpanLength = (details) => {
    const spans = details.map(d => d?.maxSequenceLength || 0).filter(s => s > 0);
    return spans.length > 0 ? Math.max(...spans) : 'N/A';
  };

  const getMaxReverseSpan = (details) => {
    const spans = details.map(d => d?.maxReverseLevel || 0).filter(s => s > 0);
    return spans.length > 0 ? Math.max(...spans) : 'N/A';
  };

  const getAverageLevel = (levels) => {
    const levelMap = { 'basico': 1, 'intermedio': 2, 'avanzado': 3 };
    const numericLevels = levels.map(l => levelMap[l] || 1);
    const avg = numericLevels.reduce((a, b) => a + b, 0) / numericLevels.length;
    return avg.toFixed(1);
  };

  const getForwardVsReverse = (details) => {
    return "Análisis comparativo en desarrollo";
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reportes de Juegos Cognitivos</h1>
      </div>

      <div className="reports-filters">
        <div className="filter-group">
          <label>Filtrar por juego:</label>
          <select 
            value={selectedGame} 
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="all">Todos los juegos</option>
            {Object.entries(gameNames).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Fecha de inicio:</label>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            min={dateLimits.min}
            max={customEndDate || dateLimits.max}
            className="date-input"
          />
        </div>
        <div className="filter-group">
          <label>Fecha de fin:</label>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            min={customStartDate || dateLimits.min}
            max={dateLimits.max}
            className="date-input"
          />
        </div>
        {/* {customStartDate && customEndDate && (
          <div className="filter-group">
            <button
              className="btn-clear-dates"
              onClick={() => {
                setCustomStartDate(dateLimits.min);
                setCustomEndDate(dateLimits.max);
              }}
            >
              Limpiar fechas
            </button>
          </div>
        )} */}
      </div>

      <div className="results-summary">
        <h2>Resumen</h2>
        <div className="summary-content">
          {/* Gráfica a la izquierda */}
          <div className="chart-container">
            <div className="chart-wrapper" onClick={() => setShowChartModal(true)}>
              <Line data={getChartData()} options={chartOptions} />
              <div className="chart-overlay">
                <span>Haz clic para ampliar</span>
              </div>
            </div>
          </div>

          {/* Cards verticales a la derecha */}
          <div className="summary-cards-vertical">
            <div className="summary-card">
              <h3>Total de Sesiones</h3>
              <span className="summary-number">{filteredResults.length}</span>
            </div>
            <div className="summary-card">
              <h3>Puntuación Promedio</h3>
              <span className="summary-number">
                {filteredResults.length > 0 
                  ? Math.round(filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length)
                  : 0}
              </span>
            </div>
            <div className="summary-card">
              <h3>Tiempo Total</h3>
              <span className="summary-number">
                {formatDuration(filteredResults.reduce((sum, r) => sum + r.timeSpent, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ACORDEÓN/DESPLEGABLES */}
      <div className="reports-accordion">
        {/* Sección 1: Historial Desplegable */}
        <div className="accordion-section">
          <div 
            className={`accordion-header ${activeAccordion === 'history' ? 'active' : ''}`}
            onClick={() => toggleAccordion('history')}
          >
            <div className="accordion-title">
              <h2>Historial de Sesiones ({filteredResults.length})</h2>
            </div>
            <span className={`accordion-arrow ${activeAccordion === 'history' ? 'open' : ''}`}>
              ▼
            </span>
          </div>
          <div className={`accordion-content ${activeAccordion === 'history' ? 'open' : ''}`}>
            {filteredResults.length === 0 ? (
              <div className="no-results">
                No se encontraron resultados para los filtros seleccionados.
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Juego</th>
                      <th>Dominio</th>
                      <th>Nivel</th>
                      <th>Puntuación</th>
                      <th>Tiempo</th>
                      <th>Precisión</th>
                      <th>Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result) => (
                      <tr key={result.id}>
                        <td>{formatDate(result)}</td>
                        <td>{gameNames[result.gameId] || result.gameId}</td>
                        <td>{cognitiveDomains[result.cognitiveDomain] || result.cognitiveDomain}</td>
                        <td>
                          <span className={`level-badge level-${result.level}`}>
                            {result.level}
                          </span>
                        </td>
                        <td>
                          <span 
                            style={{ 
                              color: getScoreColor(result.score), 
                              fontWeight: 'bold' 
                            }}
                          >
                            {result.score}
                          </span>
                        </td>
                        <td>{formatDuration(result.timeSpent)}</td>
                        <td>
                          {result.totalQuestions > 0 
                            ? Math.round((result.correctAnswers / result.totalQuestions) * 100) + '%'
                            : 'N/A'}
                        </td>
                        <td>
                          <button 
                            className="btn-details"
                            onClick={() => showGameDetails(result)}
                          >
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sección 2: Reporte Acumulado Desplegable */}
        <div className="accordion-section">
          <div 
            className={`accordion-header ${activeAccordion === 'accumulated' ? 'active' : ''}`}
            onClick={() => toggleAccordion('accumulated')}
          >
            <div className="accordion-title">
              <h2>Reporte Acumulado por Juego</h2>
            </div>
            <span className={`accordion-arrow ${activeAccordion === 'accumulated' ? 'open' : ''}`}>
              ▼
            </span>
          </div>
          <div className={`accordion-content ${activeAccordion === 'accumulated' ? 'open' : ''}`}>
            <div className="accumulated-games-grid">
              {Object.entries(getAccumulatedStats()).map(([gameId, stats]) => {
                const specificStats = getGameSpecificStats(gameId, stats);
                return (
                  <div key={gameId} className="accumulated-game-card">
                    <div className="accumulated-game-header">
                      <h3>{stats.gameName}</h3>
                      <span className="sessions-count">{stats.totalSessions} sesiones</span>
                    </div>
                    
                    <div className="accumulated-stats">
                      <div className="stat-item primary">
                        <span className="stat-label">{specificStats.primaryMetric.label}</span>
                        <span className="stat-value">{specificStats.primaryMetric.value}</span>
                      </div>
                      
                      <div className="stat-item">
                        <span className="stat-label">{specificStats.secondaryMetric.label}</span>
                        <span className="stat-value">{specificStats.secondaryMetric.value}</span>
                      </div>
                      
                      <div className="stat-item">
                        <span className="stat-label">{specificStats.progressMetric.label}</span>
                        <span className="stat-value progress">{specificStats.progressMetric.value}</span>
                      </div>
                      
                      <div className="stat-item">
                        <span className="stat-label">{specificStats.specialMetric.label}</span>
                        <span className="stat-value">{specificStats.specialMetric.value}</span>
                      </div>
                    </div>
                    
                    <div className="accumulated-game-footer">
                      <span className="date-range">
                        {stats.firstSession.toLocaleDateString('es-ES')} - {stats.lastSession.toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de gráfica ampliada */}
      {showChartModal && (
        <div className="chart-modal-overlay" onClick={() => setShowChartModal(false)}>
          <div className="chart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chart-modal-header">
              <h2>Progreso Detallado</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setShowChartModal(false)}
              >
                ×
              </button>
            </div>
            <div className="chart-modal-content">
              <Line data={getChartData()} options={{
                ...chartOptions,
                onClick: undefined,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'top',
                  },
                }
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetailsModal && selectedGameDetails && (
        <div className="details-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="details-modal-header">
              <h2>{selectedGameDetails.specificMetrics?.title || 'Análisis Detallado de Sesión'}</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="details-modal-content">
              <div className="details-section">
                <h3>Información de la Sesión</h3>
                <div className="details-grid">
                  <div><strong>Juego:</strong> {selectedGameDetails.sessionInfo.game}</div>
                  <div><strong>Dominio:</strong> {selectedGameDetails.sessionInfo.domain}</div>
                  <div><strong>Fecha:</strong> {selectedGameDetails.sessionInfo.date}</div>
                  <div><strong>Nivel:</strong> {selectedGameDetails.sessionInfo.level}</div>
                  <div><strong>Puntuación:</strong> {selectedGameDetails.sessionInfo.score}</div>
                  <div><strong>Tiempo Total:</strong> {formatDuration(selectedGameDetails.sessionInfo.timeSpent)}</div>
                </div>
              </div>

              {selectedGameDetails.specificMetrics && (
                <div className="details-section">
                  <h3>Métricas Específicas del Juego</h3>
                  <div className="game-specific-metrics">
                    {selectedGameDetails.specificMetrics.metrics.map((metric, index) => (
                      <div key={index} className="metric-item">
                        <div className="metric-header">
                          <strong>{metric.label}:</strong> 
                          <span className="metric-value">{metric.value}</span>
                        </div>
                        <div className="metric-description">{metric.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedGameDetails.specificMetrics?.evolution && (
                <div className="details-section">
                  <h3>Evolución y Progreso</h3>
                  <div className="evolution-analysis">
                    <p>{selectedGameDetails.specificMetrics.evolution}</p>
                  </div>
                </div>
              )}

              <div className="details-section">
                <h3>Recomendaciones</h3>
                <div className="recommendations">
                  <ul>
                    <li>Continúa practicando regularmente para mantener el progreso</li>
                    <li>Intenta incrementar gradualmente el nivel de dificultad</li>
                    <li>Enfócate en mejorar las áreas identificadas como oportunidades</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;