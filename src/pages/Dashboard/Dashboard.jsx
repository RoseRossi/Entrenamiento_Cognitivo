import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase/firebaseConfig";
import Loading from "../../components/common/Loading/Loading";
import { useNavigate } from 'react-router-dom';
import './styles.css';

const Dashboard = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      console.log("Usuario desconectado");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
    }
  };

  if (isLoggingOut) {
    return <Loading message="Cerrando sesión..." />;
  }

  return (
    <div className="dashboard-container">
      {/* Botón de cerrar sesión en la esquina superior derecha */}
      <button onClick={handleLogout} className="logout-button-corner" title="Cerrar Sesión">
        <span className="logout-icon">⏻</span>
      </button>

      <div className="dashboard-content">
        <h1 className="title">Entrenamiento Cognitivo</h1>
        
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