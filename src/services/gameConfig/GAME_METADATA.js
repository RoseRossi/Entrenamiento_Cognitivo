export const GAME_METADATA = {
  juego1: {
    id: 'juego1',
    name: 'Comprensión Lectora',
    displayName: 'Comprensión de Textos',
    description: 'Evalúa la capacidad de entender y procesar información textual',
    cognitiveDomain: 'lenguaje',
    domainDisplayName: 'Lenguaje',
    category: 'verbal',
    difficulty: {
      easy: { minTime: 5000, maxTime: 300000, maxScore: 1 },
      medium: { minTime: 8000, maxTime: 240000, maxScore: 1 },
      hard: { minTime: 10000, maxTime: 180000, maxScore: 1 }
    },
    scoring: {
      type: 'percentage', // percentage, points, time-based
      minScore: 0,
      maxScore: 1,
      precision: 4 // decimales
    },
    version: '1.0',
    isActive: true,
    tags: ['lectura', 'comprension', 'texto']
  },
  
  juego2: {
    id: 'juego2',
    name: 'Matrices Progresivas',
    displayName: 'Razonamiento con Matrices',
    description: 'Evalúa el razonamiento abstracto y la capacidad de identificar patrones',
    cognitiveDomain: 'razonamiento_abstracto',
    domainDisplayName: 'Razonamiento Abstracto',
    category: 'visual-spatial',
    difficulty: {
      easy: { minTime: 10000, maxTime: 600000, maxScore: 1 },
      medium: { minTime: 15000, maxTime: 480000, maxScore: 1 },
      hard: { minTime: 20000, maxTime: 360000, maxScore: 1 }
    },
    scoring: {
      type: 'percentage',
      minScore: 0,
      maxScore: 1,
      precision: 4
    },
    version: '1.0',
    isActive: true,
    tags: ['matrices', 'patrones', 'visual', 'logica']
  },

  juego3: {
    id: 'juego3',
    name: 'Memoria Visual',
    displayName: 'Recordar Secuencias',
    description: 'Evalúa la capacidad de recordar y reproducir secuencias visuales',
    cognitiveDomain: 'memoria',
    domainDisplayName: 'Memoria',
    category: 'visual-memory',
    difficulty: {
      easy: { minTime: 8000, maxTime: 400000, maxScore: 1 },
      medium: { minTime: 12000, maxTime: 300000, maxScore: 1 },
      hard: { minTime: 15000, maxTime: 240000, maxScore: 1 }
    },
    scoring: {
      type: 'percentage',
      minScore: 0,
      maxScore: 1,
      precision: 4
    },
    version: '1.0',
    isActive: true,
    tags: ['memoria', 'visual', 'secuencias']
  },

  juego4: {
    id: 'juego4',
    name: 'Torre de Hanoi',
    displayName: 'Planificación y Estrategia',
    description: 'Evalúa las funciones ejecutivas y capacidad de planificación',
    cognitiveDomain: 'funciones_ejecutivas',
    domainDisplayName: 'Funciones Ejecutivas',
    category: 'executive',
    difficulty: {
      easy: { minTime: 15000, maxTime: 900000, maxScore: 1 },
      medium: { minTime: 20000, maxTime: 720000, maxScore: 1 },
      hard: { minTime: 30000, maxTime: 600000, maxScore: 1 }
    },
    scoring: {
      type: 'efficiency', // Combina tiempo y movimientos
      minScore: 0,
      maxScore: 1,
      precision: 4
    },
    version: '1.0',
    isActive: true,
    tags: ['planificacion', 'estrategia', 'ejecutivas']
  },

  juego5: {
    id: 'juego5',
    name: 'Stroop Test',
    displayName: 'Control Atencional',
    description: 'Evalúa la atención selectiva y control inhibitorio',
    cognitiveDomain: 'atencion',
    domainDisplayName: 'Atención',
    category: 'attention',
    difficulty: {
      easy: { minTime: 5000, maxTime: 300000, maxScore: 1 },
      medium: { minTime: 8000, maxTime: 240000, maxScore: 1 },
      hard: { minTime: 10000, maxTime: 180000, maxScore: 1 }
    },
    scoring: {
      type: 'accuracy-speed', // Combina precisión y velocidad
      minScore: 0,
      maxScore: 1,
      precision: 4
    },
    version: '1.0',
    isActive: true,
    tags: ['atencion', 'stroop', 'inhibicion']
  },

  juego6: {
    id: 'juego6',
    name: 'N-Back Task',
    displayName: 'Memoria de Trabajo',
    description: 'Evalúa la capacidad de mantener y manipular información en memoria',
    cognitiveDomain: 'memoria_trabajo',
    domainDisplayName: 'Memoria de Trabajo',
    category: 'working-memory',
    difficulty: {
      easy: { minTime: 10000, maxTime: 600000, maxScore: 1 },
      medium: { minTime: 15000, maxTime: 480000, maxScore: 1 },
      hard: { minTime: 20000, maxTime: 360000, maxScore: 1 }
    },
    scoring: {
      type: 'percentage',
      minScore: 0,
      maxScore: 1,
      precision: 4
    },
    version: '1.0',
    isActive: true,
    tags: ['memoria_trabajo', 'n-back', 'actualizacion']
  },

  juego7: {
    id: 'juego7',
    name: 'Analogías Verbales',
    displayName: 'Razonamiento Verbal',
    description: 'Evalúa el razonamiento abstracto mediante analogías verbales',
    cognitiveDomain: 'razonamiento_abstracto',
    domainDisplayName: 'Razonamiento Abstracto',
    category: 'verbal-reasoning',
    difficulty: {
      easy: { minTime: 12000, maxTime: 720000, maxScore: 1 },
      medium: { minTime: 18000, maxTime: 600000, maxScore: 1 },
      hard: { minTime: 25000, maxTime: 480000, maxScore: 1 }
    },
    scoring: {
      type: 'percentage',
      minScore: 0,
      maxScore: 1,
      precision: 4
    },
    version: '1.0',
    isActive: true,
    tags: ['analogias', 'verbal', 'razonamiento']
  },

  juego8: {
    id: 'juego8',
    name: 'Wisconsin Card Sort',
    displayName: 'Flexibilidad Cognitiva',
    description: 'Evalúa la flexibilidad mental y capacidad de cambio de estrategia',
    cognitiveDomain: 'funciones_ejecutivas',
    domainDisplayName: 'Funciones Ejecutivas',
    category: 'executive-flexibility',
    difficulty: {
      easy: { minTime: 8000, maxTime: 480000, maxScore: 1 },
      medium: { minTime: 12000, maxTime: 420000, maxScore: 1 },
      hard: { minTime: 18000, maxTime: 360000, maxScore: 1 }
    },
    scoring: {
      type: 'categories-errors', // Categorías completadas vs errores
      minScore: 0,
      maxScore: 1,
      precision: 4
    },
    version: '1.0',
    isActive: true,
    tags: ['flexibilidad', 'wisconsin', 'cambio']
  }
};

