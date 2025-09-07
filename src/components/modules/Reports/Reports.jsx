import React, { useState, useEffect } from 'react';
import { auth } from '../../../services/firebase/firebaseConfig';
import { gameService } from '../../../services/firebase/gameService';
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
  const [dateRange, setDateRange] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGameDetails, setSelectedGameDetails] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);

  const gameNames = {
    'juego1': 'Comprensión de Textos',
    'juego2': 'Razonamiento con Matrices',
    'juego3': 'Recordar Secuencias',
    'juego4': 'Planificación y Estrategia',
    'juego5': 'Control Atencional',
    'juego6': 'Memoria de Trabajo',
    'juego7': 'Razonamiento Verbal',
    'juego8': 'Flexibilidad Cognitiva'
  };

  const cognitiveRomains = {
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
      
      // Ordenar por fecha más reciente
      const sortedResults = results.sort((a, b) => 
        new Date(b.createdAt.toDate()) - new Date(a.createdAt.toDate())
      );
      
      setGameResults(sortedResults);
    } catch (error) {
      console.error('Error loading game results:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = [...gameResults];

    // Filtrar por juego
    if (selectedGame !== 'all') {
      filtered = filtered.filter(result => result.gameId === selectedGame);
    }

    // Filtrar por rango de fechas
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(result => 
        result.createdAt.toDate() >= startDate
      );
    }

    return filtered;
  };

  const getChartData = () => {
    const filtered = filterResults();
    
    // Agrupar por fecha y calcular promedio de puntuación
    const dateScores = {};
    
    filtered.forEach(result => {
      const date = new Date(result.createdAt.toDate()).toLocaleDateString('es-ES');
      if (!dateScores[date]) {
        dateScores[date] = { total: 0, count: 0 };
      }
      dateScores[date].total += result.score;
      dateScores[date].count += 1;
    });

    // Convertir a arrays para Chart.js
    const dates = Object.keys(dateScores).sort((a, b) => new Date(a) - new Date(b));
    const scores = dates.map(date => 
      Math.round(dateScores[date].total / dateScores[date].count)
    );

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
    const detailsData = {
      sessionInfo: {
        game: gameNames[result.gameId] || result.gameId,
        domain: cognitiveRomains[result.cognitiveDomain] || result.cognitiveDomain,
        date: formatDate(result),
        level: result.level,
        score: result.score,
        timeSpent: result.timeSpent
      },
      performanceMetrics: {
        reactionTime: result.details?.averageReactionTime || 'N/A',
        consistency: result.details?.consistencyScore || 'N/A',
        improvementTrend: result.details?.improvementFromLastSession || 'Sin datos previos',
        difficultyProgression: result.details?.difficultyProgression || 'N/A'
      },
      cognitiveAnalysis: {
        strengthAreas: result.details?.strongCognitiveAreas || ['Análisis en proceso'],
        improvementAreas: result.details?.areasForImprovement || ['Análisis en proceso'],
        cognitiveLoad: result.details?.cognitiveLoadLevel || 'Medio',
        adaptationSuggestions: result.details?.adaptationRecommendations || ['Continuar práctica regular']
      },
      sessionBreakdown: {
        totalQuestions: result.totalQuestions || 0,
        correctAnswers: result.correctAnswers || 0,
        accuracy: result.totalQuestions > 0 ? Math.round((result.correctAnswers / result.totalQuestions) * 100) : 0,
        timePerQuestion: result.totalQuestions > 0 ? Math.round(result.timeSpent / result.totalQuestions) : 0,
        errorPatterns: result.details?.errorAnalysis || 'Sin patrones identificados'
      },
      comparativeData: {
        personalBest: result.details?.comparisonWithPersonalBest || 'Primera sesión',
        sessionComparison: result.details?.comparisonWithPreviousSessions || 'Sin datos previos',
        recommendedNextLevel: result.details?.nextRecommendedDifficulty || result.level
      }
    };
    
    setSelectedGameDetails(detailsData);
    setShowDetailsModal(true);
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
          <label>Rango de fechas:</label>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>
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

      <div className="results-table">
        <h2>Historial de Sesiones ({filteredResults.length})</h2>
        
        {filteredResults.length === 0 ? (
          <div className="no-results">
            No se encontraron resultados para los filtros seleccionados.
          </div>
        ) : (
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
                  <td>{cognitiveRomains[result.cognitiveDomain] || result.cognitiveDomain}</td>
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
                      Ver Análisis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
              <h2>Análisis Detallado de Sesión</h2>
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
                  <div><strong>Tiempo:</strong> {formatDuration(selectedGameDetails.sessionInfo.timeSpent)}</div>
                </div>
              </div>

              <div className="details-section">
                <h3>Métricas de Rendimiento</h3>
                <div className="details-grid">
                  <div><strong>Tiempo de Reacción:</strong> {selectedGameDetails.performanceMetrics.reactionTime}</div>
                  <div><strong>Consistencia:</strong> {selectedGameDetails.performanceMetrics.consistency}</div>
                  <div><strong>Tendencia de Mejora:</strong> {selectedGameDetails.performanceMetrics.improvementTrend}</div>
                </div>
              </div>

              <div className="details-section">
                <h3>Análisis de la Sesión</h3>
                <div className="details-grid">
                  <div><strong>Total de Preguntas:</strong> {selectedGameDetails.sessionBreakdown.totalQuestions}</div>
                  <div><strong>Respuestas Correctas:</strong> {selectedGameDetails.sessionBreakdown.correctAnswers}</div>
                  <div><strong>Precisión:</strong> {selectedGameDetails.sessionBreakdown.accuracy}%</div>
                  <div><strong>Tiempo por Pregunta:</strong> {selectedGameDetails.sessionBreakdown.timePerQuestion}s</div>
                </div>
              </div>

              <div className="details-section">
                <h3>Análisis Cognitivo</h3>
                <div className="cognitive-analysis">
                  <div>
                    <strong>Áreas Fuertes:</strong>
                    <ul>
                      {selectedGameDetails.cognitiveAnalysis.strengthAreas.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Áreas de Mejora:</strong>
                    <ul>
                      {selectedGameDetails.cognitiveAnalysis.improvementAreas.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Recomendaciones:</strong>
                    <ul>
                      {selectedGameDetails.cognitiveAnalysis.adaptationSuggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Datos Comparativos</h3>
                <div className="details-grid">
                  <div><strong>Mejor Puntuación Personal:</strong> {selectedGameDetails.comparativeData.personalBest}</div>
                  <div><strong>Comparación con Sesiones Anteriores:</strong> {selectedGameDetails.comparativeData.sessionComparison}</div>
                  <div><strong>Nivel Recomendado:</strong> {selectedGameDetails.comparativeData.recommendedNextLevel}</div>
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