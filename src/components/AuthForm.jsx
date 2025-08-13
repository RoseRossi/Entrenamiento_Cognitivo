import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../services/firebase/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged
} from 'firebase/auth';
import Loading from './Loading';
import './AuthForm.css';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [useRedirect, setUseRedirect] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Verificar resultado de redirect al cargar la página
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log(' Redirect result:', result.user.email);
          setSuccessMessage("¡Inicio de sesión con Google exitoso!");
          setTimeout(() => {
            window.location.href = "/";
          }, 800);
        }
      } catch (error) {
        console.error(' Error en redirect result:', error);
        setErrors({ general: getErrorMessage(error.code) });
      }
    };
    
    checkRedirectResult();
    
    // Simplificar diagnóstico para evitar errores
    const checkPopupSupport = () => {
      try {
        const popup = window.open('', '_blank', 'width=1,height=1');
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          return false;
        }
        popup.close();
        return true;
      } catch (error) {
        return false;
      }
    };
    
    // Si los popups no funcionan, usar redirect por defecto
    if (!checkPopupSupport()) {
      setUseRedirect(true);
      console.log('🔧 Popups bloqueados, usando redirect por defecto');
    }
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
      
      // Redireccionar después de un breve delay para mostrar el mensaje
      setTimeout(() => {
        // Aquí deberías usar React Router en lugar de window.location
        window.location.href = "/";
      }, 1500);
      
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
    setGoogleLoading(true);
    clearMessages();
    
    try {
      console.log('🚀 Iniciando autenticación con Google...');
      const startTime = performance.now();
      
      // Configurar el proveedor de Google con configuraciones optimizadas
      googleProvider.setCustomParameters({
        prompt: 'select_account',
        // Forzar el uso de redirect en lugar de popup si hay problemas
        // redirect_uri: window.location.origin
      });
      
      console.log('📱 Abriendo popup de Google...');
      
      // Detectar si el popup fue bloqueado
      const popupPromise = signInWithPopup(auth, googleProvider);
      
      // Verificar si el popup se abre correctamente
      const popupTest = window.open('', '_blank', 'width=1,height=1');
      if (!popupTest || popupTest.closed || typeof popupTest.closed === 'undefined') {
        console.warn('⚠️ Popup posiblemente bloqueado, cambiando a redirect automáticamente...');
        popupTest?.close();
        setUseRedirect(true);
        // Ejecutar inmediatamente el método redirect
        setTimeout(() => handleGoogleLoginRedirect(), 100);
        return;
      }
      popupTest.close();
      
      // Usar signInWithPopup con timeout personalizado
      const result = await Promise.race([
        popupPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La autenticación tardó demasiado')), 30000)
        )
      ]);
      
      const endTime = performance.now();
      console.log(` Autenticación completada en ${Math.round(endTime - startTime)}ms`);
      
      // Verificar que el usuario se autenticó correctamente
      if (result.user) {
        console.log('👤 Usuario autenticado:', result.user.email);
        setSuccessMessage("¡Inicio de sesión con Google exitoso!");
        
        // Reducir aún más el tiempo de redirección
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      }
    } catch (error) {
      console.error(' Error en autenticación Google:', error);
      
      // Manejo específico de errores de Google
      let errorMessage = '';
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Ventana de Google cerrada. Intenta nuevamente';
          break;
        case 'auth/popup-blocked':
          errorMessage = ' Popup bloqueado detectado. Cambiando automáticamente al método redirect...';
          // Activar automáticamente el redirect si el popup está bloqueado
          setUseRedirect(true);
          setShowRetryButton(true);
          // Intentar automáticamente con redirect después de un breve delay
          setTimeout(() => {
            console.log(' Reintentando con redirect...');
            setShowRetryButton(false);
            handleGoogleLoginRedirect();
          }, 2000);
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Solicitud cancelada. Intenta nuevamente';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Espera un momento';
          break;
        case 'auth/internal-error':
          errorMessage = 'Error interno. Intenta recargar la página';
          break;
        default:
          if (error.message === 'Timeout: La autenticación tardó demasiado') {
            errorMessage = 'La autenticación está tardando demasiado. Prueba con la opción "Redirect"';
            setUseRedirect(true);
          } else {
            errorMessage = getErrorMessage(error.code);
          }
      }
      setErrors({ general: errorMessage });
    } finally {
      setGoogleLoading(false);
    }
  };

  // Función alternativa usando redirect (más confiable en algunos casos)
  const handleGoogleLoginRedirect = async () => {
    setGoogleLoading(true);
    clearMessages();
    
    try {
      console.log('🔄 Iniciando autenticación con Google (redirect)...');
      
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      await signInWithRedirect(auth, googleProvider);
      // El resultado se manejará en el useEffect de getRedirectResult
    } catch (error) {
      console.error(' Error en redirect:', error);
      setErrors({ general: getErrorMessage(error.code) });
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
    const message = useRedirect ? "Redirigiendo a Google..." : "Abriendo ventana de Google...";
    return <Loading message={message} />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card} className="auth-form-container">
        <h2 style={styles.title}>{isLogin ? 'Iniciar sesión' : 'Registrarse'}</h2>
        
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
        {user && (
          <div style={styles.userInfo}>
            <p>Conectado como: <strong>{user.email}</strong></p>
          </div>
        )}
        
        {/* Formulario solo si no hay usuario logueado */}
        {!user && (
          <>
            {/* Mensaje informativo para Google */}
            {googleLoading && !useRedirect && (
              <div style={styles.infoMessage}>
                <p>Se abrirá una ventana de Google para autenticarte. Si no aparece automáticamente, revisa que los popups estén habilitados.</p>
              </div>
            )}
            
            {/* Mensaje para redirect */}
            {googleLoading && useRedirect && (
              <div style={styles.warningMessage}>
                <p> Redirigiendo a Google... La página se recargará automáticamente.</p>
              </div>
            )}
            
            {/* Mensaje si se detectó popup bloqueado */}
            {useRedirect && !googleLoading && (
              <div style={styles.warningMessage}>
                <p> Modo Redirect activado (popups bloqueados detectados)</p>
              </div>
            )}
            
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
                  aria-describedby={errors.email ? "email-error" : undefined}
                  required
                />
                {errors.email && (
                  <span id="email-error" style={styles.fieldError}>
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
                  aria-describedby={errors.password ? "password-error" : undefined}
                  required
                />
                {errors.password && (
                  <span id="password-error" style={styles.fieldError}>
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
            
            <button 
              onClick={switchMode} 
              style={styles.switchButton}
              disabled={loading}
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
            
            <hr style={styles.hr} />
            
            {/* Opción para elegir método de Google */}
            <div style={styles.googleMethodSelector}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={useRedirect}
                  onChange={(e) => setUseRedirect(e.target.checked)}
                  style={styles.checkbox}
                />
                Usar redirect (recomendado si popup es lento)
              </label>
            </div>
            
            <button 
              onClick={useRedirect ? handleGoogleLoginRedirect : handleGoogleLogin} 
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
                  {useRedirect ? 'Redirigiendo a Google...' : 'Abriendo Google...'}
                </span>
              ) : `Ingresar con Google ${useRedirect ? '(Redirect)' : '(Popup)'}`}
            </button>
            
            {/* Botón de reintento automático */}
            {showRetryButton && (
              <button 
                onClick={() => {
                  setShowRetryButton(false);
                  handleGoogleLoginRedirect();
                }}
                style={styles.retryButton}
                className="auth-button"
              >
                 Reintentar con Redirect ahora
              </button>
            )}
          </>
        )}
        
        {/* Botón de cerrar sesión solo si hay usuario logueado */}
        {user && (
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
  googleButton: {
    width: '100%',
    marginTop: '10px',
    backgroundColor: '#ffdee9',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '1rem',
    transition: 'background-color 0.3s ease',
  },
  logoutButton: {
    width: '100%',
    marginTop: '10px',
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
  hr: {
    margin: '1.5rem 0',
    border: '0',
    height: '1px',
    background: '#e0e0e0',
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
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #b3d7ff',
    fontSize: '0.9rem',
  },
  infoMessage: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #ffeaa7',
    fontSize: '0.85rem',
    textAlign: 'left',
  },
  warningMessage: {
    backgroundColor: '#ffeaa7',
    color: '#d68910',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #f4d03f',
    fontSize: '0.85rem',
    textAlign: 'left',
    fontWeight: '500',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  googleMethodSelector: {
    marginBottom: '12px',
    textAlign: 'left',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    color: '#666',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  retryButton: {
    width: '100%',
    marginTop: '10px',
    backgroundColor: '#f39c12',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#fff',
    fontSize: '1rem',
    transition: 'background-color 0.3s ease',
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
