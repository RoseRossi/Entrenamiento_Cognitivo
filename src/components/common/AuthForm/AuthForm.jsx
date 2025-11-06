import React, { useState, useEffect } from 'react';
import { auth, googleProvider, checkFirebaseConnection } from '../../../services/firebase/firebaseConfig';
import { userService } from '../../../services/firebase/userService';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup
} from 'firebase/auth';
import Loading from '../Loading/Loading';
import Logo from '../../../assets/images/Logo/Logo.png';
import PixelBlast from '../PixelBlast/PixelBlast';
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
    checkFirebaseConnection();
  }, []);

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
        return 'El popup de autenticación fue bloqueado por el navegador.';
      case 'auth/popup-closed-by-user':
        return 'Ventana cerrada antes de completar el login. Intenta nuevamente.';
      default:
        return 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';
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
      let userCredential;

      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);

        // 🔒 VALIDAR CUENTA DESPUÉS DEL LOGIN EXITOSO
        const validation = await userService.validateAccountForLogin(userCredential.user.uid);

        if (!validation.valid) {
          // Forzar logout inmediato
          await signOut(auth);

          // Mostrar mensaje específico
          let errorMessage = '';
          switch (validation.reason) {
            case 'account_deleted':
              errorMessage = 'Tu cuenta ha sido eliminada. No puedes acceder al sistema.';
              break;
            case 'account_inactive':
              errorMessage = 'Tu cuenta está inactiva. Contacta al administrador.';
              break;
            case 'account_suspended':
              errorMessage = validation.message || 'Tu cuenta está suspendida temporalmente.';
              break;
            default:
              errorMessage = 'No puedes acceder al sistema en este momento.';
          }

          setErrors({ general: errorMessage });
          return;
        }

        setSuccessMessage("¡Inicio de sesión exitoso!");
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMessage("¡Registro exitoso! Bienvenido/a");
      }
      setEmail('');
      setPassword('');
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
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, googleProvider);

      // 🔒 VALIDAR CUENTA DESPUÉS DEL LOGIN CON GOOGLE
      const validation = await userService.validateAccountForLogin(result.user.uid);

      if (!validation.valid) {
        // Forzar logout inmediato
        await signOut(auth);

        // Mostrar mensaje específico
        let errorMessage = '';
        switch (validation.reason) {
          case 'account_deleted':
            errorMessage = 'Tu cuenta ha sido eliminada. No puedes acceder al sistema.';
            break;
          case 'account_inactive':
            errorMessage = 'Tu cuenta está inactiva. Contacta al administrador.';
            break;
          case 'account_suspended':
            errorMessage = validation.message || 'Tu cuenta está suspendida temporalmente.';
            break;
          default:
            errorMessage = 'No puedes acceder al sistema en este momento.';
        }

        setErrors({ general: errorMessage });
        return;
      }

      // ✅ VALIDACIÓN EXITOSA - LOGIN COMPLETADO
      setSuccessMessage('¡Inicio de sesión con Google exitoso!');

    } catch (error) {
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

  if (loading && !googleLoading) {
    const message = isLogin ? "Iniciando sesión..." : "Creando cuenta...";
    return <Loading message={message} />;
  }

  if (googleLoading) {
    return <Loading message="Autenticando con Google..." />;
  }

  return (
    <>
      <div className="pixel-blast-background">
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#001f29"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <img src={Logo} alt="Train Your Brain Logo" className="auth-logo" />
            <h1 className="main-title">Train Your Brain</h1>
          </div>

          <h2 className="auth-title">
            {auth.currentUser ? `Bienvenido, ${auth.currentUser.displayName || auth.currentUser.email}` : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </h2>

          {successMessage && <div className="message success-message">{successMessage}</div>}
          {errors.general && <div className="message error-message">{errors.general}</div>}

          {auth.currentUser ? (
            <div className="user-info">
              <p>Conectado como: <strong>{auth.currentUser.email}</strong></p>
              <button
                onClick={handleLogout}
                className={`auth-button logout-button ${loading ? 'button-disabled' : ''}`}
                disabled={loading}
              >
                {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className="input-group">
                  <label htmlFor="email" className="auth-label">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`auth-input ${errors.email ? 'input-error' : ''}`}
                    disabled={loading || googleLoading}
                    required
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="password" className="auth-label">Contraseña</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`auth-input ${errors.password ? 'input-error' : ''}`}
                    disabled={loading || googleLoading}
                    required
                  />
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <button
                  type="submit"
                  className={`auth-button primary-button ${loading ? 'button-disabled' : ''}`}
                  disabled={loading || googleLoading}
                >
                  {loading ? (
                    <span className="loading-text">
                      <span className="spinner"></span>
                      Procesando...
                    </span>
                  ) : (isLogin ? 'Ingresar' : 'Registrarse')}
                </button>
              </form>

              <div className="divider">o</div>

              <button
                onClick={handleGoogleLogin}
                className={`auth-button google-button ${(googleLoading || loading) ? 'button-disabled' : ''}`}
                disabled={googleLoading || loading}
              >
                {googleLoading ? (
                  <span className="loading-text">
                    <span className="spinner"></span>
                    Autenticando...
                  </span>
                ) : (
                  <>
                    <svg className="google-icon" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuar con Google
                  </>
                )}
              </button>

              <button
                onClick={switchMode}
                className="switch-button"
                disabled={loading || googleLoading}
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
