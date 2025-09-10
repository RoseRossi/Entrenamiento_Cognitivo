export const GAME_METADATA = {
  razonamiento_gramatical: {
    id: 'razonamiento_gramatical',
    name: 'Razonamiento Gramatical',
    displayName: 'Razonamiento Gramatical',
    description: 'Interpretar declaraciones lógicas sobre posiciones espaciales de figuras',
    cognitiveDomain: 'lenguaje',
    domainDisplayName: 'Lenguaje',
    category: 'verbal',
    difficulty: {
      easy: { minTime: 5000, maxTime: 300000, maxScore: 1 },
      medium: { minTime: 8000, maxTime: 240000, maxScore: 1 },
      hard: { minTime: 10000, maxTime: 180000, maxScore: 1 }
    },
    scoring: {
      type: 'percentage',
      minScore: 0,
      maxScore: 1,
      precision: 4
    },
    version: '1.0',
    isActive: true,
    tags: ['razonamiento', 'gramatical', 'lenguaje', 'deductivo']
  },
  
  matrices_progresivas: {
    id: 'matrices_progresivas',
    name: 'Matrices Progresivas',
    displayName: 'Matrices Progresivas',
    description: 'Reconocer patrones en matrices 3x3 y completar la secuencia',
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
    tags: ['matrices', 'patrones', 'visual', 'abstracto']
  },

  aprendizaje_listas_verbales: {
    id: 'aprendizaje_listas_verbales',
    name: 'Aprendizaje de Listas Verbales',
    displayName: 'Aprendizaje de Listas Verbales',
    description: 'Memorizar y recordar listas de palabras',
    cognitiveDomain: 'memoria',
    domainDisplayName: 'Memoria',
    category: 'verbal-memory',
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
    tags: ['memoria', 'verbal', 'listas', 'episodica']
  },

  balance_balanza: {
    id: 'balance_balanza',
    name: 'Balance de Balanza',
    displayName: 'Balance de Balanza',
    description: 'Resolver problemas de equilibrio con formas geométricas',
    cognitiveDomain: 'funciones_ejecutivas',
    domainDisplayName: 'Funciones Ejecutivas',
    category: 'executive',
    difficulty: {
      easy: { minTime: 15000, maxTime: 900000, maxScore: 1 },
      medium: { minTime: 20000, maxTime: 720000, maxScore: 1 },
      hard: { minTime: 30000, maxTime: 600000, maxScore: 1 }
    },
    scoring: {
      type: 'efficiency',
      minScore: 0,
      maxScore: 1,
      precision: 4
    },
    version: '1.0',
    isActive: true,
    tags: ['planificacion', 'balanza', 'ejecutivas', 'proporcional']
  },

  reconociendo_objetos: {
    id: 'reconociendo_objetos',
    name: 'Reconociendo Objetos',
    displayName: 'Reconociendo Objetos',
    description: 'Memorizar figuras y reconocerlas posteriormente',
    cognitiveDomain: 'memoria',
    domainDisplayName: 'Memoria',
    category: 'visual-memory',
    difficulty: {
      easy: { minTime: 5000, maxTime: 300000, maxScore: 1 },
      medium: { minTime: 8000, maxTime: 240000, maxScore: 1 },
      hard: { minTime: 10000, maxTime: 180000, maxScore: 1 }
    },
    scoring: {
      type: 'accuracy-speed',
      minScore: 0,
      maxScore: 1,
      precision: 4
    },
    version: '1.0',
    isActive: true,
    tags: ['memoria', 'visual', 'reconocimiento', 'objetos']
  },

  posner_haciendo_cola: {
    id: 'posner_haciendo_cola',
    name: 'Posner Haciendo Cola',
    displayName: 'Posner Haciendo Cola',
    description: 'Enfocar atención según señales direccionales',
    cognitiveDomain: 'atencion',
    domainDisplayName: 'Atención',
    category: 'attention',
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
    tags: ['atencion', 'posner', 'visual', 'orientacion']
  },

  forward_memory_span: {
    id: 'forward_memory_span',
    name: 'Forward Memory Span',
    displayName: 'Forward Memory Span',
    description: 'Recordar secuencias de círculos en el mismo orden',
    cognitiveDomain: 'memoria_trabajo',
    domainDisplayName: 'Memoria de Trabajo',
    category: 'working-memory',
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
    tags: ['memoria_trabajo', 'visoespacial', 'span', 'directo']
  },

  reverse_memory_span: {
    id: 'reverse_memory_span',
    name: 'Reverse Memory Span',
    displayName: 'Reverse Memory Span',
    description: 'Recordar secuencias de círculos en orden inverso',
    cognitiveDomain: 'memoria_trabajo',
    domainDisplayName: 'Memoria de Trabajo',
    category: 'working-memory-reverse',
    difficulty: {
      easy: { minTime: 8000, maxTime: 480000, maxScore: 1 },
      medium: { minTime: 12000, maxTime: 420000, maxScore: 1 },
      hard: { minTime: 18000, maxTime: 360000, maxScore: 1 }
    },
    scoring: {
      type: 'categories-errors',
      minScore: 0,
      maxScore: 1,
      precision: 4
    },
    version: '1.0',
    isActive: true,
    tags: ['memoria_trabajo', 'visoespacial', 'span', 'inverso']
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