// Central configuration for Juego5 (Visual Recognition Memory)
// Update these values to change game behavior without editing the main component

const JUEGO5_CONFIG = {
  START_LEVEL: 1,
  MAX_LEVEL: 3,
  PASS_THRESHOLD: 0.7,
  RESPONSE_TIME_LIMIT: 5, // seconds per response

  LEVELS: {
    BASICO: {
      nombre: 'Básico',
      figureCount: 5,
      displayTime: 1500,
      testFigureCount: 10
    },
    INTERMEDIO: {
      nombre: 'Intermedio',
      figureCount: 7,
      displayTime: 1000,
      testFigureCount: 14
    },
    AVANZADO: {
      nombre: 'Avanzado',
      figureCount: 10,
      displayTime: 750,
      testFigureCount: 20
    }
  }
};

// Simple shapes using Unicode symbols - only distinct shapes, no size variations
const formas = [
  "●",  // Circle
  "■",  // Square
  "▲",  // Triangle up
  "▼",  // Triangle down
  "◆",  // Diamond
  "⬟",  // Pentagon
  "⬢",  // Hexagon
  "⬥",  // Diamond outline
  "✦",  // Star 4-point
  "✪",  // Star circled
  "✧",  // Star 8-point
  "◈",  // Diamond cross
  "⬠"   // Dotted square
];

export const generarSecuencia = (nivel) => {
  const config = JUEGO5_CONFIG.LEVELS[nivel];
  const secuencia = [];
  const formasUsadas = new Set();

  for (let i = 0; i < config.figureCount; i++) {
    let forma;
    let intentos = 0;
    do {
      forma = formas[Math.floor(Math.random() * formas.length)];
      intentos++;
    } while (formasUsadas.has(forma) && intentos < 20);

    formasUsadas.add(forma);
    secuencia.push(forma);
  }

  return secuencia;
};

export const generarPreguntas = (secuencia, nivel) => {
  const config = JUEGO5_CONFIG.LEVELS[nivel];
  const preguntas = [];
  const formasUsadas = new Set(secuencia);

  // Add all memorized figures
  preguntas.push(...secuencia);

  // Add distractors (figures not in sequence)
  const formasDisponibles = formas.filter(f => !formasUsadas.has(f));

  while (preguntas.length < config.testFigureCount && formasDisponibles.length > 0) {
    const randomIndex = Math.floor(Math.random() * formasDisponibles.length);
    const forma = formasDisponibles.splice(randomIndex, 1)[0];
    preguntas.push(forma);
  }

  // Shuffle questions
  return preguntas.sort(() => Math.random() - 0.5);
};

// Export the config for use in the main component
export { JUEGO5_CONFIG };