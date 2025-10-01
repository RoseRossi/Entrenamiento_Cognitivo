// CORRECCIÓN: Generar ejercicios con la cantidad exacta especificada
export const generarEjercicios = () => {
  const ejercicios = [];
  
  // 3 ejercicios de entrenamiento con amplitud 2
  for (let i = 0; i < 3; i++) {
    const secuencia = generarSecuenciaAleatoria(2);
    ejercicios.push({
      amplitud: 2,
      secuencia,
      id: `2_${i + 1}`
    });
  }

  // 5 ejercicios por amplitud desde 3 hasta 8
  for (let amplitud = 3; amplitud <= 8; amplitud++) {
    for (let i = 0; i < 5; i++) {
      const secuencia = generarSecuenciaAleatoria(amplitud);
      ejercicios.push({
        amplitud,
        secuencia,
        id: `${amplitud}_${i + 1}`
      });
    }
  }
  
  return ejercicios;
};

// MEJORA: Generar secuencia aleatoria sin repeticiones (más eficiente)
export const generarSecuenciaAleatoria = (longitud) => {
  const posicionesDisponibles = [...Array(9).keys()]; // [0,1,2,3,4,5,6,7,8]
  const secuencia = [];
  
  for (let i = 0; i < longitud; i++) {
    const indiceAleatorio = Math.floor(Math.random() * posicionesDisponibles.length);
    const posicion = posicionesDisponibles.splice(indiceAleatorio, 1)[0];
    secuencia.push(posicion);
  }
  
  return secuencia;
};

// ARREGLO CRÍTICO: Función de validación sin mutación
export const verificarRespuesta = (respuestaUsuario, secuenciaOriginal) => {
  // Validaciones de entrada
  if (!Array.isArray(respuestaUsuario) || !Array.isArray(secuenciaOriginal)) {
    console.error('verificarRespuesta: Los parámetros deben ser arrays');
    return false;
  }
  
  if (respuestaUsuario.length === 0) {
    return false;
  }
  
  // Crear la secuencia inversa SIN mutar el original
  const secuenciaInversa = [...secuenciaOriginal].reverse();
  
  // Comparar longitudes
  if (respuestaUsuario.length !== secuenciaInversa.length) {
    return false;
  }
  
  // Comparar elemento por elemento
  return respuestaUsuario.every((valor, index) => valor === secuenciaInversa[index]);
};

// Función auxiliar para debugging
export const obtenerSecuenciaInversa = (secuenciaOriginal) => {
  if (!Array.isArray(secuenciaOriginal)) {
    return [];
  }
  return [...secuenciaOriginal].reverse();
};

// Validar configuración de ejercicio
export const validarEjercicio = (ejercicio) => {
  if (!ejercicio) {
    throw new Error('Ejercicio no puede ser null o undefined');
  }
  
  if (!ejercicio.secuencia || !Array.isArray(ejercicio.secuencia)) {
    throw new Error('Ejercicio debe tener una secuencia válida');
  }
  
  if (typeof ejercicio.amplitud !== 'number' || ejercicio.amplitud < 2 || ejercicio.amplitud > 8) {
    throw new Error('Amplitud debe ser un número entre 2 y 8');
  }
  
  if (ejercicio.secuencia.length !== ejercicio.amplitud) {
    throw new Error('La longitud de la secuencia debe coincidir con la amplitud');
  }
  
  return true;
};

// Función para analizar rendimiento
export const analizarRendimiento = (ejerciciosDetallados) => {
  if (!Array.isArray(ejerciciosDetallados) || ejerciciosDetallados.length === 0) {
    return {
      amplitudMaxima: 2,
      porcentajePrecision: 0,
      ejerciciosCorrectos: 0,
      rendimientoPorAmplitud: {}
    };
  }
  
  const ejerciciosCorrectos = ejerciciosDetallados.filter(e => e.correcto);
  const amplitudMaxima = ejerciciosCorrectos.length > 0 ? 
    Math.max(...ejerciciosCorrectos.map(e => e.amplitud)) : 2;
  const porcentajePrecision = Math.round((ejerciciosCorrectos.length / ejerciciosDetallados.length) * 100);
  
  // Analizar rendimiento por amplitud
  const rendimientoPorAmplitud = {};
  for (let amp = 2; amp <= 8; amp++) {
    const ejerciciosAmplitud = ejerciciosDetallados.filter(e => e.amplitud === amp);
    if (ejerciciosAmplitud.length > 0) {
      const correctosAmplitud = ejerciciosAmplitud.filter(e => e.correcto).length;
      rendimientoPorAmplitud[amp] = {
        intentos: ejerciciosAmplitud.length,
        aciertos: correctosAmplitud,
        porcentaje: Math.round((correctosAmplitud / ejerciciosAmplitud.length) * 100)
      };
    }
  }
  
  return {
    amplitudMaxima,
    porcentajePrecision,
    ejerciciosCorrectos: ejerciciosCorrectos.length,
    rendimientoPorAmplitud
  };
};

// Función auxiliar para verificar la cantidad total de ejercicios
export const verificarCantidadEjercicios = () => {
  const ejercicios = generarEjercicios();
  const resumen = {
    total: ejercicios.length,
    porAmplitud: {}
  };
  
  for (let amp = 2; amp <= 8; amp++) {
    const cantidad = ejercicios.filter(e => e.amplitud === amp).length;
    resumen.porAmplitud[amp] = cantidad;
  }
  
  console.log('📊 Resumen de ejercicios generados:', resumen);
  // Debería mostrar: 
  // total: 33 (3 + 5*6 = 3 + 30)
  // porAmplitud: { 2: 3, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5 }
  
  return resumen;
};