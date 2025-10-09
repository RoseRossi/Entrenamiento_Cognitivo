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
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Reports.css';
import { Link } from 'react-router-dom'; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  Filler
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
  const [activeAccordion, setActiveAccordion] = useState('history'); 

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
    console.log('🔄 Cargando resultados para userId:', userId);
    
    if (navigator.onLine === false) {
      console.warn('Sin conexión a internet, usando datos en caché');
    }
    
    const results = await gameService.getUserGameResults(userId);
    
    console.log('📦 === DATOS RAW RECIBIDOS ===');
    console.log('📦 results:', results);
    console.log('📦 results.length:', results?.length);
    
    if (!Array.isArray(results)) {
      console.warn('Los resultados no son un array válido');
      setGameResults([]);
      return;
    }
    
    const sortedResults = results.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateA - dateB;
    });
    
    setGameResults(sortedResults);
    console.log(`Cargados ${sortedResults.length} resultados correctamente`);
    
    //   INICIALIZAR FECHAS 
    if (sortedResults.length > 0) {
      console.log('🔧 Calculando rango de fechas...');
      
      const dates = sortedResults.map(result => {
        if (result.createdAt && typeof result.createdAt.toDate === 'function') {
          return result.createdAt.toDate();
        } else {
          return new Date(result.createdAt || result.timestamp);
        }
      });
      
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      
      // ✅ FORMATEAR FECHAS EN ZONA LOCAL
      const minDateStr = minDate.getFullYear() + '-' + 
        String(minDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(minDate.getDate()).padStart(2, '0');
        
      const maxDateStr = maxDate.getFullYear() + '-' + 
        String(maxDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(maxDate.getDate()).padStart(2, '0');
      
      console.log('🔧 Fechas calculadas (LOCAL):', dates.map(d => d.toLocaleString()));
      console.log('🔧 Estableciendo rango de fechas automático:', minDateStr, 'a', maxDateStr);
      
      setCustomStartDate(minDateStr);
      setCustomEndDate(maxDateStr);
    }

    } catch (error) {
      console.error('Error loading game results:', error);
      
      // Manejo específico de errores
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        console.warn('Modo offline detectado');
        // No mostrar alert si ya hay una barra de NetworkStatus
        if (navigator.onLine !== false) {
          alert('Sin conexión a internet. Algunos datos pueden no estar disponibles.');
        }
      } else if (error.code === 'permission-denied') {
        alert('No tienes permisos para acceder a estos datos. Contacta al administrador.');
      } else {
        alert('Error cargando los resultados. Intenta recargar la página.');
      }
      
      // En caso de error, mantener datos existentes si los hay
      // setGameResults([]); // Solo limpiar si es necesario
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadGameResults(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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

  // FILTRO PRINCIPAL: por juego y por fechas
  const filterResults = () => {
    // console.log(' === DEBUGGING FILTER RESULTS ===');
    // console.log(' gameResults completo:', gameResults);
    // console.log(' gameResults.length:', gameResults.length);
    // console.log(' selectedGame:', selectedGame);
    // console.log(' Fechas - inicio:', customStartDate, 'fin:', customEndDate);
    
    let filtered = [...gameResults];

    // Filtrar por juego
    if (selectedGame && selectedGame !== 'all') {
      //console.log(' Filtrando por juego:', selectedGame);
      filtered = filtered.filter(result => {
        //console.log('  - Comparando:', result.gameId, 'con', selectedGame);
        return result.gameId === selectedGame;
      });
      //console.log(' Después de filtrar por juego:', filtered.length);
    }

    // Filtrar por fechas - ARREGLADO
    if (customStartDate && customEndDate) {
      console.log('📅 Filtrando por fechas...');
      
      // ✅ CREAR FECHAS EN ZONA LOCAL (sin conversión UTC)
      const [startYear, startMonth, startDay] = customStartDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = customEndDate.split('-').map(Number);
      
      const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
      const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
      
      console.log('📅 Fechas input:', customStartDate, 'a', customEndDate);
      console.log('📅 Rango de fechas configurado (LOCAL):', startDate, 'a', endDate);
      
      filtered = filtered.filter(result => {
        // ✅ ARREGLO: Manejar correctamente los timestamps de Firebase
        let resultDate;
        
        if (result.createdAt && typeof result.createdAt.toDate === 'function') {
          // Es un timestamp de Firebase
          resultDate = result.createdAt.toDate();
        } else if (result.createdAt) {
          // Es una fecha normal
          resultDate = new Date(result.createdAt);
        } else if (result.timestamp) {
          resultDate = new Date(result.timestamp);
        } else {
          console.warn('⚠️ Resultado sin fecha válida:', result);
          return false;
        }
        
        const isInRange = resultDate >= startDate && resultDate <= endDate;
        console.log('  - Fecha resultado:', resultDate.toLocaleString(), 'en rango?', isInRange);
        
        return isInRange;
      });
      console.log('📅 Después de filtrar por fechas:', filtered.length);
    } else {
      console.log(' Sin filtro de fechas aplicado');
    }
    
    //console.log(' Resultado final filtrado:', filtered);
    //console.log('=== FIN DEBUGGING ===');

    // Ordenar por fecha ascendente
    filtered.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateA - dateB;
    });
    
    return filtered;
  };

