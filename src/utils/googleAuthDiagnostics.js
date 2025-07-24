// Utilidad para diagnosticar problemas de autenticación con Google
export const GoogleAuthDiagnostics = {
  // Verificar si los popups están habilitados
  checkPopupSupport() {
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
  },

  // Verificar velocidad de conexión
  async checkConnectionSpeed() {
    const startTime = performance.now();
    try {
      await fetch('https://accounts.google.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      return {
        responseTime,
        quality: responseTime < 1000 ? 'good' : responseTime < 3000 ? 'fair' : 'poor'
      };
    } catch (error) {
      return {
        responseTime: null,
        quality: 'error',
        error: error.message
      };
    }
  },

  // Obtener información del navegador
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    const isChrome = userAgent.includes('Chrome');
    const isFirefox = userAgent.includes('Firefox');
    const isSafari = userAgent.includes('Safari') && !isChrome;
    const isEdge = userAgent.includes('Edge');
    
    return {
      userAgent,
      browser: isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isEdge ? 'Edge' : 'Unknown',
      supportsPopup: GoogleAuthDiagnostics.checkPopupSupport()
    };
  },

  // Verificar configuración de Firebase
  checkFirebaseConfig() {
    const requiredVars = [
      'REACT_APP_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_AUTH_DOMAIN',
      'REACT_APP_FIREBASE_PROJECT_ID'
    ];
    
    const missing = requiredVars.filter(key => !process.env[key]);
    
    return {
      isComplete: missing.length === 0,
      missing,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
    };
  },

  // Ejecutar diagnóstico completo
  async runFullDiagnostic() {
    console.log('🔍 Ejecutando diagnóstico de Google Auth...');
    
    const browserInfo = GoogleAuthDiagnostics.getBrowserInfo();
    const firebaseConfig = GoogleAuthDiagnostics.checkFirebaseConfig();
    const connectionSpeed = await GoogleAuthDiagnostics.checkConnectionSpeed();
    
    const report = {
      browser: browserInfo,
      firebase: firebaseConfig,
      connection: connectionSpeed,
      timestamp: new Date().toISOString()
    };
    
    console.log(' Reporte de diagnóstico:', report);
    
    // Recomendaciones basadas en el diagnóstico
    const recommendations = [];
    
    if (!browserInfo.supportsPopup) {
      recommendations.push(' Los popups están bloqueados. Usar método redirect.');
    }
    
    if (connectionSpeed.quality === 'poor') {
      recommendations.push(' Conexión lenta detectada. Usar redirect puede ser más rápido.');
    }
    
    if (!firebaseConfig.isComplete) {
      recommendations.push(' Configuración de Firebase incompleta.');
    }
    
    if (browserInfo.browser === 'Safari') {
      recommendations.push(' Safari detectado. El método redirect suele ser más confiable.');
    }
    
    console.log(' Recomendaciones:', recommendations);
    
    return { report, recommendations };
  }
};
