import React, { useState, useEffect } from 'react';
import { auth } from '../../../services/firebase/firebaseConfig';
import { reportService } from '../../../services/firebase/reportService';
import { gameService } from '../../../services/firebase/gameService';
import './Reports.css';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [gameResults, setGameResults] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedGame, setSelectedGame] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const gameNames = {
    'matrices_progresivas': 'Matrices Progresivas',
    'matrices_raven': 'Matrices de Raven',
    'aprendizaje_listas': 'Aprendizaje de Listas',
    'balance_balanza': 'Balance de Balanzas',
    'reconociendo_objetos': 'Reconocimiento de Objetos',
    'posner_haciendo_cola': 'Señalización de Posner',
    'corsi_blocks': 'Bloques de Corsi',
    'memoria_visuoespacial_inversa': 'Memoria Visuoespacial Inversa'
  };

  const cognitiveRomains = {
    'razonamiento': 'Razonamiento',
    'memoria': 'Memoria',
    'atencion': 'Atención',
    'funciones_ejecutivas': 'Funciones Ejecutivas'
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
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

  const generateSummaryReport = async () => {
    try {
      const report = await reportService.generateUserSummaryReport(user.uid);
      console.log('Reporte generado:', report);
      
      alert('Reporte generado exitosamente. Ver consola para detalles.');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte');
    }
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
        <button onClick={generateSummaryReport} className="btn-generate-report">
          Generar Reporte Completo
        </button>
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
        <div className="summary-cards">
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
                      onClick={() => console.log('Detalles:', result.details)}
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;