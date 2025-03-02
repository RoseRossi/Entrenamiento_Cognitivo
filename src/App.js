import React from "react";
import "./App.css";

function App() {
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
}

export default App;
