// Generador de secuencias aleatorias (ej. [2, 4, 1] para nivel 3)
const generarSecuencia = (longitud) => {
    const posiciones = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const secuenciaMezclada = posiciones.sort(() => Math.random() - 0.5);
    return secuenciaMezclada.slice(0, longitud);
  };
  
  // Datos del juego: Secuencias por nivel (longitud creciente)
  export const patrones = Array.from({ length: 10 }, (_, i) => ({
    nivel: i + 1,
    secuencia: generarSecuencia(i + 2), // empieza con longitud 2
    instruccion: "Memoriza los círculos y repítelos en orden inverso",
  }));
  
  // Verifica si la respuesta del usuario es la secuencia invertida
  export const verificarRespuesta = (respuestaUsuario, secuenciaCorrecta) => {
    const secuenciaInvertida = [...secuenciaCorrecta].reverse();
    if (respuestaUsuario.length !== secuenciaInvertida.length) return false;
    return respuestaUsuario.every((val, i) => val === secuenciaInvertida[i]);
  };
  