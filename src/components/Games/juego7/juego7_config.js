// Configuración central para Juego7 (Bloques de Corsi - Memoria Visuoespacial)
// Actualizar estos valores para cambiar el comportamiento del juego sin editar el componente principal

const JUEGO7_CONFIG = {
    START_LEVEL: 1,
    MAX_LEVEL: 3,

    // Reglas de progresión
    ACIERTOS_PARA_AUMENTAR: 3, // Número de aciertos consecutivos para aumentar la secuencia
    FALLOS_CONSECUTIVOS_PARA_TERMINAR: 2, // Número de fallos consecutivos en el mismo nivel de amplitud

    LEVELS: {
        BASICO: {
            nombre: 'Básico',
            numCirculos: 8,
            tiempoResaltado: 400, // ms
            tiempoEntrePasos: 400, // ms - pausa entre cada resaltado
            secuenciaInicial: 3 // longitud inicial de la secuencia
        },
        INTERMEDIO: {
            nombre: 'Intermedio',
            numCirculos: 10,
            tiempoResaltado: 333, // ms
            tiempoEntrePasos: 333, // ms
            secuenciaInicial: 3
        },
        AVANZADO: {
            nombre: 'Avanzado',
            numCirculos: 12,
            tiempoResaltado: 300, // ms
            tiempoEntrePasos: 300, // ms
            secuenciaInicial: 4
        }
    }
};

export default JUEGO7_CONFIG;
