import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit as firebaseLimit,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { db } from './firebaseConfig';
import { 
  getGameMetadata, 
  getDomainMetadata,
  validateGameExists, 
  validateDomainExists,
  getActiveGames,
  getGamesByDomain
} from '../gameConfig/GAME_METADATA';

export class GameService {
  constructor() {
    this.resultsCollection = collection(db, 'gameResults');
    this.progressCollection = collection(db, 'userProgress');
    this.usersCollection = collection(db, 'users');
    
    // Para detectar patrones sospechosos
    this.suspiciousActivityTracker = new Map();
    this.requestTracker = new Map();
  }

  //   Obtener usuario autenticado actual
  getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          reject(new Error('Usuario no autenticado. Debes iniciar sesión para jugar.'));
        }
      });
    });
  }

  //   Rate limiting para prevenir spam
  checkRateLimit(userId) {
    const now = Date.now();
    const userRequests = this.requestTracker.get(userId) || [];
    
    // Filtrar requests de los últimos 5 minutos
    const recentRequests = userRequests.filter(timestamp => 
      now - timestamp < 300000 // 5 minutos
    );
    
    if (recentRequests.length > 20) { // Max 20 juegos cada 5 minutos
      throw new Error('Demasiados juegos completados muy rápido. Toma un descanso de 5 minutos.');
    }
    
    recentRequests.push(now);
    this.requestTracker.set(userId, recentRequests);
  }

  //   Detectar actividad sospechosa (ACTUALIZADA con metadatos)
  detectSuspiciousActivity(userId, gameData) {
    const gameMetadata = getGameMetadata(gameData.gameId);
    if (!gameMetadata) {
      throw new Error(`Metadatos del juego ${gameData.gameId} no encontrados`);
    }

    const userActivity = this.suspiciousActivityTracker.get(userId) || {
      perfectScores: 0,
      veryFastGames: 0,
      lastGameTime: null,
      gamesPerDomain: {}
    };

    let suspicious = false;
    const suspiciousReasons = [];

    // Detectar puntajes perfectos consecutivos
    if (gameData.score >= 0.95) {
      userActivity.perfectScores++;
      if (userActivity.perfectScores > 5) {
        suspicious = true;
        suspiciousReasons.push(
          `Demasiados puntajes perfectos consecutivos en ${gameMetadata.displayName}`
        );
      }
    } else {
      userActivity.perfectScores = 0; // Reset si no es perfecto
    }

    // Detectar juegos muy rápidos según dificultad y metadatos
    const difficulty = gameData.difficulty || 'medium';
    const difficultyConfig = gameMetadata.difficulty[difficulty];
    
    if (!difficultyConfig) {
      throw new Error(`Configuración de dificultad ${difficulty} no encontrada para ${gameMetadata.displayName}`);
    }

    if (gameData.timeSpent < difficultyConfig.minTime * 0.7) { // 30% menos del tiempo mínimo
      userActivity.veryFastGames++;
      if (userActivity.veryFastGames > 3) {
        suspicious = true;
        suspiciousReasons.push(
          `${gameMetadata.displayName} completado demasiado rápido para dificultad ${difficulty} (${gameData.timeSpent/1000}s vs mínimo ${difficultyConfig.minTime/1000}s)`
        );
      }
    } else {
      userActivity.veryFastGames = 0;
    }

    // Detectar spam de un dominio específico
    const domain = gameMetadata.cognitiveDomain;
    userActivity.gamesPerDomain[domain] = (userActivity.gamesPerDomain[domain] || 0) + 1;
    
    if (userActivity.gamesPerDomain[domain] > 10) { // Más de 10 juegos del mismo dominio seguidos
      const domainMetadata = getDomainMetadata(domain);
      suspicious = true;
      suspiciousReasons.push(
        `Demasiados juegos consecutivos del dominio ${domainMetadata.name} (${userActivity.gamesPerDomain[domain]})`
      );
    }

    // Detectar tiempo entre juegos sospechosamente bajo
    if (userActivity.lastGameTime && 
        (Date.now() - userActivity.lastGameTime) < 2000) { // Menos de 2 segundos
      suspicious = true;
      suspiciousReasons.push(
        `Tiempo entre juegos demasiado corto (${Date.now() - userActivity.lastGameTime}ms)`
      );
    }

    userActivity.lastGameTime = Date.now();
    
    // Reset contadores de dominio si no hay actividad sospechosa
    if (!suspicious) {
      // Reset gradual para permitir juego normal
      for (const [domainId, count] of Object.entries(userActivity.gamesPerDomain)) {
        if (count > 0) {
          userActivity.gamesPerDomain[domainId] = Math.max(0, count - 1);
        }
      }
    }
    
    this.suspiciousActivityTracker.set(userId, userActivity);

    if (suspicious) {
      this.logSecurityEvent('SUSPICIOUS_GAMING_PATTERN', userId, {
        reasons: suspiciousReasons,
        gameData: {
          gameId: gameData.gameId,
          gameName: gameMetadata.displayName,
          domain: gameMetadata.domainDisplayName,
          score: gameData.score,
          timeSpent: gameData.timeSpent,
          difficulty: difficulty
        },
        userActivity
      });
      
      throw new Error(
        `Patrón de juego sospechoso detectado en ${gameMetadata.displayName}. ` +
        `Razones: ${suspiciousReasons.join(', ')}. Tu cuenta será revisada.`
      );
    }
  }

  //   Inicializar configuración de juegos
  async initializeGames() {
    try {
      console.log('Inicializando configuración de juegos...');
      
      // Verificar que los metadatos estén cargados
      const availableGames = this.getAvailableGames();
      
      if (availableGames.length === 0) {
        throw new Error('No se encontraron juegos disponibles');
      }
      
      console.log(`✅ ${availableGames.length} juegos disponibles:`, 
        availableGames.map(game => game.displayName).join(', ')
      );
      
      // CORREGIR: Usar los nombres exactos de dominios del GAME_METADATA.js
      const domains = [
        'lenguaje',
        'razonamiento_abstracto', // ← Era 'razonamiento'
        'memoria', 
        'atencion', 
        'funciones_ejecutivas',
        'memoria_trabajo'
      ];
      const validDomains = [];
      const invalidDomains = [];
      
      for (const domain of domains) {
        try {
          if (validateDomainExists(domain)) {
            validDomains.push(domain);
          } else {
            invalidDomains.push(domain);
          }
        } catch (error) {
          console.warn(`⚠️ Error validando dominio ${domain}:`, error.message);
          invalidDomains.push(domain);
        }
      }
      
      console.log(`✅ Dominios válidos (${validDomains.length}):`, validDomains);
      
      if (invalidDomains.length > 0) {
        console.warn(`⚠️ Dominios no configurados (${invalidDomains.length}):`, invalidDomains);
      }
      
      // Verificar que al menos hay algunos dominios válidos
      if (validDomains.length === 0) {
        throw new Error('No se encontraron dominios cognitivos válidos configurados');
      }
      
      console.log('✅ Configuración de juegos validada correctamente');
      
      // Log de inicialización exitosa
      this.logSecurityEvent('GAMES_INITIALIZED', 'system', {
        gamesCount: availableGames.length,
        validDomainsCount: validDomains.length,
        invalidDomainsCount: invalidDomains.length,
        invalidDomains: invalidDomains,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Juegos inicializados correctamente',
        gamesCount: availableGames.length,
        validDomains: validDomains,
        warnings: invalidDomains.length > 0 ? `Dominios no configurados: ${invalidDomains.join(', ')}` : null,
        availableGames: availableGames.map(g => g.displayName)
      };
      
    } catch (error) {
      console.error('❌ Error inicializando juegos:', error);
      
      this.logSecurityEvent('GAMES_INITIALIZATION_ERROR', 'system', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  //   Validar estructura y contenido de datos del juego (ACTUALIZADA con metadatos)
  validateGameData(gameData) {
    // Validar campos requeridos
    const requiredFields = ['userId', 'gameId', 'score', 'timeSpent', 'cognitiveDomain'];
    
    for (const field of requiredFields) {
      if (gameData[field] === undefined || gameData[field] === null) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    // Validar que el juego existe y está activo
    if (!validateGameExists(gameData.gameId)) {
      throw new Error(`Juego no válido o inactivo: ${gameData.gameId}`);
    }

    // Validar que el dominio existe
    if (!validateDomainExists(gameData.cognitiveDomain)) {
      throw new Error(`Dominio cognitivo no válido: ${gameData.cognitiveDomain}`);
    }

    // Obtener metadatos del juego
    const gameMetadata = getGameMetadata(gameData.gameId);
    const domainMetadata = getDomainMetadata(gameData.cognitiveDomain);
    
    // Validar que el dominio cognitivo coincide con el del juego
    if (gameData.cognitiveDomain !== gameMetadata.cognitiveDomain) {
      throw new Error(
        `Dominio cognitivo incorrecto para ${gameMetadata.displayName}. ` +
        `Esperado: ${gameMetadata.domainDisplayName}, ` +
        `Recibido: ${domainMetadata.name}`
      );
    }

    // Validar tipos de datos
    if (typeof gameData.userId !== 'string' || gameData.userId.length < 10) {
      throw new Error('ID de usuario inválido');
    }

    if (typeof gameData.score !== 'number' || isNaN(gameData.score)) {
      throw new Error('Puntaje debe ser un número');
    }

    if (typeof gameData.timeSpent !== 'number' || isNaN(gameData.timeSpent)) {
      throw new Error('Tiempo debe ser un número');
    }

    // Validar dificultad y obtener límites correspondientes
    const difficulty = gameData.difficulty || 'medium';
    const difficultyConfig = gameMetadata.difficulty[difficulty];
    
    if (!difficultyConfig) {
      throw new Error(
        `Dificultad no válida para ${gameMetadata.displayName}: ${difficulty}. ` +
        `Dificultades disponibles: ${Object.keys(gameMetadata.difficulty).join(', ')}`
      );
    }

    // Validar rangos según configuración del juego y dificultad
    const { minScore, maxScore } = gameMetadata.scoring;
    if (gameData.score < minScore || gameData.score > maxScore) {
      throw new Error(
        `Puntaje fuera de rango válido para ${gameMetadata.displayName} ` +
        `(${minScore}-${maxScore}): ${gameData.score}`
      );
    }

    const { minTime, maxTime } = difficultyConfig;
    if (gameData.timeSpent < minTime || gameData.timeSpent > maxTime) {
      throw new Error(
        `Tiempo de juego fuera de rango válido para ${gameMetadata.displayName} ` +
        `en dificultad ${difficulty} (${minTime/1000}-${maxTime/1000}s): ${gameData.timeSpent/1000}s`
      );
    }

    // Validaciones específicas por tipo de scoring
    if (gameMetadata.scoring.type === 'percentage' && (gameData.score < 0 || gameData.score > 1)) {
      throw new Error(`Para juegos de tipo porcentaje, el puntaje debe estar entre 0 y 1`);
    }
  }

  //   Sanitizar datos antes de guardar (ACTUALIZADA con metadatos completos)
  sanitizeGameData(gameData) {
    const gameMetadata = getGameMetadata(gameData.gameId);
    const domainMetadata = getDomainMetadata(gameData.cognitiveDomain);
    const { precision } = gameMetadata.scoring;
    const difficulty = gameData.difficulty || 'medium';
    
    return {
      // Datos básicos del resultado
      userId: gameData.userId.trim(),
      gameId: gameData.gameId.trim().toLowerCase(),
      cognitiveDomain: gameData.cognitiveDomain.trim().toLowerCase(),
      score: this.roundToPrecision(parseFloat(gameData.score), precision),
      timeSpent: Math.round(parseInt(gameData.timeSpent)),
      difficulty: difficulty.trim().toLowerCase(),
      
      // Metadatos del juego (para consultas y reportes)
      gameMetadata: {
        name: gameMetadata.name,
        displayName: gameMetadata.displayName,
        description: gameMetadata.description,
        version: gameMetadata.version,
        category: gameMetadata.category,
        tags: gameMetadata.tags
      },
      
      // Metadatos del dominio cognitivo
      domainMetadata: {
        name: domainMetadata.name,
        description: domainMetadata.description,
        color: domainMetadata.color,
        icon: domainMetadata.icon,
        skills: domainMetadata.skills
      },
      
      // Configuración de scoring y dificultad
      scoringConfig: {
        type: gameMetadata.scoring.type,
        minScore: gameMetadata.scoring.minScore,
        maxScore: gameMetadata.scoring.maxScore,
        precision: gameMetadata.scoring.precision
      },
      
      difficultyConfig: gameMetadata.difficulty[difficulty],
      
      // Campos opcionales sanitizados
      details: gameData.details ? this.sanitizeGameDetails(gameData.details) : {},
      
      // Metadatos de seguridad y auditoría
      metadata: {
        serviceVersion: '2.0',
        platform: typeof navigator !== 'undefined' ? 'web' : 'unknown',
        validatedAt: new Date().toISOString(),
        gameConfigVersion: '1.0'
      }
    };
  }

  // Helper para redondear con precisión específica
  roundToPrecision(number, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  //   Sanitizar detalles específicos del juego
  sanitizeGameDetails(details) {
    const sanitized = {};
    
    // Solo permitir campos específicos y seguros
    const allowedFields = [
      'correctAnswers', 
      'incorrectAnswers', 
      'totalQuestions',
      'averageResponseTime',
      'gameMode',
      'attempts',
      'hints',
      'sequence',
      'pattern'
    ];
    
    for (const field of allowedFields) {
      if (details[field] !== undefined) {
        if (typeof details[field] === 'number') {
          sanitized[field] = Math.round(details[field] * 100) / 100; // 2 decimales
        } else if (typeof details[field] === 'string') {
          sanitized[field] = details[field].substring(0, 100).trim();
        } else if (Array.isArray(details[field])) {
          // Para arrays, limitar tamaño y sanitizar elementos
          sanitized[field] = details[field].slice(0, 50).map(item => 
            typeof item === 'string' ? item.substring(0, 50) : item
          );
        }
      }
    }
    
    return sanitized;
  }

  //   Logging de eventos de seguridad
  logSecurityEvent(event, userId, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId,
      service: 'GameService',
      ...details
    };
    
    console.warn('  Game Security Event:', logEntry);
    
    // En producción, enviar a servicio de logging
    // this.sendToSecurityLog(logEntry);
  }

  //   MÉTODO PRINCIPAL: Guardar resultado de juego (SECURIZADO CON METADATOS)
  async saveGameResult(gameData) {
    try {
      // 1. Verificar autenticación
      const currentUser = await this.getCurrentUser();
      
      // 2. Validar que el resultado pertenece al usuario autenticado
      if (gameData.userId !== currentUser.uid) {
        this.logSecurityEvent('UNAUTHORIZED_GAME_SAVE', currentUser.uid, {
          attemptedUserId: gameData.userId,
          gameId: gameData.gameId
        });
        throw new Error('No puedes guardar resultados de otro usuario');
      }

      // 3. Rate limiting
      this.checkRateLimit(currentUser.uid);

      // 4. Validar estructura y contenido
      this.validateGameData(gameData);

      // 5. Detectar actividad sospechosa
      this.detectSuspiciousActivity(currentUser.uid, gameData);

      // 6. Sanitizar datos con metadatos completos
      const sanitizedData = this.sanitizeGameData(gameData);

      // 7. Agregar metadatos del servidor
      sanitizedData.createdAt = serverTimestamp();
      sanitizedData.serverTimestamp = new Date().toISOString();

      // 8. Log del evento exitoso con metadatos
      this.logSecurityEvent('GAME_RESULT_SAVED', currentUser.uid, {
        gameId: sanitizedData.gameId,
        gameName: sanitizedData.gameMetadata.displayName,
        domain: sanitizedData.domainMetadata.name,
        score: sanitizedData.score,
        difficulty: sanitizedData.difficulty,
        timeSpent: sanitizedData.timeSpent
      });

      // 9. Guardar en Firestore
      const docRef = await addDoc(this.resultsCollection, sanitizedData);

      // 10. Actualizar progreso del usuario
      await this.updateUserProgress(currentUser.uid, sanitizedData);

      return {
        success: true,
        resultId: docRef.id,
        message: `Resultado de ${sanitizedData.gameMetadata.displayName} guardado exitosamente`,
        gameInfo: {
          name: sanitizedData.gameMetadata.displayName,
          domain: sanitizedData.domainMetadata.name,
          score: sanitizedData.score,
          difficulty: sanitizedData.difficulty
        }
      };

    } catch (error) {
      const gameMetadata = getGameMetadata(gameData.gameId);
      this.logSecurityEvent('GAME_SAVE_ERROR', gameData.userId || 'unknown', {
        error: error.message,
        gameId: gameData.gameId,
        gameName: gameMetadata ? gameMetadata.displayName : 'Unknown'
      });
      
      console.error('Error saving game result:', error);
      throw error;
    }
  }

  //   Actualizar progreso del usuario de forma segura (CON METADATOS)
  async updateUserProgress(userId, gameData) {
    try {
      const progressId = `${userId}_${gameData.cognitiveDomain}`;
      const progressRef = doc(this.progressCollection, progressId);
      
      // Verificar si existe progreso previo
      const progressSnap = await getDoc(progressRef);
      
      const progressUpdate = {
        userId: userId,
        cognitiveDomain: gameData.cognitiveDomain,
        domainName: gameData.domainMetadata.name,
        domainColor: gameData.domainMetadata.color,
        domainIcon: gameData.domainMetadata.icon,
        lastScore: gameData.score,
        lastGameId: gameData.gameId,
        lastGameName: gameData.gameMetadata.displayName,
        lastPlayedAt: serverTimestamp(),
        lastDifficulty: gameData.difficulty,
        updatedAt: serverTimestamp()
      };
      
      if (progressSnap.exists()) {
        // Actualizar progreso existente
        await updateDoc(progressRef, {
          ...progressUpdate,
          totalGames: increment(1),
          totalTimeSpent: increment(gameData.timeSpent)
        });
      } else {
        // Crear nuevo progreso
        await addDoc(this.progressCollection, {
          ...progressUpdate,
          totalGames: 1,
          totalTimeSpent: gameData.timeSpent,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating user progress:', error);
      // No lanzar error aquí para no afectar el guardado del resultado principal
    }
  }

  //   Obtener resultados del usuario autenticado (CON METADATOS)
  async getUserGameResults(userId, gameId = null, limit = 50) {
    try {
      // 1. Verificar autenticación
      const currentUser = await this.getCurrentUser();
      
      // 2. Validar autorización
      if (currentUser.uid !== userId) {
        this.logSecurityEvent('UNAUTHORIZED_RESULTS_ACCESS', currentUser.uid, {
          requestedUserId: userId
        });
        throw new Error('Solo puedes acceder a tus propios resultados');
      }

      // 3. Rate limiting
      this.checkRateLimit(currentUser.uid);

      // 4. Construir query segura
      let resultsQuery = query(
        this.resultsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        firebaseLimit(Math.min(limit, 100)) // Max 100 resultados
      );

      // Filtrar por juego específico si se solicita
      if (gameId) {
        if (!validateGameExists(gameId)) {
          throw new Error(`Juego no válido: ${gameId}`);
        }
        resultsQuery = query(
          this.resultsCollection,
          where('userId', '==', userId),
          where('gameId', '==', gameId),
          orderBy('createdAt', 'desc'),
          firebaseLimit(Math.min(limit, 100))
        );
      }

      const snapshot = await getDocs(resultsQuery);
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Asegurar que los metadatos estén presentes para resultados antiguos
          gameDisplayName: data.gameMetadata?.displayName || data.gameName || data.gameId,
          domainDisplayName: data.domainMetadata?.name || data.cognitiveDomain
        };
      });

      // 5. Log del acceso
      this.logSecurityEvent('RESULTS_ACCESSED', currentUser.uid, {
        gameId: gameId || 'all',
        resultsCount: results.length
      });

      return results;

    } catch (error) {
      this.logSecurityEvent('RESULTS_ACCESS_ERROR', userId, {
        error: error.message,
        gameId: gameId || 'all'
      });
      
      console.error('Error getting user game results:', error);
      throw error;
    }
  }

  //   Obtener estadísticas seguras del usuario (CON METADATOS)
  async getUserGameStats(userId) {
    try {
      // 1. Verificar autenticación y autorización
      const currentUser = await this.getCurrentUser();
      if (currentUser.uid !== userId) {
        throw new Error('Solo puedes acceder a tus propias estadísticas');
      }

      // 2. Obtener resultados del usuario
      const results = await this.getUserGameResults(userId);
      
      if (results.length === 0) {
        return {
          totalGames: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          favoriteGame: null,
          strongestDomain: null,
          gamesPerDomain: {},
          gamesPerCategory: {},
          difficultyDistribution: {}
        };
      }

      // 3. Calcular estadísticas con metadatos
      const stats = {
        totalGames: results.length,
        averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
        totalTimeSpent: results.reduce((sum, r) => sum + r.timeSpent, 0),
        favoriteGame: this.calculateFavoriteGame(results),
        strongestDomain: this.calculateStrongestDomain(results),
        gamesPerDomain: this.calculateGamesPerDomain(results),
        gamesPerCategory: this.calculateGamesPerCategory(results),
        difficultyDistribution: this.calculateDifficultyDistribution(results),
        recentActivity: this.calculateRecentActivity(results)
      };

      return stats;

    } catch (error) {
      console.error('Error getting user game stats:', error);
      throw error;
    }
  }

  // Métodos auxiliares para estadísticas (ACTUALIZADOS CON METADATOS)
  calculateFavoriteGame(results) {
    const gameFrequency = results.reduce((acc, result) => {
      const displayName = result.gameMetadata?.displayName || result.gameId;
      acc[displayName] = (acc[displayName] || 0) + 1;
      return acc;
    }, {});
    
    const favoriteGameName = Object.keys(gameFrequency).reduce((a, b) => 
      gameFrequency[a] > gameFrequency[b] ? a : b
    );

    return {
      name: favoriteGameName,
      count: gameFrequency[favoriteGameName]
    };
  }

  calculateStrongestDomain(results) {
    const domainStats = results.reduce((acc, result) => {
      const domainName = result.domainMetadata?.name || result.cognitiveDomain;
      if (!acc[domainName]) {
        acc[domainName] = { 
          scores: [], 
          count: 0,
          color: result.domainMetadata?.color || '#gray',
          icon: result.domainMetadata?.icon || '📊'
        };
      }
      acc[domainName].scores.push(result.score);
      acc[domainName].count++;
      return acc;
    }, {});

    let strongestDomain = null;
    let highestAverage = 0;

    for (const [domain, data] of Object.entries(domainStats)) {
      const average = data.scores.reduce((sum, score) => sum + score, 0) / data.count;
      if (average > highestAverage) {
        highestAverage = average;
        strongestDomain = {
          name: domain,
          average: Math.round(average * 10000) / 10000,
          gamesPlayed: data.count,
          color: data.color,
          icon: data.icon
        };
      }
    }

    return strongestDomain;
  }

  calculateGamesPerDomain(results) {
    return results.reduce((acc, result) => {
      const domainName = result.domainMetadata?.name || result.cognitiveDomain;
      acc[domainName] = (acc[domainName] || 0) + 1;
      return acc;
    }, {});
  }

  calculateGamesPerCategory(results) {
    return results.reduce((acc, result) => {
      const category = result.gameMetadata?.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  }

  calculateDifficultyDistribution(results) {
    return results.reduce((acc, result) => {
      const difficulty = result.difficulty || 'medium';
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {});
  }

  calculateRecentActivity(results) {
    const recent = results.slice(0, 10); // Últimos 10 juegos
    return recent.map(result => ({
      gameDisplayName: result.gameMetadata?.displayName || result.gameId,
      domainDisplayName: result.domainMetadata?.name || result.cognitiveDomain,
      score: result.score,
      difficulty: result.difficulty,
      timeSpent: result.timeSpent,
      createdAt: result.createdAt,
      color: result.domainMetadata?.color || '#gray'
    }));
  }

  //   Obtener información de juegos disponibles
  getAvailableGames() {
    return getActiveGames().map(game => ({
      id: game.id,
      name: game.name,
      displayName: game.displayName,
      description: game.description,
      cognitiveDomain: game.cognitiveDomain,
      domainDisplayName: getDomainMetadata(game.cognitiveDomain).name,
      category: game.category,
      difficulties: Object.keys(game.difficulty),
      tags: game.tags,
      color: getDomainMetadata(game.cognitiveDomain).color,
      icon: getDomainMetadata(game.cognitiveDomain).icon
    }));
  }

  //   Obtener juegos por dominio
  getGamesByDomain(domainId) {
    if (!validateDomainExists(domainId)) {
      throw new Error(`Dominio no válido: ${domainId}`);
    }

    return getGamesByDomain(domainId).map(game => ({
      id: game.id,
      name: game.name,
      displayName: game.displayName,
      description: game.description,
      category: game.category,
      difficulties: Object.keys(game.difficulty),
      tags: game.tags
    }));
  }

  //   Validar si un juego existe y está disponible
  validateGameAccess(gameId) {
    if (!validateGameExists(gameId)) {
      throw new Error(`Juego no encontrado o inactivo: ${gameId}`);
    }
    
    const gameMetadata = getGameMetadata(gameId);
    return {
      valid: true,
      gameInfo: {
        name: gameMetadata.displayName,
        domain: getDomainMetadata(gameMetadata.cognitiveDomain).name,
        difficulties: Object.keys(gameMetadata.difficulty)
      }
    };
  }
}

export const gameService = new GameService();