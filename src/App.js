import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/modules/Dashboard/Dashboard";
import Juego2 from "./components/modules/Games/juego2/Juego2";
import Juego3 from "./components/modules/Games/juego3/juego3";
import Juego1 from "./components/modules/Games/juego1/Juego1";
import Juego4 from "./components/modules/Games/juego4/Juego4";
import Juego5 from "./components/modules/Games/juego5/Juego5";
import Juego7 from "./components/modules/Games/juego7/Juego7";

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

          {/* Página del juego 3 */}
          <Route path="/juego/3" element={<Juego3 />} />

          {/* Página del juego 4 */}
          <Route path="/juego/4" element={<Juego4 />} />

          {/* Página del juego 5 */}
          <Route path="/juego/5" element={<Juego5 />} />

          {/* Página del juego 7 */}
          <Route path="/juego/7" element={<Juego7 />} />

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
