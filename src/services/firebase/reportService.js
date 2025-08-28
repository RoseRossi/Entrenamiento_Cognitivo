import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit as firebaseLimit,
  doc,
  getDoc,
} from 'firebase/firestore';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { db } from './firebaseConfig';
import { 
  getDomainMetadata,
  validateDomainExists,
  getAllDomains,
  validateGameExists
} from '../gameConfig/GAME_METADATA';

export class ReportService {
  constructor() {
    this.resultsCollection = collection(db, 'gameResults');
    this.progressCollection = collection(db, 'userProgress');
    this.usersCollection = collection(db, 'users');
    
    // Para rate limiting y tracking de seguridad
    this.requestTracker = new Map();
    this.reportGenerationTracker = new Map();
    this.adminAccessTracker = new Map();
    
    // Límites de seguridad para reportes
    this.maxReportSize = 10000; // Máximo registros por reporte
    this.maxDateRange = 365; // Máximo rango de días
    this.maxUsersInDashboard = 1000; // Máximo usuarios en dashboard
  }

  //   Obtener usuario autenticado actual
  getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          reject(new Error('Usuario no autenticado. Por favor, inicia sesión.'));
        }
      });
    });
  }

  //   Validar que el usuario solo acceda a sus propios datos
  async validateUserAccess(requestedUserId, operation = 'read') {
    const currentUser = await this.getCurrentUser();
    
    if (currentUser.uid !== requestedUserId) {
      this.logSecurityEvent('UNAUTHORIZED_REPORT_ACCESS', currentUser.uid, {
        requestedUserId,
        operation,
        severity: 'HIGH'
      });
      throw new Error('Acceso denegado: Solo puedes acceder a tus propios reportes.');
    }
    
    return currentUser;
  }

  //   Verificar permisos de administrador con validación adicional
  async validateAdminAccess(operation = 'admin_read') {
    const currentUser = await this.getCurrentUser();
    
    // Verificar permisos de administrador
    const userRef = doc(this.usersCollection, currentUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists() || !userSnap.data().isAdmin) {
      this.logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', currentUser.uid, {
        operation,
        severity: 'CRITICAL'
      });
      throw new Error('Acceso denegado: Solo los administradores pueden realizar esta operación.');
    }

    // Rate limiting específico para administradores
    this.checkAdminRateLimit(currentUser.uid, operation);
    
    return currentUser;
  }

  //   Rate limiting específico para administradores
  checkAdminRateLimit(userId, operation) {
    const now = Date.now();
    const key = `${userId}_${operation}`;
    const adminRequests = this.adminAccessTracker.get(key) || [];
    
    // Límites específicos para operaciones de admin
    const adminLimits = {
      getDashboardReport: { window: 300000, max: 10 }, // 10 dashboards por 5 minutos
      getUsersReport: { window: 600000, max: 5 }, // 5 reportes de usuarios por 10 minutos
      getAggregatedReport: { window: 900000, max: 3 } // 3 reportes agregados por 15 minutos
    };
    
    const limit = adminLimits[operation] || { window: 300000, max: 20 };
    
    const recentRequests = adminRequests.filter(timestamp => 
      now - timestamp < limit.window
    );
    
    if (recentRequests.length >= limit.max) {
      this.logSecurityEvent('ADMIN_RATE_LIMIT_EXCEEDED', userId, {
        operation,
        requestCount: recentRequests.length,
        limit: limit.max,
        severity: 'HIGH'
      });
      throw new Error(
        `Límite de ${operation} excedido para administradores. ` +
        `Máximo ${limit.max} operaciones cada ${limit.window/1000} segundos.`
      );
    }
    
    recentRequests.push(now);
    this.adminAccessTracker.set(key, recentRequests);
  }

  //   Sanitizar y validar entradas mejorado
  validateInput(input, type = 'string', fieldName = 'campo') {
    if (input === null || input === undefined) {
      throw new Error(`${fieldName} es requerido`);
    }

    switch (type) {
      case 'userId':
        if (typeof input !== 'string' || input.length < 10 || input.length > 128) {
          throw new Error('ID de usuario inválido');
        }
        // Validar caracteres permitidos en Firebase UID
        if (!/^[a-zA-Z0-9]+$/.test(input)) {
          throw new Error('ID de usuario contiene caracteres no permitidos');
        }
        break;
        
      case 'cognitiveDomain':
        if (!validateDomainExists(input)) {
          const validDomains = getAllDomains().map(d => d.id);
          throw new Error(`Dominio cognitivo inválido. Debe ser uno de: ${validDomains.join(', ')}`);
        }
        break;
        
      case 'gameId':
        if (!validateGameExists(input)) {
          throw new Error(`ID de juego inválido: ${input}`);
        }
        break;
        
      case 'dateRange':
        this.validateDateRange(input);
        break;
        
      case 'limit':
        const limitNum = parseInt(input);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > this.maxReportSize) {
          throw new Error(`Límite debe ser un número entre 1 y ${this.maxReportSize}`);
        }
        return limitNum;
        
      case 'userIds':
        if (!Array.isArray(input)) {
          throw new Error('userIds debe ser un array');
        }
        if (input.length > this.maxUsersInDashboard) {
          throw new Error(`Máximo ${this.maxUsersInDashboard} usuarios por reporte`);
        }
        // Validar cada userId
        input.forEach(id => this.validateInput(id, 'userId', 'ID de usuario en array'));
        break;
        
      default:
        if (typeof input !== 'string' || input.length > 1000) {
          throw new Error(`${fieldName} debe ser un texto válido de máximo 1000 caracteres`);
        }
        // Sanitizar caracteres peligrosos
        if (/<script|javascript:|data:|vbscript:/i.test(input)) {
          throw new Error(`${fieldName} contiene contenido no permitido`);
        }
        break;
    }
    
    return input;
  }

  //   Validar rango de fechas
  validateDateRange(dateRange) {
    if (!dateRange || typeof dateRange !== 'object') {
      throw new Error('Rango de fechas debe ser un objeto');
    }

    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      // Validar que sean fechas válidas
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Fechas inválidas en el rango');
      }
      
      // Validar que start < end
      if (startDate >= endDate) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }
      
      // Validar rango máximo
      const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
      if (daysDiff > this.maxDateRange) {
        throw new Error(`El rango máximo permitido es de ${this.maxDateRange} días`);
      }
      
      // No permitir fechas futuras
      const now = new Date();
      if (endDate > now) {
        throw new Error('No se permiten fechas futuras');
      }
    }
  }

  //   Rate limiting mejorado
  checkRateLimit(userId, operation = 'general') {
    const now = Date.now();
    const key = `${userId}_${operation}`;
    const userRequests = this.requestTracker.get(key) || [];
    
    // Configurar límites según operación
    const limits = {
      general: { window: 3600000, max: 50 }, // 50 requests por hora
      report_generation: { window: 1800000, max: 10 }, // 10 reportes por 30 minutos
      complete_report: { window: 3600000, max: 5 }, // 5 reportes completos por hora
      domain_report: { window: 1800000, max: 15 }, // 15 reportes de dominio por 30 minutos
      stats_calculation: { window: 600000, max: 20 } // 20 cálculos de stats por 10 minutos
    };
    
    const limit = limits[operation] || limits.general;
    
    // Filtrar requests dentro de la ventana de tiempo
    const recentRequests = userRequests.filter(timestamp => 
      now - timestamp < limit.window
    );
    
    if (recentRequests.length >= limit.max) {
      this.logSecurityEvent('RATE_LIMIT_EXCEEDED', userId, {
        operation,
        requestCount: recentRequests.length,
        limit: limit.max,
        severity: 'MEDIUM'
      });
      throw new Error(
        `Límite de ${operation} excedido. ` +
        `Máximo ${limit.max} operaciones cada ${limit.window/60000} minutos.`
      );
    }
    
    recentRequests.push(now);
    this.requestTracker.set(key, recentRequests);
  }

  //   Logging de eventos de seguridad mejorado
  logSecurityEvent(event, userId, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId,
      service: 'ReportService',
      severity: details.severity || 'LOW',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 200) : 'Server',
      ip: null, // No guardar IP por privacidad
      ...details
    };
    
    // Log según severidad
    if (logEntry.severity === 'CRITICAL' || logEntry.severity === 'HIGH') {
      console.error('  Critical Report Security Event:', logEntry);
    } else {
      console.warn('  Report Security Event:', logEntry);
    }
    
    // En producción, enviar a servicio de logging externo
    // this.sendToSecurityLog(logEntry);
  }

  //   Obtener reporte completo de un usuario (SECURIZADO MEJORADO)
  async getUserCompleteReport(userId, options = {}) {
    try {
      // 1. Validar entradas
      this.validateInput(userId, 'userId', 'ID de usuario');
      
      // Validar opciones
      const safeOptions = {
        includeDetails: Boolean(options.includeDetails || false),
        limit: this.validateInput(options.limit || 100, 'limit', 'límite de resultados'),
        dateRange: options.dateRange || null
      };
      
      if (safeOptions.dateRange) {
        this.validateInput(safeOptions.dateRange, 'dateRange', 'rango de fechas');
      }
      
      // 2. Validar autenticación y autorización
      const currentUser = await this.validateUserAccess(userId, 'getUserCompleteReport');
      
      // 3. Rate limiting
      this.checkRateLimit(currentUser.uid, 'complete_report');
      
      // 4. Log del acceso autorizado
      this.logSecurityEvent('COMPLETE_REPORT_ACCESS', currentUser.uid, {
        requestedUserId: userId,
        includeDetails: safeOptions.includeDetails,
        limit: safeOptions.limit
      });

      // 5. Obtener información del usuario (filtrada)
      const userRef = doc(this.usersCollection, userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Usuario no encontrado');
      }
      
      const userData = { id: userSnap.id, ...userSnap.data() };
      const filteredUserData = this.filterSensitiveUserData(userData);
      
      // 6. Obtener progreso por dominio cognitivo (solo del usuario autenticado)
      const progressQuery = query(
        this.progressCollection, 
        where('userId', '==', userId)
      );
      const progressSnapshot = await getDocs(progressQuery);
      const progress = progressSnapshot.docs.map(doc => {
        const data = doc.data();
        return this.enrichProgressWithMetadata(data);
      });
      
      // 7. Obtener resultados con filtros de seguridad
      const recentResults = await this.getFilteredResults(userId, safeOptions);
      
      // 8. Calcular estadísticas generales de forma segura
      const generalStats = await this.calculateUserGeneralStats(userId, safeOptions.dateRange);
      
      // 9. Generar análisis de tendencias
      const trendsAnalysis = this.calculateUserTrends(recentResults);
      
      // 10. Generar recomendaciones (solo basadas en datos propios)
      const recommendations = this.generateUserRecommendations(progress, generalStats);
      
      const report = {
        reportMetadata: {
          type: 'complete_user_report',
          userId,
          generatedAt: new Date().toISOString(),
          generatedBy: currentUser.uid,
          options: safeOptions,
          version: '2.0'
        },
        user: filteredUserData,
        cognitiveDomainsProgress: progress,
        recentResults: safeOptions.includeDetails ? recentResults : recentResults.slice(0, 10),
        generalStats,
        trendsAnalysis,
        recommendations,
        summary: {
          totalGamesPlayed: generalStats.totalGamesPlayed,
          averageScore: generalStats.averageScore,
          strongestDomain: generalStats.strongestDomain,
          improvementNeeded: generalStats.improvementNeeded
        }
      };
      
      return report;
    } catch (error) {
      this.logSecurityEvent('COMPLETE_REPORT_ERROR', userId, {
        error: error.message,
        severity: 'MEDIUM'
      });
      console.error('Error generating user complete report:', error);
      throw error;
    }
  }

  //   Filtrar datos sensibles del usuario para reportes
  filterSensitiveUserData(userData) {
    const {
      metadata,
      isAdmin,
      emailVerified,
      createdAt,
      updatedAt,
      ...filteredData
    } = userData;
    
    // Solo incluir datos necesarios para el reporte
    return {
      id: filteredData.id,
      displayName: filteredData.displayName || 'Usuario',
      age: filteredData.age,
      gender: filteredData.gender,
      education: filteredData.education,
      language: filteredData.language || 'es',
      preferences: {
        theme: filteredData.preferences?.theme,
        difficulty: filteredData.preferences?.difficulty
      }
    };
  }

  //   Enriquecer progreso con metadatos seguros
  enrichProgressWithMetadata(progressData) {
    const domainMetadata = getDomainMetadata(progressData.cognitiveDomain);
    
    return {
      ...progressData,
      domainName: progressData.domainName || domainMetadata?.name || progressData.cognitiveDomain,
      domainColor: progressData.domainColor || domainMetadata?.color || '#gray',
      domainIcon: progressData.domainIcon || domainMetadata?.icon || '📊',
      domainDescription: domainMetadata?.description || 'Dominio cognitivo'
    };
  }

  //   Obtener resultados filtrados de forma segura
  async getFilteredResults(userId, options) {
    let resultsQuery = query(
      this.resultsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      firebaseLimit(Math.min(options.limit, this.maxReportSize))
    );
    
    // Aplicar filtro de fecha si se proporciona
    if (options.dateRange && options.dateRange.start && options.dateRange.end) {
      resultsQuery = query(
        this.resultsCollection,
        where('userId', '==', userId),
        where('createdAt', '>=', new Date(options.dateRange.start)),
        where('createdAt', '<=', new Date(options.dateRange.end)),
        orderBy('createdAt', 'desc'),
        firebaseLimit(Math.min(options.limit, this.maxReportSize))
      );
    }
    
    const resultsSnapshot = await getDocs(resultsQuery);
    const results = resultsSnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };
      return this.sanitizeResultForReport(data);
    });
    
    return results;
  }

  //   Sanitizar resultado para incluir en reporte
  sanitizeResultForReport(result) {
    return {
      id: result.id,
      gameId: result.gameId,
      gameName: result.gameMetadata?.displayName || result.gameName || result.gameId,
      cognitiveDomain: result.cognitiveDomain,
      domainName: result.domainMetadata?.name || result.cognitiveDomain,
      score: result.score,
      timeSpent: result.timeSpent,
      difficulty: result.difficulty || 'medium',
      createdAt: result.createdAt,
      // No incluir detalles específicos por privacidad
      details: result.details ? {
        correctAnswers: result.details.correctAnswers,
        totalQuestions: result.details.totalQuestions
      } : null
    };
  }

  //   Obtener reporte de progreso por dominio cognitivo (SECURIZADO MEJORADO)
  async getCognitiveDomainReport(userId, cognitiveDomain, options = {}) {
    try {
      // 1. Validar entradas
      this.validateInput(userId, 'userId', 'ID de usuario');
      this.validateInput(cognitiveDomain, 'cognitiveDomain', 'Dominio cognitivo');
      
      const safeOptions = {
        limit: this.validateInput(options.limit || 50, 'limit', 'límite'),
        dateRange: options.dateRange || null,
        includeGameBreakdown: Boolean(options.includeGameBreakdown || false)
      };
      
      if (safeOptions.dateRange) {
        this.validateInput(safeOptions.dateRange, 'dateRange', 'rango de fechas');
      }
      
      // 2. Validar autenticación y autorización
      const currentUser = await this.validateUserAccess(userId, 'getCognitiveDomainReport');
      
      // 3. Rate limiting
      this.checkRateLimit(currentUser.uid, 'domain_report');
      
      // 4. Log del acceso
      this.logSecurityEvent('DOMAIN_REPORT_ACCESS', currentUser.uid, {
        requestedUserId: userId,
        cognitiveDomain,
        options: safeOptions
      });

      // 5. Obtener metadatos del dominio
      const domainMetadata = getDomainMetadata(cognitiveDomain);
      if (!domainMetadata) {
        throw new Error(`Metadatos del dominio ${cognitiveDomain} no encontrados`);
      }

      // 6. Construir query segura (solo datos del usuario autenticado)
      let resultsQuery = query(
        this.resultsCollection,
        where('userId', '==', userId),
        where('cognitiveDomain', '==', cognitiveDomain),
        orderBy('createdAt', 'desc'),
        firebaseLimit(safeOptions.limit)
      );
      
      // Aplicar filtro de fecha si se proporciona
      if (safeOptions.dateRange && safeOptions.dateRange.start && safeOptions.dateRange.end) {
        resultsQuery = query(
          this.resultsCollection,
          where('userId', '==', userId),
          where('cognitiveDomain', '==', cognitiveDomain),
          where('createdAt', '>=', new Date(safeOptions.dateRange.start)),
          where('createdAt', '<=', new Date(safeOptions.dateRange.end)),
          orderBy('createdAt', 'desc'),
          firebaseLimit(safeOptions.limit)
        );
      }
      
      const resultsSnapshot = await getDocs(resultsQuery);
      const results = resultsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // 7. Obtener progreso actual del dominio (solo del usuario autenticado)
      const progressRef = doc(this.progressCollection, `${userId}_${cognitiveDomain}`);
      const progressSnap = await getDoc(progressRef);
      const progress = progressSnap.exists() ? 
        this.enrichProgressWithMetadata(progressSnap.data()) : null;
      
      // 8. Calcular tendencias y estadísticas de forma segura
      const stats = this.calculateDomainStats(results);
      const trends = this.calculateProgressTrends(results);
      const gameBreakdown = safeOptions.includeGameBreakdown ? 
        this.calculateGameBreakdown(results) : null;
      
      // 9. Generar recomendaciones específicas del dominio
      const domainRecommendations = this.generateDomainRecommendations(
        cognitiveDomain, stats, trends, domainMetadata
      );
      
      const report = {
        reportMetadata: {
          type: 'cognitive_domain_report',
          userId,
          cognitiveDomain,
          generatedAt: new Date().toISOString(),
          generatedBy: currentUser.uid,
          options: safeOptions,
          version: '2.0'
        },
        domainInfo: {
          ...domainMetadata,
          userProgress: progress
        },
        results: results.map(r => this.sanitizeResultForReport(r)),
        statistics: stats,
        trends,
        gameBreakdown,
        recommendations: domainRecommendations
      };
      
      return report;
    } catch (error) {
      this.logSecurityEvent('DOMAIN_REPORT_ERROR', userId, {
        error: error.message,
        cognitiveDomain,
        severity: 'MEDIUM'
      });
      console.error('Error generating cognitive domain report:', error);
      throw error;
    }
  }

  //   Dashboard solo para administradores (SECURIZADO MEJORADO)
  async getDashboardReport(options = {}) {
    try {
      // 1. Validar autenticación y permisos de administrador
      const currentUser = await this.validateAdminAccess('getDashboardReport');
      
      // 2. Validar y sanitizar opciones
      const safeOptions = {
        userIds: options.userIds ? this.validateInput(options.userIds, 'userIds', 'IDs de usuarios') : [],
        dateRange: options.dateRange || null,
        limit: this.validateInput(options.limit || 100, 'limit', 'límite'),
        aggregationType: options.aggregationType || 'overview'
      };
      
      if (safeOptions.dateRange) {
        this.validateInput(safeOptions.dateRange, 'dateRange', 'rango de fechas');
      }
      
      // 3. Log del acceso de admin
      this.logSecurityEvent('ADMIN_DASHBOARD_ACCESS', currentUser.uid, {
        requestedUserIds: safeOptions.userIds.length,
        options: safeOptions,
        severity: 'HIGH'
      });

      // 4. Obtener usuarios activos si no se especifican IDs
      let targetUserIds = safeOptions.userIds;
      if (targetUserIds.length === 0) {
        targetUserIds = await this.getActiveUserIds(safeOptions.limit);
      }
      
      // 5. Generar dashboard con datos anonimizados
      const dashboardData = {
        reportMetadata: {
          type: 'admin_dashboard',
          generatedAt: new Date().toISOString(),
          generatedBy: currentUser.uid,
          options: safeOptions,
          version: '2.0'
        },
        overview: {
          totalUsers: targetUserIds.length,
          totalActiveUsers: 0,
          totalGamesPlayed: 0,
          averageEngagement: 0
        },
        cognitiveDomainsOverview: {},
        performanceMetrics: {
          topPerformingDomains: [],
          improvementTrends: [],
          engagementMetrics: {}
        },
        systemHealth: {
          dataQuality: 'good',
          activeUsers: 0,
          recentActivity: []
        }
      };
      
      // 6. Obtener estadísticas por dominio cognitivo (datos anonimizados)
      const domains = getAllDomains();
      for (const domain of domains) {
        dashboardData.cognitiveDomainsOverview[domain.id] = 
          await this.getDomainOverviewStats(targetUserIds, domain.id, safeOptions.dateRange);
      }
      
      // 7. Calcular métricas de rendimiento agregadas
      dashboardData.performanceMetrics = await this.calculateAggregatedMetrics(
        targetUserIds, safeOptions.dateRange
      );
      
      // 8. Obtener métricas de salud del sistema
      dashboardData.systemHealth = await this.getSystemHealthMetrics(
        targetUserIds, safeOptions.dateRange
      );
      
      return dashboardData;
    } catch (error) {
      this.logSecurityEvent('ADMIN_DASHBOARD_ERROR', 'unknown', {
        error: error.message,
        severity: 'HIGH'
      });
      console.error('Error generating admin dashboard:', error);
      throw error;
    }
  }

  //   Obtener IDs de usuarios activos de forma segura
  async getActiveUserIds(limit) {
    const usersQuery = query(
      this.usersCollection, 
      where('isActive', '==', true),
      firebaseLimit(Math.min(limit, this.maxUsersInDashboard))
    );
    const usersSnapshot = await getDocs(usersQuery);
    return usersSnapshot.docs.map(doc => doc.id);
  }

  //   Calcular estadísticas generales de un usuario (SECURIZADO MEJORADO)
  async calculateUserGeneralStats(userId, dateRange = null) {
    try {
      // Validar entrada
      this.validateInput(userId, 'userId', 'ID de usuario');
      
      // Rate limiting para cálculos
      this.checkRateLimit(userId, 'stats_calculation');

      // Query segura: solo resultados del usuario especificado
      let resultsQuery = query(
        this.resultsCollection,
        where('userId', '==', userId)
      );
      
      // Aplicar filtro de fecha si se proporciona
      if (dateRange && dateRange.start && dateRange.end) {
        resultsQuery = query(
          this.resultsCollection,
          where('userId', '==', userId),
          where('createdAt', '>=', new Date(dateRange.start)),
          where('createdAt', '<=', new Date(dateRange.end))
        );
      }
      
      const resultsSnapshot = await getDocs(resultsQuery);
      const results = resultsSnapshot.docs.map(doc => doc.data());
      
      if (results.length === 0) {
        return {
          totalGamesPlayed: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          favoriteGame: null,
          strongestDomain: null,
          improvementNeeded: null,
          consistencyScore: 0,
          engagementLevel: 'none'
        };
      }
      
      // Calcular estadísticas de forma segura
      const scores = results.map(r => r.score).filter(s => typeof s === 'number');
      const times = results.map(r => r.timeSpent).filter(t => typeof t === 'number' && t > 0);
      
      // Calcular juego favorito (más jugado) con metadatos
      const gameFrequency = results.reduce((acc, result) => {
        const gameName = result.gameMetadata?.displayName || result.gameName || result.gameId;
        acc[gameName] = (acc[gameName] || 0) + 1;
        return acc;
      }, {});
      
      const favoriteGame = Object.keys(gameFrequency).length > 0 ? 
        Object.keys(gameFrequency).reduce((a, b) => 
          gameFrequency[a] > gameFrequency[b] ? a : b
        ) : null;
      
      // Calcular dominio más fuerte (mejor promedio)
      const domainStats = this.calculateDomainAverages(results);
      const strongestDomain = Object.keys(domainStats).length > 0 ? 
        Object.keys(domainStats).reduce((a, b) => 
          domainStats[a].average > domainStats[b].average ? a : b
        ) : null;
      
      // Dominio que necesita mejora (peor promedio)
      const improvementNeeded = Object.keys(domainStats).length > 1 ? 
        Object.keys(domainStats).reduce((a, b) => 
          domainStats[a].average < domainStats[b].average ? a : b
        ) : null;
      
      // Calcular métricas adicionales
      const consistencyScore = this.calculateConsistencyScore(scores);
      const engagementLevel = this.calculateEngagementLevel(results);
      
      return {
        totalGamesPlayed: results.length,
        averageScore: scores.length > 0 ? 
          Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10000) / 10000 : 0,
        totalTimeSpent: times.reduce((a, b) => a + b, 0),
        favoriteGame,
        strongestDomain: strongestDomain ? {
          domain: strongestDomain,
          displayName: getDomainMetadata(strongestDomain)?.name || strongestDomain,
          average: domainStats[strongestDomain].average
        } : null,
        improvementNeeded: improvementNeeded && improvementNeeded !== strongestDomain ? {
          domain: improvementNeeded,
          displayName: getDomainMetadata(improvementNeeded)?.name || improvementNeeded,
          average: domainStats[improvementNeeded].average
        } : null,
        consistencyScore,
        engagementLevel,
        dateRange: dateRange ? `${dateRange.start} - ${dateRange.end}` : 'all_time'
      };
    } catch (error) {
      this.logSecurityEvent('STATS_CALCULATION_ERROR', userId, {
        error: error.message,
        severity: 'LOW'
      });
      console.error('Error calculating user general stats:', error);
      throw error;
    }
  }

  //   Calcular puntuación de consistencia
  calculateConsistencyScore(scores) {
    if (scores.length < 3) return 0;
    
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Consistencia inversa a la desviación estándar (0-1)
    const consistencyScore = Math.max(0, 1 - (stdDev / mean));
    return Math.round(consistencyScore * 100) / 100;
  }

  //   Calcular nivel de engagement
  calculateEngagementLevel(results) {
    if (results.length === 0) return 'none';
    
    const totalGames = results.length;
    const uniqueDomains = new Set(results.map(r => r.cognitiveDomain)).size;
    
    // Calcular engagement basado en cantidad y diversidad
    if (totalGames >= 50 && uniqueDomains >= 5) return 'high';
    if (totalGames >= 20 && uniqueDomains >= 3) return 'medium';
    if (totalGames >= 5) return 'low';
    return 'very_low';
  }

  //   Generar recomendaciones para el usuario
  generateUserRecommendations(progress, generalStats) {
    const recommendations = [];
    
    // Recomendaciones basadas en el dominio más débil
    if (generalStats.improvementNeeded) {
      const domain = generalStats.improvementNeeded;
      // const domainMetadata = getDomainMetadata(domain.domain);
      
      recommendations.push({
        type: 'improvement',
        priority: 'high',
        title: `Mejorar ${domain.displayName}`,
        description: `Tu rendimiento en ${domain.displayName} puede mejorar. Te recomendamos practicar más juegos de este dominio.`,
        suggestedActions: [
          `Dedica 15 minutos diarios a ejercicios de ${domain.displayName}`,
          'Aumenta gradualmente la dificultad',
          'Mantén un registro de tu progreso'
        ],
        targetDomain: domain.domain
      });
    }
    
    // Recomendaciones basadas en consistencia
    if (generalStats.consistencyScore < 0.7) {
      recommendations.push({
        type: 'consistency',
        priority: 'medium',
        title: 'Mejorar Consistencia',
        description: 'Tus resultados varían mucho entre sesiones. La práctica regular puede ayudarte a mantener un rendimiento más estable.',
        suggestedActions: [
          'Establece una rutina de práctica diaria',
          'Asegúrate de estar descansado al jugar',
          'Reduce las distracciones durante las sesiones'
        ]
      });
    }
    
    // Recomendaciones basadas en engagement
    if (generalStats.engagementLevel === 'low' || generalStats.engagementLevel === 'very_low') {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        title: 'Aumentar Participación',
        description: 'Podrías beneficiarte de jugar con mayor frecuencia y explorar diferentes dominios cognitivos.',
        suggestedActions: [
          'Establece metas semanales de juegos',
          'Explora nuevos juegos en diferentes dominios',
          'Participa en desafíos personales'
        ]
      });
    }
    
    return recommendations;
  }

  //   Generar recomendaciones específicas del dominio
  generateDomainRecommendations(cognitiveDomain, stats, trends, domainMetadata) {
    const recommendations = [];
    
    // Recomendación basada en tendencia
    if (trends.trend === 'declining') {
      recommendations.push({
        type: 'performance_decline',
        priority: 'high',
        title: `Recuperar rendimiento en ${domainMetadata.name}`,
        description: `Se detectó una disminución en tu rendimiento en ${domainMetadata.name}. Es importante retomar la práctica regular.`,
        suggestedActions: [
          `Revisa los conceptos básicos de ${domainMetadata.name}`,
          'Reduce la dificultad temporalmente',
          'Practica en sesiones más cortas pero frecuentes'
        ]
      });
    }
    
    // Recomendación basada en puntaje promedio
    if (stats.averageScore < 0.6) {
      recommendations.push({
        type: 'skill_development',
        priority: 'high',
        title: `Desarrollar habilidades en ${domainMetadata.name}`,
        description: `Tu puntaje promedio en ${domainMetadata.name} indica que hay mucho margen de mejora.`,
        suggestedActions: domainMetadata.skills.map(skill => 
          `Enfócate en mejorar: ${skill}`
        )
      });
    }
    
    return recommendations;
  }

  //   Calcular breakdown por juego
  calculateGameBreakdown(results) {
    const gameStats = results.reduce((acc, result) => {
      const gameName = result.gameMetadata?.displayName || result.gameName || result.gameId;
      
      if (!acc[gameName]) {
        acc[gameName] = {
          gamesPlayed: 0,
          scores: [],
          times: [],
          gameId: result.gameId
        };
      }
      
      acc[gameName].gamesPlayed++;
      acc[gameName].scores.push(result.score);
      if (result.timeSpent > 0) {
        acc[gameName].times.push(result.timeSpent);
      }
      
      return acc;
    }, {});
    
    // Calcular estadísticas por juego
    const gameBreakdown = {};
    for (const [gameName, data] of Object.entries(gameStats)) {
      const scores = data.scores;
      const times = data.times;
      
      gameBreakdown[gameName] = {
        gamesPlayed: data.gamesPlayed,
        averageScore: scores.length > 0 ? 
          Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10000) / 10000 : 0,
        bestScore: scores.length > 0 ? Math.max(...scores) : 0,
        averageTime: times.length > 0 ? 
          Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100 : 0,
        gameId: data.gameId
      };
    }
    
    return gameBreakdown;
  }

  //   Calcular tendencias del usuario
  calculateUserTrends(results) {
    if (results.length < 5) {
      return { 
        trend: 'insufficient_data',
        message: 'Se necesitan al menos 5 juegos para calcular tendencias'
      };
    }
    
    // Ordenar por fecha
    const sortedResults = results.sort((a, b) => {
      const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
      const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
      return dateA - dateB;
    });
    
    const scores = sortedResults.map(r => r.score);
    const windowSize = Math.min(5, Math.floor(scores.length / 2));
    
    const firstWindow = scores.slice(0, windowSize);
    const lastWindow = scores.slice(-windowSize);
    
    const firstAvg = firstWindow.reduce((a, b) => a + b, 0) / firstWindow.length;
    const lastAvg = lastWindow.reduce((a, b) => a + b, 0) / lastWindow.length;
    
    const improvement = ((lastAvg - firstAvg) / firstAvg) * 100;
    
    return {
      trend: improvement > 10 ? 'improving' : improvement < -10 ? 'declining' : 'stable',
      improvementPercentage: Math.round(improvement * 100) / 100,
      firstPeriodAverage: Math.round(firstAvg * 10000) / 10000,
      lastPeriodAverage: Math.round(lastAvg * 10000) / 10000,
      dataPoints: scores.length,
      timeSpan: this.calculateTimeSpan(sortedResults[0], sortedResults[sortedResults.length - 1])
    };
  }

  //   Calcular span de tiempo entre resultados
  calculateTimeSpan(firstResult, lastResult) {
    const firstDate = firstResult.createdAt?.seconds ? 
      new Date(firstResult.createdAt.seconds * 1000) : new Date(firstResult.createdAt);
    const lastDate = lastResult.createdAt?.seconds ? 
      new Date(lastResult.createdAt.seconds * 1000) : new Date(lastResult.createdAt);
    
    const diffMs = lastDate - firstDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'menos de 1 día';
    if (diffDays === 1) return '1 día';
    if (diffDays < 30) return `${diffDays} días`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
    return `${Math.floor(diffDays / 365)} años`;
  }

  // Métodos auxiliares existentes mejorados...
  calculateDomainStats(results) {
    if (results.length === 0) return {
      gamesPlayed: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      averageTime: 0,
      totalTime: 0,
      consistency: 0
    };
    
    const scores = results.map(r => r.score).filter(s => typeof s === 'number');
    const times = results.map(r => r.timeSpent).filter(t => typeof t === 'number' && t > 0);
    
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const consistency = this.calculateConsistencyScore(scores);
    
    return {
      gamesPlayed: results.length,
      averageScore: Math.round(averageScore * 10000) / 10000,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      worstScore: scores.length > 0 ? Math.min(...scores) : 0,
      averageTime: times.length > 0 ? 
        Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100 : 0,
      totalTime: times.reduce((a, b) => a + b, 0),
      consistency: consistency
    };
  }

  calculateProgressTrends(results) {
    if (results.length < 2) {
      return { 
        trend: 'insufficient_data',
        message: 'Se necesitan al menos 2 resultados para calcular tendencias'
      };
    }
    
    // Ordenar por fecha (más antiguos primero)
    const sortedResults = results.sort((a, b) => {
      const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
      const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
      return dateA - dateB;
    });
    
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
      firstPeriodAverage: Math.round(firstAvg * 10000) / 10000,
      lastPeriodAverage: Math.round(lastAvg * 10000) / 10000,
      dataPoints: scores.length,
      windowSize: windowSize
    };
  }

  calculateDomainAverages(results) {
    const domainGroups = results.reduce((acc, result) => {
      const domainId = result.cognitiveDomain;
      if (!acc[domainId]) {
        acc[domainId] = [];
      }
      acc[domainId].push(result.score);
      return acc;
    }, {});
    
    const domainAverages = {};
    for (const [domain, scores] of Object.entries(domainGroups)) {
      domainAverages[domain] = {
        average: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10000) / 10000,
        count: scores.length,
        best: Math.max(...scores),
        worst: Math.min(...scores)
      };
    }
    
    return domainAverages;
  }

  // Métodos para dashboard de admin (con datos anonimizados)
  async getDomainOverviewStats(userIds, domain, dateRange) {
    try {
      // Construir query agregada sin exponer datos individuales
      let resultsQuery = query(
        this.resultsCollection,
        where('cognitiveDomain', '==', domain),
        where('userId', 'in', userIds.slice(0, 10)) // Firestore limit
      );
      
      if (dateRange && dateRange.start && dateRange.end) {
        resultsQuery = query(
          this.resultsCollection,
          where('cognitiveDomain', '==', domain),
          where('userId', 'in', userIds.slice(0, 10)),
          where('createdAt', '>=', new Date(dateRange.start)),
          where('createdAt', '<=', new Date(dateRange.end))
        );
      }
      
      const snapshot = await getDocs(resultsQuery);
      const results = snapshot.docs.map(doc => doc.data());
      
      // Calcular estadísticas agregadas sin exponer datos individuales
      const activeUsers = new Set(results.map(r => r.userId)).size;
      const totalGames = results.length;
      const averageScore = results.length > 0 ? 
        results.reduce((sum, r) => sum + r.score, 0) / results.length : 0;
      
      return {
        domain,
        domainName: getDomainMetadata(domain)?.name || domain,
        totalGames,
        averageScore: Math.round(averageScore * 10000) / 10000,
        activeUsers,
        improvementRate: 0 // Calcular basado en tendencias agregadas
      };
    } catch (error) {
      console.error(`Error getting domain overview for ${domain}:`, error);
      return {
        domain,
        domainName: getDomainMetadata(domain)?.name || domain,
        totalGames: 0,
        averageScore: 0,
        activeUsers: 0,
        improvementRate: 0
      };
    }
  }

  async calculateAggregatedMetrics(userIds, dateRange) {
    // Calcular métricas agregadas sin exponer datos individuales
    return {
      topPerformingDomains: [],
      improvementTrends: [],
      engagementMetrics: {
        averageSessionsPerUser: 0,
        averageTimePerSession: 0,
        retentionRate: 0
      }
    };
  }

  async getSystemHealthMetrics(userIds, dateRange) {
    return {
      dataQuality: 'good',
      activeUsers: userIds.length,
      recentActivity: [], // Datos anonimizados
      systemLoad: 'normal'
    };
  }
}

export const reportService = new ReportService();