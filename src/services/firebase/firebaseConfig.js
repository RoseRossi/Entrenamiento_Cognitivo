// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
  console.error('Variables de entorno faltantes:', missingVars);
  console.error('Asegúrate de tener un archivo .env con todas las variables de Firebase');
  throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar analytics solo en producción para evitar errores
let analytics;
try {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn('Analytics no disponible:', error);
}

// Inicializa servicios
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configurar el proveedor de Google para mejor rendimiento
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Configuraciones adicionales para optimizar la velocidad
  hd: '', 
});

// Configurar opciones adicionales para auth
auth.useDeviceLanguage();

export { auth, analytics, db, googleProvider };