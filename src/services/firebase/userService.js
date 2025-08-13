import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export class UserService {
  constructor() {
    this.usersCollection = collection(db, 'users');
    this.progressCollection = collection(db, 'userProgress');
  }

  // Crear un nuevo usuario
  async createUser(userData) {
    try {
      const userRef = doc(this.usersCollection, userData.id);
      const user = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };
      
      await setDoc(userRef, user);
      
      // Inicializar progreso para todos los dominios cognitivos
      await this.initializeUserProgress(userData.id);
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Obtener información de un usuario
  async getUser(userId) {
    try {
      const userRef = doc(this.usersCollection, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  // Actualizar información de usuario
  async updateUser(userId, updateData) {
    try {
      const userRef = doc(this.usersCollection, userId);
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, updatedData);
      return updatedData;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Obtener todos los usuarios activos
  async getActiveUsers() {
    try {
      const q = query(this.usersCollection, where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting active users:', error);
      throw error;
    }
  }

  // Inicializar progreso del usuario para todos los dominios cognitivos
  async initializeUserProgress(userId) {
    try {
      const domains = [
        'lenguaje',
        'razonamiento_abstracto', 
        'memoria',
        'funciones_ejecutivas',
        'atencion',
        'memoria_trabajo'
      ];

      for (const domain of domains) {
        const progressRef = doc(this.progressCollection, `${userId}_${domain}`);
        await setDoc(progressRef, {
          userId,
          cognitiveDomain: domain,
          currentLevel: 1,
          totalGamesPlayed: 0,
          averageScore: 0,
          bestScore: 0,
          lastPlayedAt: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error initializing user progress:', error);
      throw error;
    }
  }

  // Obtener progreso de un usuario
  async getUserProgress(userId) {
    try {
      const q = query(this.progressCollection, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  // Actualizar progreso del usuario en un dominio específico
  async updateUserProgress(userId, cognitiveDomain, newScore) {
    try {
      const progressRef = doc(this.progressCollection, `${userId}_${cognitiveDomain}`);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        const currentProgress = progressSnap.data();
        const totalGames = currentProgress.totalGamesPlayed + 1;
        const newAverage = ((currentProgress.averageScore * currentProgress.totalGamesPlayed) + newScore) / totalGames;
        const newBestScore = Math.max(currentProgress.bestScore, newScore);
        
        await updateDoc(progressRef, {
          totalGamesPlayed: totalGames,
          averageScore: Math.round(newAverage * 100) / 100,
          bestScore: newBestScore,
          lastPlayedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }
}

export const userService = new UserService();