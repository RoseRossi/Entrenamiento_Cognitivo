import React, { useRef, useState } from 'react';
import { Maximize2, Minimize2, BarChart2, Award, XCircle, Clock, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './GameLayout.css';

const GameLayout = ({ 
  title, 
  stats, 
  children, 
  description,
  gameOver = false,
  finalStats = {},
  onRestart,
  analysis = ""
}) => {
  const gameRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && gameRef.current) {
      gameRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (gameOver) {
    return (
      <div className="game-layout-container">
        <h1 className="game-title-centered">
          {finalStats.completed ? "¡Felicidades!" : "Juego Terminado"}
        </h1>
        
        <div className="final-card">
          <div className="final-stats">
            <div className="final-stat">
              <span className="stat-label">Nivel alcanzado:</span>
              <span className="stat-value">{finalStats.level || stats?.nivel}</span>
            </div>
            <div className="final-stat">
              <span className="stat-label">Puntuación final:</span>
              <span className="stat-value">{finalStats.score || stats?.puntuacion}</span>
            </div>
            <div className="final-stat">
              <span className="stat-label">Fallos:</span>
              <span className="stat-value">{finalStats.mistakes || stats?.fallos}</span>
            </div>
            <div className="final-stat">
              <span className="stat-label">Tiempo restante:</span>
              <span className="stat-value">
                {finalStats.timeRemaining ? formatTime(finalStats.timeRemaining) : formatTime(stats?.tiempo || 0)}
              </span>
            </div>
          </div>
          
          {analysis && (
            <div className="analysis-section">
              <h3>Análisis:</h3>
              <p>{analysis}</p>
            </div>
          )}
          
          <div className="button-group">
            <button onClick={onRestart} className="restart-button">
              Jugar de nuevo
            </button>
            <button onClick={handleGoHome} className="home-button">
              <Home size={18} className="icon-home" />
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-layout-container">
      <h1 className="game-title-centered">{title}</h1>

      <div className="game-content-wrapper">
        <div className="game-panel" ref={gameRef}>
          <button 
            onClick={toggleFullscreen} 
            className="fullscreen-btn-inside"
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <div className="game-stats">
            <div className="stat-item">
              <div className="stat-icon-wrapper bg-blue">
                <BarChart2 size={14} className="stat-icon" />
              </div>
              <div className="stat-text">
                <p className="stat-label">Nivel</p>
                <p className="stat-value">{stats?.nivel}</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon-wrapper bg-green">
                <Award size={14} className="stat-icon" />
              </div>
              <div className="stat-text">
                <p className="stat-label">Puntuación</p>
                <p className="stat-value">{stats?.puntuacion}</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon-wrapper bg-red">
                <XCircle size={14} className="stat-icon" />
              </div>
              <div className="stat-text">
                <p className="stat-label">Fallos</p>
                <p className="stat-value">{stats?.fallos}</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon-wrapper bg-yellow">
                <Clock size={14} className="stat-icon" />
              </div>
              <div className="stat-text">
                <p className="stat-label">Tiempo</p>
                <p className="stat-value">{formatTime(stats?.tiempo || 0)}</p>
              </div>
            </div>
          </div>

          <div className="game-main-content">
            {children}
          </div>
        </div>

        <div className="description-panel">
          <h2 className="description-title">Instrucciones</h2>
          <div className="description-content">
            <p>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLayout;