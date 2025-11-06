import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/Logo/Logo.png';
import './styles.css';

const Dashboard = () => {
  const navigate = useNavigate();

  // Configuración de los juegos con imágenes y nombres
  const games = [
    { id: 1, name: "Razonamiento gramatical", icon: "🧠", color: "#FFD3E1" }, // Rosa pastel
    { id: 2, name: "Matrices progresivas", icon: "🧩", color: "#D3E5FF" }, // Azul pastel
    { id: 3, name: "Aprendizaje de listas verbales", icon: "👁️", color: "#E1FFD3" }, // Verde pastel
    { id: 4, name: "Balance de balanza", icon: "🔍", color: "#FFFFD3" }, // Amarillo pastel
    { id: 5, name: "Reconocimiento de objetos", icon: "⚡", color: "#FFE1D3" }, // Naranja pastel
    { id: 6, name: "Posner haciendo cola", icon: "♟️", color: "#E1D3FF" }, // Púrpura pastel
    { id: 7, name: "Forward memory span", icon: "🎯", color: "#D3FFFF" }, // Cian pastel
    { id: 8, name: "Reverse memory span", icon: "🔄", color: "#FFD3F5" }, // Magenta pastel
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <img src={Logo} alt="Train Your Brain Logo" className="header-logo" />
        </div>
        <h1 className="header-title">Train Your Brain</h1>
        <button onClick={() => navigate('/user')} className="user-button-corner" title="Mi perfil">
          <span className="user-icon">👤</span>
        </button>
      </header>

      <div className="dashboard-content">
        <div className="main-layout">
          {/* Sección de juegos a la izquierda */}
          <div className="games-section">
            <h2 className="section-title">Juegos Cognitivos</h2>
            <div className="games-grid">
              {games.map((game) => (
                <Link
                  key={game.id}
                  to={`/juego/${game.id}`}
                  className="game-card"
                  style={{ backgroundColor: game.color }}
                >
                  <div className="game-icon">{game.icon}</div>
                  <h3 className="game-name">{game.name}</h3>
                </Link>
              ))}
            </div>
          </div>

          {/* Sección de reportes a la derecha */}
          <div className="reports-section">
            <div className="reports-card">
              <div className="reports-icon">📊</div>
              <h2>Reportes y Análisis</h2>
              <p className="reports-description">
                Visualiza tu progreso y estadísticas de entrenamiento
              </p>
              <button
                className="reports-button"
                onClick={() => navigate('/reports')}
              >
                <span className="button-icon">📈</span>
                Ver Reportes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;