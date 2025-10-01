import React, { useState, useEffect } from 'react';
import { auth, googleProvider, checkFirebaseConnection } from '../../../services/firebase/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup
} from 'firebase/auth';
import Loading from '../Loading/Loading';
import './AuthForm.css';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    //console.log('🔍 Verificando Firebase al cargar AuthForm...');
    //console.log('🔍 Auth state:', auth.currentUser);
    checkFirebaseConnection();
  }, []); 

  // Validación de formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El correo no es válido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo de errores específicos de Firebase
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo electrónico';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/email-already-in-use':
        return 'Ya existe una cuenta con este correo electrónico';
      case 'auth/weak-password':
        return 'La contraseña es muy débil';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta más tarde';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu internet';
      case 'auth/popup-blocked':
        return 'Error de autenticación. Intenta nuevamente';
      default:
        return 'Ha ocurrido un error inesperado';
    }
  };

  const clearMessages = () => {
    setErrors({});
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage("¡Inicio de sesión exitoso!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMessage("¡Registro exitoso! Bienvenido/a");
      }
      
      // Limpiar formulario
      setEmail('');
      setPassword('');
      
      //console.log(' Auth completado, App.js manejará la navegación...');
      
    } catch (error) {
      setErrors({ general: getErrorMessage(error.code) });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setSuccessMessage("Has cerrado sesión correctamente");
      setEmail('');
      setPassword('');
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      setErrors({ general: getErrorMessage(error.code) });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    //console.log(' Iniciando autenticación con Google (popup)...');
    setGoogleLoading(true);
    clearMessages();
    
    try {
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      //console.log(' Ejecutando popup...');
      const result = await signInWithPopup(auth, googleProvider);
      
      console.log(' Login exitoso:', result.user.email);
      setSuccessMessage("¡Inicio de sesión con Google exitoso!");
      
      //console.log(' Auth completado, App.js manejará la navegación...');
      
    } catch (error) {
      console.error(' Error en Google Auth:', error);
      
      let errorMessage = 'Error de autenticación con Google';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Los popups están bloqueados. Habilita popups para este sitio o intenta en modo incógnito.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Ventana cerrada antes de completar el login. Intenta nuevamente.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Proceso cancelado. Intenta nuevamente.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setGoogleLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    clearMessages();
    setEmail('');
    setPassword('');
  };

  // Mostrar loading durante autenticación
  if (loading) {
    const message = isLogin ? "Iniciando sesión..." : "Creando cuenta...";
    return <Loading message={message} />;
  }

  if (googleLoading) {
    return <Loading message="Autenticando con Google..." />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card} className="auth-form-container">
        <h2 style={styles.title}>
          {auth.currentUser ? 'Bienvenido/a' : (isLogin ? 'Iniciar sesión' : 'Registrarse')}
        </h2>
        
        {/* Mensajes de éxito */}
        {successMessage && (
          <div style={styles.successMessage}>
            {successMessage}
          </div>
        )}
        
        {/* Mensajes de error general */}
        {errors.general && (
          <div style={styles.errorMessage}>
            {errors.general}
          </div>
        )}
        
        {/* Mostrar usuario logueado */}
        {auth.currentUser ? (
          <div style={styles.userInfo}>
            <p>Conectado como: <strong>{auth.currentUser.email}</strong></p>
            <button 
              onClick={handleLogout} 
              style={{
                ...styles.logoutButton,
                ...(loading ? styles.buttonDisabled : {})
              }}
              className="auth-button logout-button"
              disabled={loading}
            >
              {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </button>
          </div>
        ) : (
          <>
            {/* Formulario de email/password */}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label htmlFor="email" style={styles.label}>Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    ...styles.input,
                    ...(errors.email ? styles.inputError : {})
                  }}
                  className="auth-input"
                  disabled={loading}
                  required
                />
                {errors.email && (
                  <span style={styles.fieldError}>
                    {errors.email}
                  </span>
                )}
              </div>
              
              <div style={styles.inputGroup}>
                <label htmlFor="password" style={styles.label}>Contraseña</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    ...styles.input,
                    ...(errors.password ? styles.inputError : {})
                  }}
                  className="auth-input"
                  disabled={loading}
                  required
                />
                {errors.password && (
                  <span style={styles.fieldError}>
                    {errors.password}
                  </span>
                )}
              </div>
              
              <button 
                type="submit" 
                style={{
                  ...styles.primaryButton,
                  ...(loading ? styles.buttonDisabled : {})
                }}
                className="auth-button primary-button"
                disabled={loading}
              >
                {loading ? 'Procesando...' : (isLogin ? 'Ingresar' : 'Registrarse')}
              </button>
            </form>

            {/* Botón de Google */}
            <div style={styles.googleSection}>
              <button 
                onClick={handleGoogleLogin} 
                style={{
                  ...styles.googleButton,
                  ...(googleLoading || loading ? styles.buttonDisabled : {})
                }}
                className="auth-button google-button"
                disabled={googleLoading || loading}
              >
                {googleLoading ? (
                  <span style={styles.loadingText}>
                    <span style={styles.spinner} className="spinner"></span>
                    Autenticando...
                  </span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" style={styles.googleIconSvg}>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar con Google
                  </>
                )}
              </button>
            </div>
            
            {/* Switch entre login/registro*/}
            <button 
              onClick={switchMode} 
              style={styles.switchButton}
              disabled={loading}
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f7fc',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    color: '#6a5acd',
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
  },
  
  // SECCIÓN DE GOOGLE - PROMINENTE
  googleSection: {
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#fff',
    border: '1px solid #dadce0',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    color: '#3c4043',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  googleIconSvg: {
    flexShrink: 0,
  },
  
  // FORMULARIO
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
  },
  label: {
    color: '#333',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginLeft: '4px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: '#f4f0ff',
    transition: 'border-color 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
  },
  fieldError: {
    color: '#ff6b6b',
    fontSize: '0.8rem',
    marginTop: '4px',
    textAlign: 'left',
    width: '100%',
  },
  primaryButton: {
    padding: '12px',
    backgroundColor: '#c6a0f6',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s ease',
    marginTop: '8px',
  },
  switchButton: {
    marginTop: '1rem',
    background: 'none',
    border: 'none',
    color: '#6a5acd',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textDecoration: 'underline',
    transition: 'color 0.3s ease',
  },
  logoutButton: {
    width: '100%',
    marginTop: '15px',
    backgroundColor: '#fcd5ce',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '1rem',
    transition: 'background-color 0.3s ease',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #c3e6cb',
    fontSize: '0.9rem',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #f5c6cb',
    fontSize: '0.9rem',
  },
  userInfo: {
    backgroundColor: '#e7f3ff',
    color: '#004085',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #b3d7ff',
    fontSize: '0.9rem',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    display: 'inline-block',
  }
};