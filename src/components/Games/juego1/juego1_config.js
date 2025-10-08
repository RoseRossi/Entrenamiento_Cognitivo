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
        MAX_SHAPES: 6,         // Número máximo de formas
        SHAPES_LIST: [         // Lista de formas disponibles en orden de aparición
            'cuadrado',
            'triángulo',
            'círculo',
            'estrella',
            'diamante',
            'hexágono'
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

export default JUEGO1_CONFIG;
