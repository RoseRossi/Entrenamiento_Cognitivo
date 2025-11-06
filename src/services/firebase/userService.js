import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from './firebaseConfig';
import {
  getDomainMetadata,
  validateDomainExists,
  getAllDomains
} from '../gameConfig/GAME_METADATA';

export class UserService {
  constructor() {
    this.usersCollection = collection(db, 'users');
    this.progressCollection = collection(db, 'userProgress');

    // Para rate limiting y tracking de seguridad
    this.requestTracker = new Map();
    this.profileUpdateTracker = new Map();
  }

  //   Obtener usuario autenticado actual
  getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          reject(new Error('Usuario no autenticado. Debes iniciar sesión.'));
        }
      });
    });
  }

  //   Validar que el usuario solo acceda a sus propios datos
  async validateUserAccess(requestedUserId, operation = 'read') {
    const currentUser = await this.getCurrentUser();

    if (currentUser.uid !== requestedUserId) {
      this.logSecurityEvent('UNAUTHORIZED_USER_ACCESS', currentUser.uid, {
        requestedUserId,
        operation
      });
      throw new Error('Acceso denegado: Solo puedes acceder a tus propios datos de usuario.');
    }

    return currentUser;
  }

  //   Verificar permisos de administrador
  async validateAdminAccess(operation = 'admin_read') {
    const currentUser = await this.getCurrentUser();

    // Verificar permisos de administrador
    const userRef = doc(this.usersCollection, currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || !userSnap.data().isAdmin) {
      this.logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', currentUser.uid, {
        operation
      });
      throw new Error('Acceso denegado: Solo los administradores pueden realizar esta operación.');
    }

    return currentUser;
  }

  //   Rate limiting para operaciones de usuario
  checkRateLimit(userId, operation = 'general') {
    const now = Date.now();
    const key = `${userId}_${operation}`;
    const userRequests = this.requestTracker.get(key) || [];

    // Configurar límites según operación
    const limits = {
      general: { window: 300000, max: 50 }, // 50 requests en 5 minutos
      profile_update: { window: 3600000, max: 10 }, // 10 updates por hora
      progress_read: { window: 60000, max: 30 } // 30 lecturas por minuto
    };

    const limit = limits[operation] || limits.general;

    // Filtrar requests dentro de la ventana de tiempo
    const recentRequests = userRequests.filter(timestamp =>
      now - timestamp < limit.window
    );

    if (recentRequests.length >= limit.max) {
      throw new Error(
        `Límite de ${operation} excedido. ` +
        `Máximo ${limit.max} operaciones cada ${limit.window / 1000} segundos.`
      );
    }

    recentRequests.push(now);
    this.requestTracker.set(key, recentRequests);
  }

  //   Validar y sanitizar datos de usuario
  validateAndSanitizeUserData(userData, isCreation = false) {
    const sanitized = {};

    // Campos permitidos para creación
    const allowedFieldsCreation = [
      'displayName', 'email', 'age', 'gender', 'education',
      'profession', 'preferences', 'avatar', 'language'
    ];

    // Campos permitidos para actualización (sin email)
    const allowedFieldsUpdate = [
      'displayName', 'age', 'gender', 'education',
      'profession', 'preferences', 'avatar', 'language'
    ];

    const allowedFields = isCreation ? allowedFieldsCreation : allowedFieldsUpdate;

    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        switch (field) {
          case 'displayName':
            if (typeof userData[field] === 'string' && userData[field].trim().length > 0) {
              sanitized[field] = userData[field].trim().substring(0, 50);
              // Validar caracteres permitidos
              if (!/^[a-zA-Z0-9\s\u00C0-\u017F\u0100-\u024F]+$/.test(sanitized[field])) {
                throw new Error('Nombre de usuario contiene caracteres no permitidos');
              }
            }
            break;

          case 'email':
            if (isCreation && typeof userData[field] === 'string') {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(userData[field])) {
                throw new Error('Email inválido');
              }
              sanitized[field] = userData[field].toLowerCase().trim();
            }
            break;

          case 'age':
            const age = parseInt(userData[field]);
            if (age >= 13 && age <= 120) {
              sanitized[field] = age;
            } else {
              throw new Error('Edad debe estar entre 13 y 120 años');
            }
            break;

          case 'gender':
            const validGenders = ['masculino', 'femenino', 'otro', 'prefiero_no_decir'];
            if (validGenders.includes(userData[field])) {
              sanitized[field] = userData[field];
            }
            break;

          case 'education':
            const validEducation = [
              'primaria', 'secundaria', 'bachillerato', 'tecnico',
              'universitario', 'postgrado', 'otro'
            ];
            if (validEducation.includes(userData[field])) {
              sanitized[field] = userData[field];
            }
            break;

          case 'profession':
            if (typeof userData[field] === 'string') {
              sanitized[field] = userData[field].trim().substring(0, 100);
            }
            break;

          case 'language':
            const validLanguages = ['es', 'en', 'fr', 'pt'];
            if (validLanguages.includes(userData[field])) {
              sanitized[field] = userData[field];
            } else {
              sanitized[field] = 'es'; // Default
            }
            break;

          case 'preferences':
            if (typeof userData[field] === 'object' && userData[field] !== null) {
              sanitized[field] = this.sanitizePreferences(userData[field]);
            }
            break;

          case 'avatar':
            if (typeof userData[field] === 'string') {
              // Validar que sea una URL segura o un ID de avatar predefinido
              const avatarRegex = /^(avatar_[1-9]|https:\/\/secure-avatars\.com\/[a-zA-Z0-9]+)$/;
              if (avatarRegex.test(userData[field])) {
                sanitized[field] = userData[field];
              }
            }
            break;

          default:
            // Ignorar campos no reconocidos por seguridad
            console.warn(`Campo no reconocido ignorado: ${field}`);
            break;
        }
      }
    }

    return sanitized;
  }

  //   Sanitizar preferencias de usuario
  sanitizePreferences(preferences) {
    const sanitized = {};
    const allowedPrefs = [
      'notifications', 'theme', 'difficulty', 'sound',
      'autoSave', 'language', 'timezone'
    ];

    for (const pref of allowedPrefs) {
      if (preferences[pref] !== undefined) {
        switch (pref) {
          case 'notifications':
          case 'sound':
          case 'autoSave':
            sanitized[pref] = Boolean(preferences[pref]);
            break;
          case 'theme':
            const validThemes = ['light', 'dark', 'auto'];
            if (validThemes.includes(preferences[pref])) {
              sanitized[pref] = preferences[pref];
            }
            break;
          case 'difficulty':
            const validDifficulties = ['easy', 'medium', 'hard'];
            if (validDifficulties.includes(preferences[pref])) {
              sanitized[pref] = preferences[pref];
            }
            break;
          case 'language':
            const validLangs = ['es', 'en', 'fr', 'pt'];
            if (validLangs.includes(preferences[pref])) {
              sanitized[pref] = preferences[pref];
            }
            break;
          case 'timezone':
            if (typeof preferences[pref] === 'string' && preferences[pref].length < 50) {
              sanitized[pref] = preferences[pref];
            }
            break;
          default:
            // Ignorar preferencias no reconocidas por seguridad
            console.warn(`Preferencia no reconocida ignorada: ${pref}`);
            break;
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
      service: 'UserService',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
      ...details
    };

    // Logging disabled for cleaner output
    // console.warn('  User Security Event:', logEntry);

    // En producción, enviar a servicio de logging externo
    // this.sendToSecurityLog(logEntry);
  }

  //   CREAR USUARIO (SECURIZADO)
  async createUser(userData) {
    try {
      // 1. Verificar autenticación
      const currentUser = await this.getCurrentUser();

      // 2. Validar que está creando su propio perfil
      if (userData.id !== currentUser.uid) {
        this.logSecurityEvent('UNAUTHORIZED_USER_CREATION', currentUser.uid, {
          attemptedUserId: userData.id
        });
        throw new Error('Solo puedes crear tu propio perfil de usuario');
      }

      // 3. Rate limiting
      this.checkRateLimit(currentUser.uid, 'profile_update');

      // 4. Validar y sanitizar datos
      const sanitizedData = this.validateAndSanitizeUserData(userData, true);

      // 5. Verificar que el usuario no existe ya
      const existingUserRef = doc(this.usersCollection, userData.id);
      const existingUserSnap = await getDoc(existingUserRef);

      if (existingUserSnap.exists()) {
        throw new Error('El usuario ya existe. Usa updateUser para actualizar datos.');
      }

      // 6. Crear usuario con metadatos de seguridad
      const user = {
        ...sanitizedData,
        id: userData.id,
        email: sanitizedData.email || currentUser.email,
        emailVerified: currentUser.emailVerified || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        isAdmin: false, // Siempre false para usuarios nuevos

        // Metadatos de seguridad
        metadata: {
          createdByIP: null, // No guardar IP por privacidad
          serviceVersion: '2.0',
          platform: typeof navigator !== 'undefined' ? 'web' : 'unknown'
        }
      };

      // 7. Guardar en Firestore
      await setDoc(existingUserRef, user);

      // 8. Inicializar progreso para todos los dominios cognitivos
      await this.initializeUserProgress(userData.id);

      // 9. Log del evento exitoso
      this.logSecurityEvent('USER_CREATED', currentUser.uid, {
        displayName: sanitizedData.displayName || 'No name'
      });

      return user;
    } catch (error) {
      this.logSecurityEvent('USER_CREATION_ERROR', userData.id || 'unknown', {
        error: error.message
      });
      console.error('Error creating user:', error);
      throw error;
    }
  }

  //   OBTENER USUARIO (SECURIZADO)
  async getUser(userId) {
    try {
      // 1. Verificar autenticación y autorización
      await this.validateUserAccess(userId, 'getUser');

      // 2. Rate limiting
      this.checkRateLimit(userId, 'general');

      // 3. Obtener usuario
      const userRef = doc(this.usersCollection, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const userData = { id: userSnap.id, ...userSnap.data() };

      // 4. Filtrar datos sensibles para el response
      const filteredData = this.filterSensitiveUserData(userData);

      // 5. Log del acceso
      this.logSecurityEvent('USER_DATA_ACCESSED', userId, {
        operation: 'getUser'
      });

      return filteredData;
    } catch (error) {
      this.logSecurityEvent('USER_ACCESS_ERROR', userId, {
        error: error.message,
        operation: 'getUser'
      });
      console.error('Error getting user:', error);
      throw error;
    }
  }

  //   Filtrar datos sensibles del usuario
  filterSensitiveUserData(userData) {
    const {
      metadata, // Remover metadatos internos
      isAdmin, // No exponer permisos de admin
      ...filteredData
    } = userData;

    return filteredData;
  }

  //   ACTUALIZAR USUARIO (SECURIZADO)
  async updateUser(userId, updateData) {
    try {
      // 1. Verificar autenticación y autorización
      await this.validateUserAccess(userId, 'updateUser');

      // 2. Rate limiting específico para updates
      this.checkRateLimit(userId, 'profile_update');

      // 3. Validar que no está intentando modificar campos protegidos
      const protectedFields = ['id', 'email', 'emailVerified', 'createdAt', 'isAdmin', 'metadata'];
      for (const field of protectedFields) {
        if (updateData.hasOwnProperty(field)) {
          this.logSecurityEvent('ATTEMPT_MODIFY_PROTECTED_FIELD', userId, {
            field,
            operation: 'updateUser'
          });
          throw new Error(`No puedes modificar el campo protegido: ${field}`);
        }
      }

      // 4. Validar y sanitizar datos de actualización
      const sanitizedData = this.validateAndSanitizeUserData(updateData, false);

      if (Object.keys(sanitizedData).length === 0) {
        throw new Error('No hay datos válidos para actualizar');
      }

      // 5. Preparar datos de actualización
      const updatedData = {
        ...sanitizedData,
        updatedAt: serverTimestamp()
      };

      // 6. Actualizar en Firestore
      const userRef = doc(this.usersCollection, userId);
      await updateDoc(userRef, updatedData);

      // 7. Log del evento exitoso
      this.logSecurityEvent('USER_UPDATED', userId, {
        updatedFields: Object.keys(sanitizedData),
        operation: 'updateUser'
      });

      return updatedData;
    } catch (error) {
      this.logSecurityEvent('USER_UPDATE_ERROR', userId, {
        error: error.message,
        operation: 'updateUser'
      });
      console.error('Error updating user:', error);
      throw error;
    }
  }

  //   OBTENER USUARIOS ACTIVOS (SOLO ADMIN)
  async getActiveUsers() {
    try {
      // 1. Verificar permisos de administrador
      await this.validateAdminAccess('getActiveUsers');

      // 2. Rate limiting
      const currentUser = await this.getCurrentUser();
      this.checkRateLimit(currentUser.uid, 'general');

      // 3. Obtener usuarios activos
      const q = query(this.usersCollection, where('isActive', '==', true));
      const querySnapshot = await getDocs(q);

      const users = querySnapshot.docs.map(doc => {
        const userData = { id: doc.id, ...doc.data() };
        // Filtrar datos sensibles para admin
        return this.filterSensitiveUserDataForAdmin(userData);
      });

      // 4. Log del acceso de admin
      this.logSecurityEvent('ADMIN_USERS_ACCESS', currentUser.uid, {
        usersCount: users.length,
        operation: 'getActiveUsers'
      });

      return users;
    } catch (error) {
      this.logSecurityEvent('ADMIN_ACCESS_ERROR', 'unknown', {
        error: error.message,
        operation: 'getActiveUsers'
      });
      console.error('Error getting active users:', error);
      throw error;
    }
  }

  //   Filtrar datos sensibles para vista de admin
  filterSensitiveUserDataForAdmin(userData) {
    const {
      metadata, // Remover metadatos técnicos
      ...adminFilteredData
    } = userData;

    return adminFilteredData;
  }

  //   INICIALIZAR PROGRESO DE USUARIO (SECURIZADO)
  async initializeUserProgress(userId) {
    try {
      // 1. Verificar autenticación y autorización
      await this.validateUserAccess(userId, 'initializeProgress');

      // 2. Obtener dominios cognitivos desde metadatos
      const domains = getAllDomains();

      // 3. Inicializar progreso para cada dominio
      for (const domain of domains) {
        const domainMetadata = getDomainMetadata(domain.id);
        const progressRef = doc(this.progressCollection, `${userId}_${domain.id}`);

        // Verificar si ya existe progreso para evitar sobrescribir
        const existingProgress = await getDoc(progressRef);
        if (!existingProgress.exists()) {
          await setDoc(progressRef, {
            userId,
            cognitiveDomain: domain.id,

            // Metadatos del dominio
            domainName: domainMetadata.name,
            domainColor: domainMetadata.color,
            domainIcon: domainMetadata.icon,
            domainDescription: domainMetadata.description,

            // Progreso inicial
            currentLevel: 1,
            totalGamesPlayed: 0,
            averageScore: 0,
            bestScore: 0,
            lastPlayedAt: null,
            lastGameId: null,
            lastGameName: null,

            // Timestamps
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),

            // Metadatos de seguridad
            metadata: {
              initializedByService: true,
              serviceVersion: '2.0'
            }
          });
        }
      }

      // 4. Log del evento
      this.logSecurityEvent('USER_PROGRESS_INITIALIZED', userId, {
        domainsCount: domains.length
      });

    } catch (error) {
      this.logSecurityEvent('PROGRESS_INIT_ERROR', userId, {
        error: error.message
      });
      console.error('Error initializing user progress:', error);
      throw error;
    }
  }

  //   OBTENER PROGRESO DE USUARIO (SECURIZADO)
  async getUserProgress(userId) {
    try {
      // 1. Verificar autenticación y autorización
      await this.validateUserAccess(userId, 'getUserProgress');

      // 2. Rate limiting
      this.checkRateLimit(userId, 'progress_read');

      // 3. Obtener progreso
      const q = query(this.progressCollection, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const progress = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 4. Enriquecer con metadatos si faltan (para datos antiguos)
      const enrichedProgress = progress.map(p => {
        if (!p.domainName && p.cognitiveDomain) {
          const domainMetadata = getDomainMetadata(p.cognitiveDomain);
          if (domainMetadata) {
            return {
              ...p,
              domainName: domainMetadata.name,
              domainColor: domainMetadata.color,
              domainIcon: domainMetadata.icon
            };
          }
        }
        return p;
      });

      // 5. Log del acceso
      this.logSecurityEvent('USER_PROGRESS_ACCESSED', userId, {
        domainsCount: progress.length
      });

      return enrichedProgress;
    } catch (error) {
      this.logSecurityEvent('PROGRESS_ACCESS_ERROR', userId, {
        error: error.message
      });
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  //   ACTUALIZAR PROGRESO DE USUARIO (SECURIZADO) 
  // NOTA: Este método debería ser usado principalmente por gameService
  async updateUserProgress(userId, cognitiveDomain, score) {
    try {
      console.log(`📊 Actualizando progreso: Usuario ${userId}, Dominio ${cognitiveDomain}, Score ${score}`);

      // ✅ MANTENER: Verificar autenticación
      const currentUser = await this.getCurrentUser();

      // ✅ MANTENER: Validar que el progreso pertenece al usuario autenticado
      if (userId !== currentUser.uid) {
        this.logSecurityEvent('UNAUTHORIZED_PROGRESS_UPDATE', currentUser.uid, {
          attemptedUserId: userId,
          cognitiveDomain
        });
        throw new Error('No puedes actualizar el progreso de otro usuario');
      }

      // ✅ MANTENER: Rate limiting
      this.checkRateLimit(currentUser.uid);

      // ✅ MANTENER: Validar que el dominio existe
      if (!validateDomainExists(cognitiveDomain)) {
        throw new Error(`Dominio cognitivo no válido: ${cognitiveDomain}`);
      }

      // 🔧 CAMBIAR: Solo normalizar el score sin validar rangos estrictos
      let normalizedScore = score;

      // Si viene como porcentaje (>1), convertir a decimal
      if (score > 1) {
        normalizedScore = score / 100;
        console.log(`📊 Score normalizado de ${score} a ${normalizedScore}`);
      }

      // Solo asegurar que esté en rango válido para la base de datos (0-1)
      normalizedScore = Math.max(0, Math.min(1, normalizedScore));

      // ✅ MANTENER: Resto de la lógica exactamente igual
      const progressRef = doc(this.progressCollection, `${userId}_${cognitiveDomain}`);

      // Obtener progreso actual
      let currentProgress = null;
      try {
        const progressDoc = await getDoc(progressRef);
        currentProgress = progressDoc.exists() ? progressDoc.data() : null;
      } catch (error) {
        console.log('No hay progreso previo, creando nuevo');
      }

      const updateData = {
        userId,
        cognitiveDomain,
        totalSessions: increment(1),
        lastScore: normalizedScore,
        lastPlayed: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Actualizar mejor puntaje solo si es mejor
      if (!currentProgress || normalizedScore > (currentProgress.bestScore || 0)) {
        updateData.bestScore = normalizedScore;
        console.log(`🏆 Nuevo mejor puntaje: ${normalizedScore}`);
      }

      // Calcular promedio
      if (currentProgress) {
        const totalSessions = (currentProgress.totalSessions || 0) + 1;
        const currentAverage = currentProgress.averageScore || 0;
        const newAverage = ((currentAverage * (totalSessions - 1)) + normalizedScore) / totalSessions;
        updateData.averageScore = Math.round(newAverage * 1000) / 1000; // 3 decimales
      } else {
        updateData.averageScore = normalizedScore;
      }

      await setDoc(progressRef, updateData, { merge: true });

      console.log(`✅ Progreso actualizado exitosamente para ${cognitiveDomain}`);

      // ✅ MANTENER: Log de seguridad
      this.logSecurityEvent('PROGRESS_UPDATED', userId, {
        cognitiveDomain,
        score: normalizedScore,
        totalSessions: updateData.totalSessions
      });

    } catch (error) {
      console.error('❌ Error actualizando progreso:', error);

      //  MANTENER: Log de errores de seguridad
      this.logSecurityEvent('PROGRESS_UPDATE_ERROR', userId, {
        error: error.message,
        cognitiveDomain
      });

      console.warn(`⚠️ No se pudo actualizar el progreso, pero el resultado del juego se guardó correctamente`);
    }
  }

  //   Método helper para obtener estadísticas básicas del usuario
  async getUserBasicStats(userId) {
    try {
      // 1. Verificar autenticación y autorización
      await this.validateUserAccess(userId, 'getUserBasicStats');

      // 2. Obtener progreso del usuario
      const progress = await this.getUserProgress(userId);

      // 3. Calcular estadísticas básicas
      const stats = {
        totalGamesPlayed: progress.reduce((sum, p) => sum + (p.totalGamesPlayed || 0), 0),
        averageScoreOverall: 0,
        strongestDomain: null,
        activeDomains: progress.filter(p => p.totalGamesPlayed > 0).length,
        lastActivity: null
      };

      if (stats.totalGamesPlayed > 0) {
        // Calcular promedio general ponderado
        let totalWeightedScore = 0;
        let totalGames = 0;

        for (const p of progress) {
          if (p.totalGamesPlayed > 0) {
            totalWeightedScore += p.averageScore * p.totalGamesPlayed;
            totalGames += p.totalGamesPlayed;
          }
        }

        stats.averageScoreOverall = Math.round((totalWeightedScore / totalGames) * 10000) / 10000;

        // Encontrar dominio más fuerte
        const strongestProgress = progress.reduce((strongest, current) => {
          if (current.totalGamesPlayed > 0 &&
            (!strongest || current.averageScore > strongest.averageScore)) {
            return current;
          }
          return strongest;
        }, null);

        if (strongestProgress) {
          stats.strongestDomain = {
            name: strongestProgress.domainName || strongestProgress.cognitiveDomain,
            score: strongestProgress.averageScore,
            color: strongestProgress.domainColor || '#gray'
          };
        }

        // Última actividad
        const lastActivities = progress
          .filter(p => p.lastPlayedAt)
          .map(p => p.lastPlayedAt)
          .sort((a, b) => b.seconds - a.seconds);

        if (lastActivities.length > 0) {
          stats.lastActivity = lastActivities[0];
        }
      }

      return stats;
    } catch (error) {
      console.error('Error getting user basic stats:', error);
      throw error;
    }
  }

  //   CERRAR SESIÓN (LOGOUT) SECURIZADO
  async logoutUser() {
    try {
      // 1. Verificar que hay un usuario autenticado
      const currentUser = await this.getCurrentUser();

      // 2. Log del evento de logout
      this.logSecurityEvent('USER_LOGOUT_INITIATED', currentUser.uid, {
        email: currentUser.email,
        operation: 'logout'
      });

      // 3. Cerrar sesión en Firebase Auth
      await signOut(auth);

      // 4. Limpiar datos locales del navegador
      if (typeof window !== 'undefined') {
        // Limpiar localStorage
        localStorage.removeItem('firebase:authUser');
        localStorage.removeItem('firebase:persistence');

        // Limpiar sessionStorage
        sessionStorage.clear();

        // Limpiar cookies de autenticación si existen
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.includes('firebase') || name.includes('auth') || name.includes('session')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        }
      }

      // 5. Log del evento de logout exitoso
      // Logging disabled for cleaner output
      // console.log('✅ Sesión cerrada exitosamente');

      return { success: true, message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      this.logSecurityEvent('USER_LOGOUT_ERROR', 'unknown', {
        error: error.message,
        operation: 'logout'
      });
      console.error('❌ Error al cerrar sesión:', error);
      throw new Error(`Error al cerrar sesión: ${error.message}`);
    }
  }

  //   ELIMINAR CUENTA (LOGICAL DELETE) SECURIZADO
  async deleteUserAccount(userId, confirmationPassword = null) {
    try {
      // 1. Verificar autenticación y autorización estricta
      const currentUser = await this.validateUserAccess(userId, 'deleteAccount');

      // 2. Rate limiting específico para operaciones críticas
      this.checkRateLimit(userId, 'critical_operation');

      // 3. Verificar que el usuario existe y está activo
      const userRef = doc(this.usersCollection, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userSnap.data();
      if (!userData.isActive) {
        throw new Error('La cuenta ya está desactivada');
      }

      // 4. Log del evento crítico de seguridad
      this.logSecurityEvent('USER_DELETE_INITIATED', userId, {
        email: currentUser.email,
        displayName: userData.displayName || 'No name',
        operation: 'deleteAccount'
      });

      // 5. Realizar eliminación lógica (NO físico)
      const deleteData = {
        // Marcar como inactivo/eliminado
        isActive: false,
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: userId, // Auto-eliminación

        // Preservar datos para auditoría pero anonimizar datos sensibles
        originalEmail: userData.email, // Para auditoría
        email: `deleted_${Date.now()}@deleted.local`, // Anonimizar
        displayName: `Usuario Eliminado ${Date.now()}`, // Anonimizar

        // Preservar metadatos importantes para análisis
        metadata: {
          ...userData.metadata,
          deletionReason: 'user_requested',
          deletionDate: new Date().toISOString(),
          serviceVersion: '2.0',
          preservedForAudit: true
        },

        // Timestamp de actualización
        updatedAt: serverTimestamp()
      };

      // 6. Actualizar el documento del usuario
      await updateDoc(userRef, deleteData);

      // 7. Marcar progreso del usuario como inactivo (preservar para estadísticas)
      const progressQuery = query(this.progressCollection, where('userId', '==', userId));
      const progressSnapshot = await getDocs(progressQuery);

      const progressUpdates = progressSnapshot.docs.map(doc => {
        const progressRef = doc.ref;
        return updateDoc(progressRef, {
          isActive: false,
          deletedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      // Ejecutar todas las actualizaciones de progreso en paralelo
      await Promise.all(progressUpdates);

      // 8. Cerrar sesión del usuario después de la eliminación
      await signOut(auth);

      // 9. Limpiar datos locales
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // 10. Log del evento exitoso
      this.logSecurityEvent('USER_DELETE_COMPLETED', userId, {
        email: userData.originalEmail || userData.email,
        progressRecordsUpdated: progressSnapshot.docs.length,
        operation: 'deleteAccount'
      });

      // Logging disabled for cleaner output
      // console.log('✅ Cuenta eliminada exitosamente (eliminación lógica)');

      return {
        success: true,
        message: 'Cuenta eliminada exitosamente. Todos los datos han sido anonimizados.',
        progressRecordsAffected: progressSnapshot.docs.length
      };

    } catch (error) {
      this.logSecurityEvent('USER_DELETE_ERROR', userId, {
        error: error.message,
        operation: 'deleteAccount'
      });
      console.error('❌ Error al eliminar cuenta:', error);
      throw new Error(`Error al eliminar la cuenta: ${error.message}`);
    }
  }

  //   Método helper para verificar si una cuenta fue eliminada
  async isAccountDeleted(userId) {
    try {
      const userRef = doc(this.usersCollection, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { deleted: true, reason: 'not_found' };
      }

      const userData = userSnap.data();

      if (userData.isDeleted || !userData.isActive) {
        return {
          deleted: true,
          reason: userData.isDeleted ? 'user_deleted' : 'account_inactive',
          deletedAt: userData.deletedAt || userData.updatedAt
        };
      }

      return { deleted: false };
    } catch (error) {
      console.error('Error checking account deletion status:', error);
      return { deleted: false, error: error.message };
    }
  }

  //   VALIDAR CUENTA DURANTE LOGIN (SECURIZADO)
  async validateAccountForLogin(userId) {
    try {
      console.log(`🔍 Validando cuenta para login: ${userId}`);

      // 1. Verificar si la cuenta existe en Firestore
      const userRef = doc(this.usersCollection, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Cuenta no encontrada en Firestore (puede ser primera vez)
        return {
          valid: true,
          isNewUser: true,
          reason: 'account_not_in_firestore'
        };
      }

      const userData = userSnap.data();

      // 2. Verificar si la cuenta está marcada como eliminada
      if (userData.isDeleted) {
        this.logSecurityEvent('LOGIN_ATTEMPT_DELETED_ACCOUNT', userId, {
          email: userData.originalEmail || userData.email,
          deletedAt: userData.deletedAt,
          operation: 'validateAccountForLogin'
        });

        return {
          valid: false,
          reason: 'account_deleted',
          message: 'Esta cuenta ha sido eliminada. No puedes acceder al sistema.',
          deletedAt: userData.deletedAt
        };
      }

      // 3. Verificar si la cuenta está marcada como inactiva
      if (!userData.isActive) {
        this.logSecurityEvent('LOGIN_ATTEMPT_INACTIVE_ACCOUNT', userId, {
          email: userData.email,
          operation: 'validateAccountForLogin'
        });

        return {
          valid: false,
          reason: 'account_inactive',
          message: 'Esta cuenta está inactiva. Contacta al administrador.',
          updatedAt: userData.updatedAt
        };
      }

      // 4. Verificar suspensión temporal (si existe el campo)
      if (userData.isSuspended) {
        const suspensionEnd = userData.suspensionEnd?.toDate();
        const now = new Date();

        if (!suspensionEnd || suspensionEnd > now) {
          this.logSecurityEvent('LOGIN_ATTEMPT_SUSPENDED_ACCOUNT', userId, {
            email: userData.email,
            suspensionEnd: suspensionEnd,
            operation: 'validateAccountForLogin'
          });

          return {
            valid: false,
            reason: 'account_suspended',
            message: `Esta cuenta está suspendida${suspensionEnd ? ` hasta ${suspensionEnd.toLocaleDateString()}` : ''}.`,
            suspensionEnd: suspensionEnd
          };
        } else {
          // La suspensión ha expirado, limpiar el estado
          await updateDoc(userRef, {
            isSuspended: false,
            suspensionEnd: null,
            updatedAt: serverTimestamp()
          });
        }
      }

      // 5. Log del acceso exitoso
      this.logSecurityEvent('LOGIN_VALIDATION_SUCCESS', userId, {
        email: userData.email,
        operation: 'validateAccountForLogin'
      });

      console.log(`✅ Cuenta válida para login: ${userData.email}`);

      // 6. Actualizar timestamp de último login para cuentas válidas
      try {
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (updateError) {
        console.warn('No se pudo actualizar el timestamp de login:', updateError.message);
      }

      return {
        valid: true,
        isNewUser: false,
        userData: {
          email: userData.email,
          displayName: userData.displayName,
          isAdmin: userData.isAdmin || false,
          createdAt: userData.createdAt,
          lastLogin: new Date()
        }
      };

    } catch (error) {
      this.logSecurityEvent('LOGIN_VALIDATION_ERROR', userId, {
        error: error.message,
        operation: 'validateAccountForLogin'
      });

      console.error('❌ Error validando cuenta para login:', error);

      // En caso de error, permitir el acceso para no bloquear usuarios legítimos
      // pero registrar el error para investigación
      return {
        valid: true,
        isNewUser: false,
        error: error.message,
        reason: 'validation_error'
      };
    }
  }

  //   FORZAR LOGOUT DE CUENTA ELIMINADA/INACTIVA
  async forceLogoutDeletedAccount(userId, reason = 'account_deleted') {
    try {
      console.log(`🚪 Forzando logout por cuenta ${reason}: ${userId}`);

      // 1. Log del evento de seguridad
      this.logSecurityEvent('FORCED_LOGOUT_DELETED_ACCOUNT', userId, {
        reason,
        operation: 'forceLogoutDeletedAccount'
      });

      // 2. Cerrar sesión de Firebase Auth
      await signOut(auth);

      // 3. Limpiar datos locales
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();

        // Limpiar cookies
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.includes('firebase') || name.includes('auth') || name.includes('session')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        }
      }

      console.log(`✅ Logout forzado completado para cuenta ${reason}`);

      return { success: true, reason };

    } catch (error) {
      console.error('❌ Error en logout forzado:', error);
      return { success: false, error: error.message };
    }
  }
}

export const userService = new UserService();