const getChartData = () => {
  const filtered = filterResults();
  
  // Si no hay datos, retornar estructura vacía
  if (filtered.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Puntuación Promedio',
        data: [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true,
      }],
    };
  }

  // Agrupar por fecha y calcular promedio de puntuación
  const dateScores = {};
    filtered.forEach(result => {
      // Validar que el resultado tenga los campos necesarios
      if (!result.createdAt || !result.score) {
        console.warn('Resultado inválido encontrado:', result);
        return;
      }
      
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

  if (loading) {
    return (
      <div className="reports-container">
        <div className="reports-header">
          <h1>Reportes de Juegos Cognitivos</h1>
        </div>
        <div className="loading-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '300px',
          fontSize: '18px',
          color: '#666'
        }}>
          <div>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              ⏳ Cargando reportes...
            </div>
            <div style={{ fontSize: '14px', textAlign: 'center', color: '#999' }}>
              {navigator.onLine ? 'Obteniendo datos del servidor...' : 'Buscando datos en caché local...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Agregar también un estado para cuando no hay datos:
  if (!loading && gameResults.length === 0) {
    return (
      <div className="reports-container">
        <div className="reports-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h1>Reportes de Juegos Cognitivos</h1>
            <Link 
              to="/dashboard" 
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #3498db',
                color: '#3498db',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#3498db';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#3498db';
              }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
        <div className="no-data-container" style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
          <h2 style={{ marginBottom: '10px' }}>No hay datos disponibles</h2>
          <p>Completa algunos juegos para ver tus reportes de rendimiento.</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const getLevelClass = (level) => {
  // Mapeo de nombres de nivel a clases CSS
  const levelMapping = {
      'Tutorial': 'level-tutorial',
      'Básico': 'level-basico', 
      'Intermedio': 'level-intermedio',
      'Avanzado': 'level-avanzado',
      'Experto': 'level-experto',
      // Mantener compatibilidad con números antiguos
      '0': 'level-tutorial',
      '1': 'level-basico',
      '2': 'level-intermedio', 
      '3': 'level-avanzado',
      '4': 'level-experto',
      // Para otros juegos que puedan usar otros formatos
      'basico': 'level-basico',
      'intermedio': 'level-intermedio',
      'avanzado': 'level-avanzado'
    };
    
    return levelMapping[level] || 'level-default';
  };

  return (
    <div className="reports-container">
      {/* Estado de carga */}
      {loading ? (
        <>
          <div className="reports-header">
            <h1>Reportes de Juegos Cognitivos</h1>
          </div>
          <div className="loading-container" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px',
            fontSize: '18px',
            color: '#666'
          }}>
            <div>
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                ⏳ Cargando reportes...
              </div>
              <div style={{ fontSize: '14px', textAlign: 'center', color: '#999' }}>
                {navigator.onLine ? 'Obteniendo datos del servidor...' : 'Buscando datos en caché local...'}
              </div>
            </div>
          </div>
        </>
      ) : gameResults.length === 0 ? (
        /* Estado sin datos */
        <>
        <div className="reports-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h1>Reportes de Juegos Cognitivos</h1>
            <Link 
              to="/dashboard" 
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #3498db',
                color: '#3498db',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#3498db';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#3498db';
              }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
          <div className="no-data-container" style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
            <h2 style={{ marginBottom: '10px' }}>No hay datos disponibles</h2>
            <p>Completa algunos juegos para ver tus reportes de rendimiento.</p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2980b9';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3498db';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Ir al Dashboard
            </button>
          </div>
        </>
      ) : (
        /* Contenido principal con datos */
        <>
          <div className="reports-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <h1>Reportes de Juegos Cognitivos</h1>
              <Link 
                to="/dashboard" 
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid #3498db',
                  color: '#3498db',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#3498db';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#3498db';
                }}
              >
                Volver al inicio
              </Link>
            </div>
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
                              <span className={`level-badge ${getLevelClass(result.level)}`}>
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
        </>
      )}
    </div>
  );
};

export default Reports;