// Dominios cognitivos con información detallada
export const COGNITIVE_DOMAINS = {
  lenguaje: {
    id: 'lenguaje',
    name: 'Lenguaje',
    description: 'Capacidades relacionadas con comprensión y producción verbal',
    color: '#3498db',
    icon: '📚',
    skills: ['comprensión lectora', 'vocabulario', 'fluidez verbal']
  },
  razonamiento_abstracto: {
    id: 'razonamiento_abstracto',
    name: 'Razonamiento Abstracto',
    description: 'Capacidad de identificar patrones y relaciones lógicas',
    color: '#9b59b6',
    icon: '🧩',
    skills: ['reconocimiento de patrones', 'lógica', 'analogías']
  },
  memoria: {
    id: 'memoria',
    name: 'Memoria',
    description: 'Capacidad de codificar, almacenar y recuperar información',
    color: '#e74c3c',
    icon: '🧠',
    skills: ['memoria visual', 'memoria auditiva', 'consolidación']
  },
  funciones_ejecutivas: {
    id: 'funciones_ejecutivas',
    name: 'Funciones Ejecutivas',
    description: 'Capacidades de control, planificación y flexibilidad mental',
    color: '#f39c12',
    icon: '⚡',
    skills: ['planificación', 'inhibición', 'flexibilidad', 'monitoreo']
  },
  atencion: {
    id: 'atencion',
    name: 'Atención',
    description: 'Capacidad de focalizar y mantener el foco atencional',
    color: '#2ecc71',
    icon: '🎯',
    skills: ['atención sostenida', 'atención selectiva', 'atención dividida']
  },
  memoria_trabajo: {
    id: 'memoria_trabajo',
    name: 'Memoria de Trabajo',
    description: 'Capacidad de mantener y manipular información activamente',
    color: '#1abc9c',
    icon: '🔄',
    skills: ['almacén temporal', 'manipulación', 'actualización']
  }
};

// Funciones helper
export const getGameMetadata = (gameId) => {
  return GAME_METADATA[gameId] || null;
};

export const getDomainMetadata = (domainId) => {
  return COGNITIVE_DOMAINS[domainId] || null;
};

export const getActiveGames = () => {
  return Object.values(GAME_METADATA).filter(game => game.isActive);
};

export const getGamesByDomain = (domainId) => {
  return Object.values(GAME_METADATA).filter(game => 
    game.cognitiveDomain === domainId && game.isActive
  );
};

export const getAllDomains = () => {
  return Object.values(COGNITIVE_DOMAINS);
};

export const validateGameExists = (gameId) => {
  return GAME_METADATA.hasOwnProperty(gameId) && GAME_METADATA[gameId].isActive;
};

export const validateDomainExists = (domainId) => {
  return COGNITIVE_DOMAINS.hasOwnProperty(domainId);
};