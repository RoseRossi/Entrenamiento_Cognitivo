import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export class GameService {
  constructor() {
    this.gamesCollection = collection(db, 'games');
    this.resultsCollection = collection(db, 'gameResults');
  }

  // Inicializar los juegos en la base de datos
  async initializeGames() {
    const games = [
      {
        id: 'razonamiento_gramatical',
        name: 'Razonamiento Gramatical',
        cognitiveDomain: 'lenguaje',
        concept: 'razonamiento_deductivo',
        element: 'comprension_relaciones_espaciales',
        description: 'Interpretar declaraciones lógicas sobre posiciones espaciales de figuras',
        levels: {
          basico: { timeLimit: 45, difficulty: 'basic' },
          intermedio: { timeLimit: 35, difficulty: 'medium' },
          avanzado: { timeLimit: 25, difficulty: 'advanced' }
        }
      },
      {
        id: 'matrices_progresivas',
        name: 'Matrices Progresivas',
        cognitiveDomain: 'razonamiento_abstracto',
        concept: 'razonamiento_abstracto',
        element: 'resolucion_problemas',
        description: 'Reconocer patrones en matrices 3x3 y completar la secuencia',
        levels: {
          basico: { timePerItem: 45, matrixSize: '3x3' },
          intermedio: { timePerItem: 35, matrixSize: '3x3' },
          avanzado: { timePerItem: 25, matrixSize: '4x4' }
        }
      },
      {
        id: 'aprendizaje_listas_verbales',
        name: 'Aprendizaje de Listas Verbales',
        cognitiveDomain: 'memoria',
        concept: 'memoria_declarativa',
        element: 'aprendizaje_verbal_episodico',
        description: 'Memorizar y recordar listas de palabras',
        levels: {
          basico: { wordCount: 12, exposureTime: 1000, rounds: 3 },
          intermedio: { wordCount: 15, exposureTime: 750, rounds: 4 },
          avanzado: { wordCount: 18, exposureTime: 500, rounds: 5 }
        }
      },
      {
        id: 'balance_balanza',
        name: 'Balance de Balanza',
        cognitiveDomain: 'funciones_ejecutivas',
        concept: 'razonamiento_proporcional',
        element: 'razonamiento_logico_matematico',
        description: 'Resolver problemas de equilibrio con formas geométricas',
        levels: {
          basico: { shapesPerBalance: 3, timeLimit: 600, totalTrials: 25 },
          intermedio: { shapesPerBalance: 4, timeLimit: 480, totalTrials: 30 },
          avanzado: { shapesPerBalance: 5, timeLimit: 360, totalTrials: 35 }
        }
      },
      {
        id: 'reconociendo_objetos',
        name: 'Reconociendo Objetos',
        cognitiveDomain: 'memoria',
        concept: 'memoria_reconocimiento_visual',
        element: 'reconocimiento_patrones_visuales',
        description: 'Memorizar figuras y reconocerlas posteriormente',
        levels: {
          basico: { figureCount: 5, exposureTime: 1500, testFigures: 5 },
          intermedio: { figureCount: 7, exposureTime: 1000, testFigures: 7 },
          avanzado: { figureCount: 10, exposureTime: 750, testFigures: 10 }
        }
      },
      {
        id: 'posner_haciendo_cola',
        name: 'Posner Haciendo Cola',
        cognitiveDomain: 'atencion',
        concept: 'atencion_visual',
        element: 'desplazamiento_atencional',
        description: 'Enfocar atención según señales direccionales',
        levels: {
          basico: { stimulusTime: 6000, totalTrials: 80, validCuePercent: 60 },
          intermedio: { stimulusTime: 3000, totalTrials: 100, validCuePercent: 60 },
          avanzado: { stimulusTime: 1000, totalTrials: 120, validCuePercent: 50 }
        }
      },
      {
        id: 'forward_memory_span',
        name: 'Forward Memory Span',
        cognitiveDomain: 'memoria_trabajo',
        concept: 'memoria_visoespacial',
        element: 'retencion_visoespacial',
        description: 'Recordar secuencias de círculos en el mismo orden',
        levels: {
          basico: { circleCount: 8, highlightTime: 400, initialSpan: 3 },
          intermedio: { circleCount: 10, highlightTime: 333, initialSpan: 3 },
          avanzado: { circleCount: 12, highlightTime: 300, initialSpan: 4 }
        }
      },
      {
        id: 'reverse_memory_span',
        name: 'Reverse Memory Span',
        cognitiveDomain: 'memoria_trabajo',
        concept: 'memoria_visoespacial_inversa',
        element: 'retencion_visoespacial',
        description: 'Recordar secuencias de círculos en orden inverso',
        levels: {
          basico: { circleCount: 8, highlightTime: 400, initialSpan: 3 },
          intermedio: { circleCount: 10, highlightTime: 333, initialSpan: 3 },
          avanzado: { circleCount: 12, highlightTime: 300, initialSpan: 4 }
        }
      }
    ];

    try {
      for (const game of games) {
        const gameRef = doc(this.gamesCollection, game.id);
        await setDoc(gameRef, {
          ...game,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      console.log('Games initialized successfully');
    } catch (error) {
      console.error('Error initializing games:', error);
      throw error;
    }
  }

  // Obtener configuración de un juego
  async getGame(gameId) {
    try {
      const gameRef = doc(this.gamesCollection, gameId);
      const gameSnap = await getDoc(gameRef);
      
      if (gameSnap.exists()) {
        return { id: gameSnap.id, ...gameSnap.data() };
      } else {
        throw new Error('Juego no encontrado');
      }
    } catch (error) {
      console.error('Error getting game:', error);
      throw error;
    }
  }

  // Obtener todos los juegos
  async getAllGames() {
    try {
      const querySnapshot = await getDocs(this.gamesCollection);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all games:', error);
      throw error;
    }
  }

  // Obtener juegos por dominio cognitivo
  async getGamesByCognitiveDomain(domain) {
    try {
      const q = query(this.gamesCollection, where('cognitiveDomain', '==', domain));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting games by domain:', error);
      throw error;
    }
  }

  // Guardar resultado de una partida
  async saveGameResult(resultData) {
    try {
      const resultRef = doc(this.resultsCollection);
      const result = {
        ...resultData,
        createdAt: serverTimestamp()
      };
      
      await setDoc(resultRef, result);
      return { id: resultRef.id, ...result };
    } catch (error) {
      console.error('Error saving game result:', error);
      throw error;
    }
  }

  // Obtener resultados de un usuario específico
  async getUserGameResults(userId, gameId = null, limit = null) {
    try {
      let q = query(
        this.resultsCollection, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      if (gameId) {
        q = query(q, where('gameId', '==', gameId));
      }
      
      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (limit) {
        results = results.slice(0, limit);
      }
      
      return results;
    } catch (error) {
      console.error('Error getting user game results:', error);
      throw error;
    }
  }

  // Obtener estadísticas de un juego para un usuario
  async getUserGameStats(userId, gameId) {
    try {
      const results = await this.getUserGameResults(userId, gameId);
      
      if (results.length === 0) {
        return {
          gamesPlayed: 0,
          averageScore: 0,
          bestScore: 0,
          averageTime: 0,
          lastPlayed: null
        };
      }
      
      const scores = results.map(r => r.score);
      const times = results.map(r => r.timeSpent).filter(t => t > 0);
      
      return {
        gamesPlayed: results.length,
        averageScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
        bestScore: Math.max(...scores),
        averageTime: times.length > 0 ? Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100 : 0,
        lastPlayed: results[0].createdAt
      };
    } catch (error) {
      console.error('Error getting user game stats:', error);
      throw error;
    }
  }
}

export const gameService = new GameService();