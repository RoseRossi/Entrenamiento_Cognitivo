// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/modules/Dashboard/Dashboard";
import Juego1 from "./components/modules/Games/juego1/Juego1";
import Juego2 from "./components/modules/Games/juego2/Juego2";
import Juego3 from "./components/modules/Games/juego3/juego3";
import Juego4 from "./components/modules/Games/juego4/Juego4";
import Juego5 from "./components/modules/Games/juego5/Juego5";
import Juego6 from "./components/modules/Games/juego6/Juego6";
import Juego7 from "./components/modules/Games/juego7/Juego7";
import Juego8 from "./components/modules/Games/juego8/Juego8";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Evitar parpadeos

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <Router>
      <Routes>
        {/* Si no hay usuario, solo mostrar AuthForm */}
        {!user ? (
          <Route path="*" element={<AuthForm />} />
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/juego/1" element={<Juego1 />} />
            <Route path="/juego/2" element={<Juego2 />} />
            <Route path="/juego/3" element={<Juego3 />} />
            <Route path="/juego/4" element={<Juego4 />} />
            <Route path="/juego/5" element={<Juego5 />} />
            <Route path="/juego/6" element={<Juego6 />} />
            <Route path="/juego/7" element={<Juego7 />} />
            <Route path="/juego/8" element={<Juego8 />} />
            <Route
              path="/juego/:id"
              element={
                <h2 style={{ textAlign: "center" }}>Juego no disponible aún</h2>
              }
            />
            {/* Si el usuario va a /login por error, redireccionarlo */}
            <Route path="/login" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
