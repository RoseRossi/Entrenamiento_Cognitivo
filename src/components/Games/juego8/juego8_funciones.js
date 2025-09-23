// Genera dinámicamente ejercicios con amplitudes de 2 a 8
export const generarEjercicios = () => {
  const ejercicios = [];

  // 3 ejercicios de entrenamiento con amplitud 2
  for (let i = 0; i < 3; i++) {
    ejercicios.push({
      amplitud: 2,
      secuencia: generarSecuenciaAleatoria(2)
    });
  }

  // 5 ejercicios por amplitud desde 3 hasta 8
  for (let amplitud = 3; amplitud <= 8; amplitud++) {
    for (let i = 0; i < 5; i++) {
      ejercicios.push({
        amplitud,
        secuencia: generarSecuenciaAleatoria(amplitud)
      });
    }
  }

  return ejercicios;
};

// Genera una secuencia aleatoria sin repeticiones de posiciones del 0 al 8
export const generarSecuenciaAleatoria = (longitud) => {
  const posiciones = [...Array(9).keys()]; // [0,1,2,3,4,5,6,7,8]
  const secuencia = [];

  while (secuencia.length < longitud) {
    const indice = Math.floor(Math.random() * posiciones.length);
    const valor = posiciones[indice];
    if (!secuencia.includes(valor)) {
      secuencia.push(valor);
    }
  }

  return secuencia;
};

  
// Verifica si la respuesta ingresada es igual a la secuencia inversa
export const verificarRespuesta = (respuesta, secuenciaOriginal) => {
  const invertida = [...secuenciaOriginal].reverse();
  return JSON.stringify(respuesta) === JSON.stringify(invertida);
};
