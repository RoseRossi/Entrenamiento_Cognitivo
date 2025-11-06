import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase/firebaseConfig';
import { gameService } from './services/firebase/gameService';
import { userService } from './services/firebase/userService';

import AuthForm from './components/common/AuthForm/AuthForm';
import Dashboard from './pages/Dashboard/Dashboard';
import Reports from './pages/Reports/Reports';
import UserProfile from './pages/User/User';

import Loading from './components/common/Loading/Loading';

import Juego1 from './components/Games/juego1/Juego1';
import Juego2 from './components/Games/juego2/Juego2';
import Juego3 from './components/Games/juego3/juego3';
import Juego4 from './components/Games/juego4/Juego4';
import Juego5 from './components/Games/juego5/Juego5';
import Juego6 from './components/Games/juego6/Juego6';
import Juego7 from './components/Games/juego7/Juego7';
import Juego8 from './components/Games/juego8/Juego8';

import './App.css';

// Componente NetworkStatus dentro de App.js
const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      //console.log(' Conexión restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      //console.log(' Sin conexión a internet');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ff4444',
      color: 'white',
      padding: '12px 20px',
      textAlign: 'center',
      zIndex: 10000,
      fontSize: '14px',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      borderBottom: '2px solid #cc0000'
    }}>
      <span style={{ marginRight: '8px' }}>⚠️</span>
      Sin conexión a internet. Trabajando en modo offline.
      <span style={{ marginLeft: '8px' }}>📶</span>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [accountError, setAccountError] = useState(null);

  const initializeAppData = async (currentUser) => {
    try {
      console.log('Inicializando datos de la aplicación...');

      // 1. Inicializar juegos (solo la primera vez)
      await gameService.initializeGames();

      // 2. Crear/verificar usuario en Firestore
      try {
        //  Usar la variable o no asignarla si no se usa
        await userService.getUser(currentUser.uid);
        console.log('Usuario ya existe en Firestore');

        // Si el usuario existe pero no tiene progreso inicializado
        try {
          const progress = await userService.getUserProgress(currentUser.uid);
          if (progress.length === 0) {
            await userService.initializeUserProgress(currentUser.uid);
            // console.log('Progreso de usuario inicializado');
          }
        } catch (progressError) {
          console.log('Inicializando progreso para usuario existente...');
          await userService.initializeUserProgress(currentUser.uid);
        }

      } catch (error) {
        // Solo crear si realmente no existe
        if (error.message.includes('Usuario no encontrado')) {
          console.log('Creando nuevo usuario...');
          const userData = {
            id: currentUser.uid,
            name: currentUser.displayName || 'Usuario',
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            createdAt: new Date()
          };
          await userService.createUser(userData);
          console.log('Usuario creado en Firestore');
        } else {
          console.warn('Error verificando usuario:', error.message);
        }
      }

      setDbInitialized(true);
      console.log('Inicialización completa');

    } catch (error) {
      console.error('Error inicializando datos:', error);
      // No bloquear la aplicación por errores de inicialización
      setDbInitialized(true); // Permitir continuar aunque falle la inicialización
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          console.log('Usuario autenticado:', currentUser.email);

          // 🔒 VALIDAR SI LA CUENTA ESTÁ ACTIVA ANTES DE PROCEDER
          const validation = await userService.validateAccountForLogin(currentUser.uid);

          if (!validation.valid) {
            // Account validation failed
            // console.warn(`❌ Cuenta no válida: ${validation.reason}`);

            // Configurar mensaje de error para mostrar en UI
            let errorConfig = {};
            switch (validation.reason) {
              case 'account_deleted':
                errorConfig = {
                  title: 'Cuenta Eliminada',
                  message: 'Tu cuenta ha sido eliminada y no puedes acceder al sistema.',
                  icon: '🗑️',
                  type: 'deleted'
                };
                break;
              case 'account_inactive':
                errorConfig = {
                  title: 'Cuenta Inactiva',
                  message: 'Tu cuenta está inactiva. Contacta al administrador para reactivarla.',
                  icon: '⚠️',
                  type: 'inactive'
                };
                break;
              case 'account_suspended':
                errorConfig = {
                  title: 'Cuenta Suspendida',
                  message: validation.message || 'Tu cuenta está suspendida temporalmente.',
                  icon: '🚫',
                  type: 'suspended'
                };
                break;
              default:
                errorConfig = {
                  title: 'Acceso Denegado',
                  message: 'No puedes acceder al sistema en este momento.',
                  icon: '❌',
                  type: 'error'
                };
            }

            setAccountError(errorConfig);

            // Forzar logout
            await userService.forceLogoutDeletedAccount(currentUser.uid, validation.reason);

            // Establecer usuario como null para redirigir al login
            setUser(null);
            setDbInitialized(true);
            return;
          }

          // Account validation passed - proceed with authentication
          setUser(currentUser);
          await initializeAppData(currentUser);
        } else {
          // console.log('Usuario no autenticado');
          setUser(null);
          setDbInitialized(true);
        }
      } catch (error) {
        // console.error('Error en onAuthStateChanged:', error);
        setUser(null);
        setDbInitialized(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading || !dbInitialized) {
    return <Loading />;
  }

  // Modal para errores de cuenta
  const AccountErrorModal = () => {
    if (!accountError) return null;

    return (
      <div className="account-error-overlay">
        <div className="account-error-modal">
          <div className="account-error-header">
            <div className="account-error-icon">{accountError.icon}</div>
            <h3>{accountError.title}</h3>
          </div>

          <div className="account-error-body">
            <p>{accountError.message}</p>
            {accountError.type === 'deleted' && (
              <div className="account-error-details">
                <p><strong>¿Qué significa esto?</strong></p>
                <ul>
                  <li>Tu cuenta ha sido eliminada permanentemente</li>
                  <li>Todos tus datos personales han sido anonimizados</li>
                  <li>No puedes recuperar esta cuenta</li>
                </ul>
              </div>
            )}
            {accountError.type === 'inactive' && (
              <div className="account-error-details">
                <p><strong>¿Qué puedes hacer?</strong></p>
                <ul>
                  <li>Contacta al administrador del sistema</li>
                  <li>Verifica que tu cuenta esté en buenas condiciones</li>
                  <li>Solicita la reactivación de tu cuenta</li>
                </ul>
              </div>
            )}
          </div>

          <div className="account-error-actions">
            <button
              className="account-error-btn"
              onClick={() => {
                setAccountError(null);
                window.location.href = '/login';
              }}
            >
              Volver al Login
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <NetworkStatus />
      <AccountErrorModal />
      <div className="App" style={{ paddingTop: navigator.onLine ? '0' : '50px' }}>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <AuthForm />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/reports"
            element={user ? <Reports /> : <Navigate to="/login" />}
          />
          <Route
            path="/user"
            element={user ? <UserProfile /> : <Navigate to="/login" />}
          />


          {/* Rutas de los juegos */}
          <Route
            path="/juego/1"
            element={user ? <Juego1 /> : <Navigate to="/login" />}
          />
          <Route
            path="/juego/2"
            element={user ? <Juego2 /> : <Navigate to="/login" />}
          />
          <Route
            path="/juego/3"
            element={user ? <Juego3 /> : <Navigate to="/login" />}
          />
          <Route
            path="/juego/4"
            element={user ? <Juego4 /> : <Navigate to="/login" />}
          />
          <Route
            path="/juego/5"
            element={user ? <Juego5 /> : <Navigate to="/login" />}
          />
          <Route
            path="/juego/6"
            element={user ? <Juego6 /> : <Navigate to="/login" />}
          />
          <Route
            path="/juego/7"
            element={user ? <Juego7 /> : <Navigate to="/login" />}
          />
          <Route
            path="/juego/8"
            element={user ? <Juego8 /> : <Navigate to="/login" />}
          />

          {/* Ruta por defecto */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;