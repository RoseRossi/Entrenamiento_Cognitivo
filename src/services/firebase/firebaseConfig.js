import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore, enableNetwork } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validar que todas las variables de entorno estén configuradas
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(' Variables de entorno faltantes:', missingVars);
  console.error(' Asegúrate de tener un archivo .env con todas las variables de Firebase');
  throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
}

// Initialize Firebase
console.log('🔥 Inicializando Firebase...');
const app = initializeApp(firebaseConfig);

// Inicializar analytics solo en producción para evitar errores
let analytics;
try {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    analytics = getAnalytics(app);
    console.log('📊 Analytics inicializado');
  }
} catch (error) {
  console.warn('⚠️ Analytics no disponible:', error);
}

// Inicializa servicios
const auth = getAuth(app);
const db = getFirestore(app);

// PASO 1: Configurar persistencia local antes que nada
const configurePersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    //console.log(' Persistencia de auth configurada');
  } catch (error) {
    console.error(' Error configurando persistencia:', error);
  }
};

// Ejecutar configuración de persistencia
configurePersistence();

// PASO 2: Configurar Google Provider con parámetros mejorados  
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
  // QUITAR el hd: '' que puede causar problemas
  // AGREGAR estos nuevos parámetros:
  access_type: 'offline',
  include_granted_scopes: true
});

// PASO 3: Agregar scopes necesarios
googleProvider.addScope('email');
googleProvider.addScope('profile');

console.log(' Google Provider configurado');

// PASO 4: Configurar persistencia offline de Firestore
const initializeFirestore = async () => {
  try {
    await enableNetwork(db);
    //console.log('Firestore red habilitada');
  } catch (error) {
    console.warn('Error habilitando red de Firestore:', error);
  }
};

// Inicializar la red de Firestore
initializeFirestore();

// PASO 5: Configurar opciones adicionales para auth
auth.useDeviceLanguage();

// PASO 6: Función de utilidad para debugging (opcional)
export const checkFirebaseConnection = async () => {
  try {
    const user = auth.currentUser;
    console.log(' Estado auth:', user ? `Logueado: ${user.email}` : 'No logueado');
    return true;
  } catch (error) {
    //console.error(' Error conexión Firebase:', error);
    return false;
  }
};

//console.log(' Firebase configurado completamente');

export { auth, analytics, db, googleProvider };