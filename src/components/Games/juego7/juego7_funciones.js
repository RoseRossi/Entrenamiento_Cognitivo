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

// Genera posiciones aleatorias para los círculos sin sobreposición
// @param {number} cantidad - Número de círculos a generar
// @returns {Array} Array de objetos con posiciones {top, left}
export const generarCirculos = (cantidad) => {
  const posiciones = [];
  const minDistancia = 12; // Distancia mínima entre círculos para evitar sobreposición

  while (posiciones.length < cantidad) {
    const top = Math.floor(Math.random() * 80) + "%";
    const left = Math.floor(Math.random() * 80) + "%";
    const nueva = { top, left };

    // Verificar que no haya sobreposición con círculos existentes
    const hayColision = posiciones.some(p =>
      Math.abs(parseInt(p.top) - parseInt(nueva.top)) < minDistancia &&
      Math.abs(parseInt(p.left) - parseInt(nueva.left)) < minDistancia
    );

    if (!hayColision) {
      posiciones.push(nueva);
    }
  }

  return posiciones;
};

// Genera una secuencia aleatoria de índices de círculos
// @param {number} max - Número máximo de círculos disponibles
// @param {number} longitud - Longitud de la secuencia a generar
// @returns {Array} Array de índices que representan la secuencia
export const generarSecuencia = (max, longitud) => {
  const secuencia = [];
  while (secuencia.length < longitud) {
    const indice = Math.floor(Math.random() * max);
    secuencia.push(indice);
  }
  return secuencia;
};

// Export the config for use in the main component
export { JUEGO7_CONFIG };