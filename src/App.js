import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/modules/Dashboard/Dashboard";
import Juego2 from "./components/modules/Games/juego2/Juego2";
import Juego1 from "./components/modules/Games/juego1/Juego1";
function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* Página principal con el Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Página del juego 1 */}
          <Route path="/juego/1" element={<Juego1 />} />

          {/* Página del juego 2 */}
          <Route path="/juego/2" element={<Juego2 />} />

          {/* Página para juegos no disponibles */}
          <Route
            path="/juego/:id"
            element={<h2 style={{ textAlign: "center" }}>Juego no disponible aún</h2>}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
