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

export default JUEGO5_CONFIG;
