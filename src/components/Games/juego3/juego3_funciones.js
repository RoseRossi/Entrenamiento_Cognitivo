import JUEGO3_CONFIG from './juego3_config';

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