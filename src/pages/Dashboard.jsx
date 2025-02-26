import React from "react";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="title">Entrenamiento Cognitivo</h1>
      <div className="games-grid">
        {Array.from({ length: 8 }, (_, i) => (
          <button key={i} className="game-button">
            Juego {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
