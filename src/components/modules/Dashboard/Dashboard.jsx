import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../services/firebase/firebaseConfig";
import Loading from "../../Loading";
import { useNavigate } from 'react-router-dom';
import './styles.css';

const Dashboard = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      console.log("Usuario desconectado");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false); // Solo resetear si hay error
    }
  };

  if (isLoggingOut) {
    return <Loading message="Cerrando sesión..." />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="title">Entrenamiento Cognitivo</h1>
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>
      <div className="games-grid">
        {Array.from({ length: 8 }, (_, i) => (
          <Link key={i} to={`/juego/${i + 1}`} className="game-button">
            Juego {i + 1}
          </Link>
        ))}
      </div>
      {/* Agregar esta sección después de los juegos */}
      <section className="dashboard-section">
        <h2>Reportes y Análisis</h2>
        <div className="games-grid">
          <div className="game-card">
            <h3>Reportes de Progreso</h3>
            <button 
              className="play-button"
              onClick={() => navigate('/reports')}
            >
              Ver Reportes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
