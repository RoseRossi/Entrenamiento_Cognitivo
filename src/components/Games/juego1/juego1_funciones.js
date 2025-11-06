
// Central configuration for Juego1
// Update these values to change game behavior without editing the main component

const JUEGO1_CONFIG = {
  MAIN_TIMER_SECONDS: 45,    // Tiempo total del juego
  INITIAL_INNER_TIMER: 15,   // Tiempo por pregunta en el nivel inicial
  MIN_INNER_TIMER: 3,        // Tiempo mínimo por pregunta
  START_LEVEL: 1,            // Nivel inicial
  FAILS_TO_END: 3,          // Fallos consecutivos para terminar
  ROUND_TO_COMPLETE: 10,     // Rondas para considerar el juego completado

  // Configuración de formas disponibles
  SHAPES: {
    INITIAL_SHAPES: 2,     // Número de formas al inicio
    MAX_SHAPES: 9,         // Número máximo de formas
    SHAPES_LIST: [         // Lista de formas disponibles en orden de aparición
      'cuadrado',
      'triángulo',
      'círculo',
      'estrella',
      'diamante',
      'hexágono',
      'rectángulo',
      'elipse',
      'semicírculo'
    ],
    LEVEL_TO_ADD_SHAPE: 3, // Cada cuántos niveles se agrega una nueva forma
    POSITION_RATIO: 0.5    // Probabilidad de que la primera forma esté a la derecha
  },

  // Configuración de complejidad de enunciados
  STATEMENTS: {
    INITIAL_POSITIVE_RATIO: 1.0,     // 100% enunciados positivos al inicio
    FINAL_POSITIVE_RATIO: 0.5,       // 50% enunciados positivos al final
    LEVELS_TO_FINAL_RATIO: 10,       // Niveles para alcanzar ratio final
    NEGATIVE_STATEMENTS_RATIO: 0.5,   // Probabilidad de usar enunciados negativos (con "NO")
    DIRECTION_LEFT_RATIO: 0.5,        // Probabilidad de usar "izquierda" vs "derecha"
    TRUTH_RATIO: 0.5                  // Probabilidad de que el enunciado sea verdadero
  }
};

// Calcula cuántas formas están disponibles para el nivel actual
const getAvailableShapesForLevel = (nivel) => {
  const shapesCount = Math.min(
    JUEGO1_CONFIG.SHAPES.INITIAL_SHAPES +
    Math.floor((nivel - 1) / JUEGO1_CONFIG.SHAPES.LEVEL_TO_ADD_SHAPE),
    JUEGO1_CONFIG.SHAPES.MAX_SHAPES
  );
  return JUEGO1_CONFIG.SHAPES.SHAPES_LIST.slice(0, shapesCount);
};

// Calcula el ratio de enunciados positivos para el nivel actual
const getPositiveRatioForLevel = (nivel) => {
  const { INITIAL_POSITIVE_RATIO, FINAL_POSITIVE_RATIO, LEVELS_TO_FINAL_RATIO } = JUEGO1_CONFIG.STATEMENTS;
  const ratio = INITIAL_POSITIVE_RATIO -
    ((INITIAL_POSITIVE_RATIO - FINAL_POSITIVE_RATIO) *
      Math.min(nivel - 1, LEVELS_TO_FINAL_RATIO - 1)) /
    (LEVELS_TO_FINAL_RATIO - 1);
  return ratio;
};

// Genera formación aleatoria de formas y su posición
export const generarFormacion = (nivel) => {
  const availableShapes = getAvailableShapesForLevel(nivel);
  const shape1Index = Math.floor(Math.random() * availableShapes.length);
  let shape2Index;
  do {
    shape2Index = Math.floor(Math.random() * availableShapes.length);
  } while (shape2Index === shape1Index);

  const shape1 = availableShapes[shape1Index];
  const shape2 = availableShapes[shape2Index];
  const shape1IsRight = Math.random() < JUEGO1_CONFIG.SHAPES.POSITION_RATIO;

  const nuevaFormacion = {
    leftShape: shape1IsRight ? shape2 : shape1,
    rightShape: shape1IsRight ? shape1 : shape2
  };

  // Determinar si el enunciado será positivo basado en el nivel
  const isPositive = Math.random() < getPositiveRatioForLevel(nivel);

  // Determinar si la declaración será verdadera o falsa
  const isTrue = Math.random() < JUEGO1_CONFIG.STATEMENTS.TRUTH_RATIO;

  // Determinar si usaremos "izquierda" o "derecha"
  const useLeft = Math.random() < JUEGO1_CONFIG.STATEMENTS.DIRECTION_LEFT_RATIO;

  // Determinar si usaremos una forma positiva o negativa de la frase
  const useNegative = Math.random() < JUEGO1_CONFIG.STATEMENTS.NEGATIVE_STATEMENTS_RATIO && !isPositive; // Solo usamos negativas cuando no es forzado positivo

  // Construir el enunciado basado en si queremos que sea verdadero o falso
  let nuevaDeclaracion;
  const position = useLeft ? 'izquierda' : 'derecha';

  if (useNegative) {
    // Usando forma negativa
    if (useLeft) {
      if (isTrue) {
        // Verdadero negativo: "El cuadrado NO está a la izquierda del triángulo" (cuando realmente no lo está)
        nuevaDeclaracion = `El ${nuevaFormacion.rightShape} NO está a la ${position} del ${nuevaFormacion.leftShape}`;
      } else {
        // Falso negativo: "El triángulo NO está a la izquierda del cuadrado" (cuando sí lo está)
        nuevaDeclaracion = `El ${nuevaFormacion.leftShape} NO está a la ${position} del ${nuevaFormacion.rightShape}`;
      }
    } else {
      if (isTrue) {
        // Verdadero negativo: "El triángulo NO está a la derecha del cuadrado" (cuando realmente no lo está)
        nuevaDeclaracion = `El ${nuevaFormacion.leftShape} NO está a la ${position} del ${nuevaFormacion.rightShape}`;
      } else {
        // Falso negativo: "El cuadrado NO está a la derecha del triángulo" (cuando sí lo está)
        nuevaDeclaracion = `El ${nuevaFormacion.rightShape} NO está a la ${position} del ${nuevaFormacion.leftShape}`;
      }
    }
  } else {
    // Usando forma positiva (como estaba antes)
    if (useLeft) {
      if (isTrue) {
        nuevaDeclaracion = `El ${nuevaFormacion.leftShape} está a la ${position} del ${nuevaFormacion.rightShape}`;
      } else {
        nuevaDeclaracion = `El ${nuevaFormacion.rightShape} está a la ${position} del ${nuevaFormacion.leftShape}`;
      }
    } else {
      if (isTrue) {
        nuevaDeclaracion = `El ${nuevaFormacion.rightShape} está a la ${position} del ${nuevaFormacion.leftShape}`;
      } else {
        nuevaDeclaracion = `El ${nuevaFormacion.leftShape} está a la ${position} del ${nuevaFormacion.rightShape}`;
      }
    }
  } return {
    nuevaFormacion,
    nuevaDeclaracion,
    declaracionEsVerdadera: isTrue // Enviamos directamente si la declaración es verdadera
  };// Verifica si la respuesta del usuario es correcta

}

export const verificarRespuesta = (declaracionEsVerdadera, respuestaUsuario) => {
  return respuestaUsuario === declaracionEsVerdadera;
};

// Export the config for use in the main component
export { JUEGO1_CONFIG };

