import React from "react";
import { Link } from "react-router-dom";
import './styles.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="title">Entrenamiento Cognitivo</h1>
      <div className="games-grid">
        {Array.from({ length: 8 }, (_, i) => (
          <Link key={i} to={`/juego/${i + 1}`} className="game-button">
            Juego {i + 1}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
