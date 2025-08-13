import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit as firebaseLimit,
  // startAfter,
  // endBefore,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export class ReportService {
  constructor() {
    this.resultsCollection = collection(db, 'gameResults');
    this.progressCollection = collection(db, 'userProgress');
    this.usersCollection = collection(db, 'users');
  }

  // Obtener reporte completo de un usuario
  async getUserCompleteReport(userId) {
    try {
      // Obtener información del usuario
      const userRef = doc(this.usersCollection, userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Usuario no encontrado');
      }
      
      const userData = { id: userSnap.id, ...userSnap.data() };
      
      // Obtener progreso por dominio cognitivo
      const progressQuery = query(
        this.progressCollection, 
        where('userId', '==', userId)
      );
      const progressSnapshot = await getDocs(progressQuery);
      const progress = progressSnapshot.docs.map(doc => doc.data());
      
      // Obtener resultados recientes
      const recentResultsQuery = query(
        this.resultsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        firebaseLimit(20)
      );
      const recentResultsSnapshot = await getDocs(recentResultsQuery);
      const recentResults = recentResultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calcular estadísticas generales
      const generalStats = await this.calculateUserGeneralStats(userId);
      
      return {
        user: userData,
        cognitiveDomainsProgress: progress,
        recentResults,
        generalStats,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating user complete report:', error);
      throw error;
    }
  }

  // Obtener reporte de progreso por dominio cognitivo
  async getCognitiveDomainReport(userId, cognitiveDomain, dateRange = null) {
    try {
      let resultsQuery = query(
        this.resultsCollection,
        where('userId', '==', userId),
        where('cognitiveDomain', '==', cognitiveDomain),
        orderBy('createdAt', 'desc')
      );
      
      // Aplicar filtro de fecha si se proporciona
      if (dateRange && dateRange.start && dateRange.end) {
        resultsQuery = query(
          resultsQuery,
          where('createdAt', '>=', dateRange.start),
          where('createdAt', '<=', dateRange.end)
        );
      }
      
      const resultsSnapshot = await getDocs(resultsQuery);
      const results = resultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Obtener progreso actual del dominio
      const progressRef = doc(this.progressCollection, `${userId}_${cognitiveDomain}`);
      const progressSnap = await getDoc(progressRef);
      const progress = progressSnap.exists() ? progressSnap.data() : null;
      
      // Calcular tendencias y estadísticas
      const stats = this.calculateDomainStats(results);
      const trends = this.calculateProgressTrends(results);
      
      return {
        cognitiveDomain,
        currentProgress: progress,
        results,
        statistics: stats,
        trends,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating cognitive domain report:', error);
      throw error;
    }
  }

  // Obtener dashboard con resumen de múltiples usuarios
  async getDashboardReport(userIds = [], dateRange = null) {
    try {
      const dashboardData = {
        totalUsers: userIds.length,
        cognitiveDomainsOverview: {},
        topPerformers: [],
        recentActivity: [],
        generatedAt: new Date().toISOString()
      };
      
      // Si no se proporcionan IDs específicos, obtener todos los usuarios activos
      if (userIds.length === 0) {
        const usersQuery = query(this.usersCollection, where('isActive', '==', true));
        const usersSnapshot = await getDocs(usersQuery);
        userIds = usersSnapshot.docs.map(doc => doc.id);
        dashboardData.totalUsers = userIds.length;
      }
      
      // Obtener estadísticas por dominio cognitivo
      const domains = [
        'lenguaje',
        'razonamiento_abstracto',
        'memoria',
        'funciones_ejecutivas',
        'atencion',
        'memoria_trabajo'
      ];
      
      for (const domain of domains) {
        dashboardData.cognitiveDomainsOverview[domain] = 
          await this.getDomainOverviewStats(userIds, domain, dateRange);
      }
      
      // Obtener top performers
      dashboardData.topPerformers = await this.getTopPerformers(userIds, 10);
      
      // Obtener actividad reciente
      dashboardData.recentActivity = await this.getRecentActivity(userIds, 50);
      
      return dashboardData;
    } catch (error) {
      console.error('Error generating dashboard report:', error);
      throw error;
    }
  }

  // Calcular estadísticas generales de un usuario
  async calculateUserGeneralStats(userId) {
    try {
      const resultsQuery = query(
        this.resultsCollection,
        where('userId', '==', userId)
      );
      const resultsSnapshot = await getDocs(resultsQuery);
      const results = resultsSnapshot.docs.map(doc => doc.data());
      
      if (results.length === 0) {
        return {
          totalGamesPlayed: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          favoriteGame: null,
          strongestDomain: null,
          improvementNeeded: null
        };
      }
      
      const scores = results.map(r => r.score);
      const times = results.map(r => r.timeSpent).filter(t => t > 0);
      
      // Calcular juego favorito (más jugado)
      const gameFrequency = results.reduce((acc, result) => {
        acc[result.gameId] = (acc[result.gameId] || 0) + 1;
        return acc;
      }, {});
      const favoriteGame = Object.keys(gameFrequency).reduce((a, b) => 
        gameFrequency[a] > gameFrequency[b] ? a : b
      );
      
      // Calcular dominio más fuerte (mejor promedio)
      const domainStats = this.calculateDomainAverages(results);
      const strongestDomain = Object.keys(domainStats).reduce((a, b) => 
        domainStats[a].average > domainStats[b].average ? a : b
      );
      
      // Dominio que necesita mejora (peor promedio)
      const improvementNeeded = Object.keys(domainStats).reduce((a, b) => 
        domainStats[a].average < domainStats[b].average ? a : b
      );
      
      return {
        totalGamesPlayed: results.length,
        averageScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
        totalTimeSpent: times.reduce((a, b) => a + b, 0),
        favoriteGame,
        strongestDomain,
        improvementNeeded: strongestDomain !== improvementNeeded ? improvementNeeded : null
      };
    } catch (error) {
      console.error('Error calculating user general stats:', error);
      throw error;
    }
  }

  // Métodos auxiliares para cálculos estadísticos
  calculateDomainStats(results) {
    if (results.length === 0) return {};
    
    const scores = results.map(r => r.score);
    const times = results.map(r => r.timeSpent).filter(t => t > 0);
    
    return {
      gamesPlayed: results.length,
      averageScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      averageTime: times.length > 0 ? Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100 : 0,
      totalTime: times.reduce((a, b) => a + b, 0)
    };
  }

  calculateProgressTrends(results) {
    if (results.length < 2) return { trend: 'insufficient_data' };
    
    // Ordenar por fecha (más antiguos primero)
    const sortedResults = results.sort((a, b) => 
      new Date(a.createdAt.seconds * 1000) - new Date(b.createdAt.seconds * 1000)
    );
    
    // Calcular tendencia usando promedio móvil simple
    const windowSize = Math.min(5, Math.floor(sortedResults.length / 2));
    const scores = sortedResults.map(r => r.score);
    
    const firstWindow = scores.slice(0, windowSize);
    const lastWindow = scores.slice(-windowSize);
    
    const firstAvg = firstWindow.reduce((a, b) => a + b, 0) / firstWindow.length;
    const lastAvg = lastWindow.reduce((a, b) => a + b, 0) / lastWindow.length;
    
    const improvement = ((lastAvg - firstAvg) / firstAvg) * 100;
    
    return {
      trend: improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable',
      improvementPercentage: Math.round(improvement * 100) / 100,
      firstPeriodAverage: Math.round(firstAvg * 100) / 100,
      lastPeriodAverage: Math.round(lastAvg * 100) / 100
    };
  }

  calculateDomainAverages(results) {
    const domainGroups = results.reduce((acc, result) => {
      if (!acc[result.cognitiveDomain]) {
        acc[result.cognitiveDomain] = [];
      }
      acc[result.cognitiveDomain].push(result.score);
      return acc;
    }, {});
    
    const domainAverages = {};
    for (const [domain, scores] of Object.entries(domainGroups)) {
      domainAverages[domain] = {
        average: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
        count: scores.length
      };
    }
    
    return domainAverages;
  }

  async getDomainOverviewStats(userIds, domain, dateRange) {
    // Implementación para obtener estadísticas generales de un dominio
    return {
      totalGames: 0,
      averageScore: 0,
      activeUsers: 0,
      improvementRate: 0
    };
  }

  async getTopPerformers(userIds, limit) {
    // Implementación para obtener los mejores usuarios
    return [];
  }

  async getRecentActivity(userIds, limit) {
    // Implementación para obtener actividad reciente
    return [];
  }
}

export const reportService = new ReportService();