// Central configuration for Juego3 (Memory Game)
// Update these values to change game behavior without editing the main component

const JUEGO3_CONFIG = {
  // Level progression settings
  START_LEVEL: 1,              // Starting level
  MAX_LEVEL: 7,                // Maximum level (12 words)

  // Word count per level
  MIN_WORDS: 6,                // Words at level 1
  MAX_WORDS: 12,               // Words at max level
  WORDS_PER_LEVEL: 1,          // How many words to add per level (6, 7, 8, 9, 10, 11, 12)

  // Word display timing (in milliseconds)
  INITIAL_DISPLAY_TIME: 2000,  // Initial time to display each word (2 seconds)
  MIN_DISPLAY_TIME: 500,       // Minimum time to display each word (0.5 seconds)
  TIME_DECREASE_PER_LEVEL: 214, // How much to decrease time per level (~214ms per level to reach 500ms at level 7)

  // Selection phase timing (in seconds)
  INITIAL_SELECTION_TIMER: 25, // Initial time to select words (25 seconds)
  MIN_SELECTION_TIMER: 10,     // Minimum time to select words (10 seconds)
  SELECTION_TIME_DECREASE_PER_LEVEL: 2.14, // How much to decrease selection time per level (~2.14s per level)

  // Progression rules
  PASS_THRESHOLD: 0.5,         // Need 50% correct to pass to next level
  ROUNDS_PER_LEVEL: 3,         // Number of rounds to show words before selection

  // Distractor words pool
  DISTRACTOR_POOL_SIZE: 12,    // Number of distractor words available
  TOTAL_WORD_SEA: 24,          // Total words to show in selection (original + distractors)

  // Scoring
  FAIL_ON_TIMER_EXPIRY: true,  // If true, game ends when selection timer runs out
};

// Pool completo de palabras originales (12 palabras máximas)
const palabrasPool = [
  "cielo", "montaña", "río", "fuego", "sol", "luna",
  "estrella", "nieve", "mar", "bosque", "viento", "roca"
];

const distractores = [
  "arena", "hierba", "nube", "lluvia", "trueno", "relámpago",
  "volcán", "cascada", "laguna", "desierto", "jungla", "glaciar"
];

// Calcula cuántas palabras mostrar según el nivel
export const getPalabrasCountForLevel = (nivel) => {
  const count = Math.min(
    JUEGO3_CONFIG.MIN_WORDS + (nivel - 1) * JUEGO3_CONFIG.WORDS_PER_LEVEL,
    JUEGO3_CONFIG.MAX_WORDS
  );
  return count;
};

// Calcula el tiempo de display por palabra según el nivel (en milisegundos)
export const getDisplayTimeForLevel = (nivel) => {
  const time = Math.max(
    JUEGO3_CONFIG.INITIAL_DISPLAY_TIME - (nivel - 1) * JUEGO3_CONFIG.TIME_DECREASE_PER_LEVEL,
    JUEGO3_CONFIG.MIN_DISPLAY_TIME
  );
  return time;
};

// Calcula el tiempo de selección según el nivel (en segundos)
export const getSelectionTimeForLevel = (nivel) => {
  const time = Math.max(
    JUEGO3_CONFIG.INITIAL_SELECTION_TIMER - (nivel - 1) * JUEGO3_CONFIG.SELECTION_TIME_DECREASE_PER_LEVEL,
    JUEGO3_CONFIG.MIN_SELECTION_TIMER
  );
  return Math.round(time);
};

// Genera las palabras originales para un nivel específico
export const generarPalabrasOriginales = (nivel) => {
  const count = getPalabrasCountForLevel(nivel);
  return palabrasPool.slice(0, count);
};

// Genera el mar de palabras (palabras originales + distractores)
export const generarMarDePalabras = (palabrasOriginales) => {
  const mezcla = [...palabrasOriginales];

  // Agregar distractores hasta llegar al tamaño total
  const distractoresDisponibles = [...distractores];
  while (mezcla.length < JUEGO3_CONFIG.TOTAL_WORD_SEA && distractoresDisponibles.length > 0) {
    const randomIndex = Math.floor(Math.random() * distractoresDisponibles.length);
    const distr = distractoresDisponibles[randomIndex];

    if (!mezcla.includes(distr)) {
      mezcla.push(distr);
    }

    // Remover el distractor usado para evitar duplicados
    distractoresDisponibles.splice(randomIndex, 1);
  }

  // Mezclar el array
  return mezcla.sort(() => Math.random() - 0.5);
};

// Export the config for use in the main component
export { JUEGO3_CONFIG };