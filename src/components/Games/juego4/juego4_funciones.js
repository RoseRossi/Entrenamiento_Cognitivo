let indicesNivel = {
  1: 0,
  2: 0, 
  3: 0,
  4: 0
};


// ===== TODOS LOS EJERCICIOS DEL CUADERNILLO WAIS-IV =====
export const ejerciciosWAIS = [
  // ===== NIVEL 1: RELACIONES BÁSICAS 1:1 (6 ejercicios) =====
  {
    id: "wais_01",
    nivel: 1,
    balanza1: {
      izquierda: [{figura: 'cuadrado', cantidad: 1}],
      derecha: [{figura: 'circulo', cantidad: 2}]
    },
    balanza2: {
      izquierda: [{figura: 'triangulo', cantidad: 2}],
      derecha: [{figura: 'circulo', cantidad: 4}]
    },
    problema: {
      izquierda: [{figura: 'cuadrado', cantidad: 2}]
    },
    opciones: [
      {figura: 'circulo', cantidad: 2}, //   Correcta (Opción 1)
      {figura: 'cuadrado', cantidad: 1},
      {figura: 'triangulo', cantidad: 2}, 
      {figura: 'circulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 2}
    ],
    respuestaCorrecta: 0
  },

  {
    id: "wais_02", 
    nivel: 1,
    balanza1: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'estrella', cantidad: 1}]
    },
    balanza2: {
      izquierda: [{figura: 'cuadrado', cantidad: 2}],
      derecha: [{figura: 'estrella', cantidad: 2}]
    },
    problema: {
      izquierda: [{figura: 'estrella', cantidad: 1}]
    },
    opciones: [
      {figura: 'triangulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 1}, //   Correcta (Opción 2)
      {figura: 'triangulo', cantidad: 2},
      {figura: 'circulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 2}
    ],
    respuestaCorrecta: 1
  },

  {
    id: "wais_03",
    nivel: 1,
    balanza1: {
      izquierda: [{figura: 'triangulo', cantidad: 1}, {figura: 'cuadrado', cantidad: 1}],
      derecha: [{figura: 'circulo', cantidad: 1}]
    },
    balanza2: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 2}]
    },
    problema: {
      izquierda: [{figura: 'circulo', cantidad: 1}]
    },
    opciones: [
      {figura: 'triangulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 1},
      {figura: 'triangulo', cantidad: 2},
      {figura: 'cuadrado', cantidad: 3}, //   Correcta (Opción 4)
      {figura: 'circulo', cantidad: 1}
    ],
    respuestaCorrecta: 3
  },

  {
    id: "wais_04",
    nivel: 1,
    balanza1: {
      izquierda: [{figura: 'circulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 1}]
    },
    balanza2: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 2}]
    },
    problema: {
      izquierda: [{figura: 'circulo', cantidad: 1}, {figura: 'triangulo', cantidad: 1}]
    },
    opciones: [
      {figura: 'cuadrado', cantidad: 1},
      {figura: 'triangulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 4},
      {figura: 'circulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 3} //   Correcta (Opción 5)
    ],
    respuestaCorrecta: 4
  },

  {
    id: "wais_05",
    nivel: 1,
    balanza1: {
      izquierda: [{figura: 'estrella', cantidad: 1}],
      derecha: [{figura: 'circulo', cantidad: 2}]
    },
    balanza2: {
      izquierda: [{figura: 'triangulo', cantidad: 2}],
      derecha: [{figura: 'circulo', cantidad: 2}]
    },
    problema: {
      izquierda: [{figura: 'estrella', cantidad: 1}]
    },
    opciones: [
      {figura: 'circulo', cantidad: 4},
      {figura: 'triangulo', cantidad: 1},
      {figura: 'circulo', cantidad: 2},
      {figura: 'estrella', cantidad: 1},
      {figura: 'triangulo', cantidad: 2} //   Correcta (Opción 5)
    ],
    respuestaCorrecta: 4
  },

  {
    id: "wais_06",
    nivel: 1,
    balanza1: {
      izquierda: [{figura: 'circulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 1}]
    },
    balanza2: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 2}]
    },
    problema: {
      izquierda: [{figura: 'circulo', cantidad: 1}, {figura: 'triangulo', cantidad: 1}]
    },
    opciones: [
      {figura: 'cuadrado', cantidad: 1},
      {figura: 'triangulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 4},
      {figura: 'circulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 3} //   Correcta (Opción 5)
    ],
    respuestaCorrecta: 4
  },

  // ===== NIVEL 2: RELACIONES PROPORCIONALES (8 ejercicios) =====
  {
    id: "wais_07",
    nivel: 2,
    balanza1: {
      izquierda: [{figura: 'triangulo', cantidad: 1}], 
      derecha: [{figura: 'cuadrado', cantidad: 2}]
    },
    balanza2: {
      izquierda: [{figura: 'cuadrado', cantidad: 3}],
      derecha: [{figura: 'estrella', cantidad: 1}]
    },
    problema: {
      izquierda: [{figura: 'triangulo', cantidad: 2}]
    },
    opciones: [
      {figura: 'estrella', cantidad: 1},
      {figura: 'cuadrado', cantidad: 4}, //   Correcta (Opción 2)
      {figura: 'estrella', cantidad: 2},
      {figura: 'cuadrado', cantidad: 6},
      {figura: 'triangulo', cantidad: 4}
    ],
    respuestaCorrecta: 1
  },

  {
    id: "wais_08",
    nivel: 2,
    balanza1: {
      izquierda: [{figura: 'circulo', cantidad: 2}],
      derecha: [{figura: 'triangulo', cantidad: 1}]
    },
    balanza2: {
      izquierda: [{figura: 'cuadrado', cantidad: 1}],
      derecha: [{figura: 'circulo', cantidad: 3}]
    },
    problema: {
      izquierda: [{figura: 'triangulo', cantidad: 1}]
    },
    opciones: [
      {figura: 'cuadrado', cantidad: 2},
      {figura: 'circulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 1},
      {figura: 'circulo', cantidad: 6}, //   Correcta (Opción 4)
      {figura: 'triangulo', cantidad: 2}
    ],
    respuestaCorrecta: 3
  },

  {
    id: "wais_09",
    nivel: 2,
    balanza1: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'circulo', cantidad: 3}, {figura: 'cuadrado', cantidad: 1}]
    },
    balanza2: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 2}]
    },
    problema: {
      izquierda: [{figura: 'estrella', cantidad: 1}]
    },
    opciones: [
      {figura: 'circulo', cantidad: 2},
      {figura: 'triangulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 1}, //   Correcta (Opción 3)
      {figura: 'circulo', cantidad: 1},
      {figura: 'estrella', cantidad: 1}
    ],
    respuestaCorrecta: 2
  },

  {
    id: "wais_10",
    nivel: 2,
    balanza1: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 1}, {figura: 'circulo', cantidad: 1}]
    },
    balanza2: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 2}]
    },
    problema: {
      izquierda: [{figura: 'cuadrado', cantidad: 1}]
    },
    opciones: [
      {figura: 'cuadrado', cantidad: 1},
      {figura: 'triangulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 4},
      {figura: 'circulo', cantidad: 1}, //   Correcta (Opción 4)
      {figura: 'cuadrado', cantidad: 2}
    ],
    respuestaCorrecta: 3
  },

  {
    id: "wais_11",
    nivel: 2,
    balanza1: {
      izquierda: [{figura: 'triangulo', cantidad: 1}, {figura: 'cuadrado', cantidad: 1}],
      derecha: [{figura: 'circulo', cantidad: 1}]
    },
    balanza2: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'circulo', cantidad: 2}]
    },
    problema: {
      izquierda: [{figura: 'cuadrado', cantidad: 1}]
    },
    opciones: [
      {figura: 'cuadrado', cantidad: 1},
      {figura: 'triangulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 4},
      {figura: 'circulo', cantidad: 1}, //   Correcta (Opción 4)
      {figura: 'cuadrado', cantidad: 2}
    ],
    respuestaCorrecta: 3
  },

  {
    id: "wais_12",
    nivel: 2,
    balanza1: {
      izquierda: [{figura: 'estrella', cantidad: 1}],
      derecha: [{figura: 'triangulo', cantidad: 2}, {figura: 'circulo', cantidad: 2}]
    },
    balanza2: {
      izquierda: [{figura: 'estrella', cantidad: 1}],
      derecha: [{figura: 'triangulo', cantidad: 3}]
    },
    problema: {
      izquierda: [{figura: 'estrella', cantidad: 1}]
    },
    opciones: [
      {figura: 'circulo', cantidad: 1},
      {figura: 'estrella', cantidad: 2},
      {figura: 'triangulo', cantidad: 1},
      {figura: 'circulo', cantidad: 3},
      {figura: 'circulo', cantidad: 2} //   Correcta (Opción 5)
    ],
    respuestaCorrecta: 4
  },

  {
    id: "wais_13",
    nivel: 2,
    balanza1: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 3}]
    },
    balanza2: {
      izquierda: [{figura: 'cuadrado', cantidad: 2}],
      derecha: [{figura: 'circulo', cantidad: 6}]
    },
    problema: {
      izquierda: [{figura: 'triangulo', cantidad: 1}]
    },
    opciones: [
      {figura: 'circulo', cantidad: 6},
      {figura: 'cuadrado', cantidad: 4},
      {figura: 'circulo', cantidad: 9}, //   Correcta (Opción 3)
      {figura: 'cuadrado', cantidad: 9},
      {figura: 'circulo', cantidad: 4}
    ],
    respuestaCorrecta: 2
  },

  {
    id: "wais_14",
    nivel: 2,
    balanza1: {
      izquierda: [{figura: 'triangulo', cantidad: 1}, {figura: 'cuadrado', cantidad: 1}],
      derecha: [{figura: 'circulo', cantidad: 2}]
    },
    balanza2: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'circulo', cantidad: 1}]
    },
    problema: {
      izquierda: [{figura: 'triangulo', cantidad: 1}]
    },
    opciones: [
      {figura: 'circulo', cantidad: 2},
      {figura: 'cuadrado', cantidad: 1}, //   Correcta (Opción 2)
      {figura: 'triangulo', cantidad: 2},
      {figura: 'circulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 2}
    ],
    respuestaCorrecta: 1
  },

  // ===== NIVEL 3: COMBINACIONES COMPLEJAS (6 ejercicios) =====
  {
    id: "wais_15",
    nivel: 3,
    balanza1: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 2}]
    },
    balanza2: {
      izquierda: [{figura: 'cuadrado', cantidad: 2}],
      derecha: [{figura: 'circulo', cantidad: 2}]
    },
    problema: {
      izquierda: [{figura: 'triangulo', cantidad: 2}]
    },
    opciones: [
      {figura: 'triangulo', cantidad: 2},
      {figura: 'cuadrado', cantidad: 2}, //   Correcta (Opción 2)
      {figura: 'circulo', cantidad: 3},
      {figura: 'cuadrado', cantidad: 4},
      {figura: 'circulo', cantidad: 2}
    ],
    respuestaCorrecta: 1
  },

  {
    id: "wais_16",
    nivel: 3,
    balanza1: {
      izquierda: [{figura: 'cuadrado', cantidad: 2}],
      derecha: [{figura: 'circulo', cantidad: 2}]
    },
    balanza2: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 1}]
    },
    problema: {
      izquierda: [{figura: 'cuadrado', cantidad: 1}]
    },
    opciones: [
      {figura: 'cuadrado', cantidad: 2},
      {figura: 'circulo', cantidad: 1}, //   Correcta (Opción 2)
      {figura: 'triangulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 1},
      {figura: 'circulo', cantidad: 1}
    ],
    respuestaCorrecta: 1
  },

  {
    id: "wais_17",
    nivel: 3,
    balanza1: {
      izquierda: [{figura: 'triangulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 3}]
    },
    balanza2: {
      izquierda: [{figura: 'cuadrado', cantidad: 2}],
      derecha: [{figura: 'circulo', cantidad: 6}]
    },
    problema: {
      izquierda: [{figura: 'triangulo', cantidad: 1}]
    },
    opciones: [
      {figura: 'circulo', cantidad: 6},
      {figura: 'cuadrado', cantidad: 4},
      {figura: 'circulo', cantidad: 9}, //   Correcta (Opción 3)
      {figura: 'cuadrado', cantidad: 9},
      {figura: 'circulo', cantidad: 4}
    ],
    respuestaCorrecta: 2
  },

  {
    id: "wais_18",
    nivel: 3,
    balanza1: {
      izquierda: [{figura: 'circulo', cantidad: 3}],
      derecha: [{figura: 'cuadrado', cantidad: 6}]
    },
    balanza2: {
      izquierda: [{figura: 'cuadrado', cantidad: 4}],
      derecha: [{figura: 'circulo', cantidad: 2}]
    },
    problema: {
      izquierda: [{figura: 'cuadrado', cantidad: 1}]
    },
    opciones: [
      {figura: 'circulo', cantidad: 9},
      {figura: 'cuadrado', cantidad: 2},
      {figura: 'circulo', cantidad: 2},
      {figura: 'cuadrado', cantidad: 4},
      {figura: 'circulo', cantidad: 6} //   Correcta (Opción 5)
    ],
    respuestaCorrecta: 4
  },

  {
    id: "wais_19",
    nivel: 3,
    balanza1: {
      izquierda: [{figura: 'circulo', cantidad: 2}],
      derecha: [{figura: 'cuadrado', cantidad: 1}]
    },
    balanza2: {
      izquierda: [{figura: 'cuadrado', cantidad: 1}],
      derecha: [{figura: 'circulo', cantidad: 1}]
    },
    problema: {
      izquierda: [{figura: 'circulo', cantidad: 1}]
    },
    opciones: [
      {figura: 'cuadrado', cantidad: 1},
      {figura: 'circulo', cantidad: 2},
      {figura: 'cuadrado', cantidad: 3},
      {figura: 'circulo', cantidad: 1}, //   Correcta (Opción 4)
      {figura: 'cuadrado', cantidad: 1}
    ],
    respuestaCorrecta: 3
  },

  {
    id: "wais_20",
    nivel: 3,
    balanza1: {
      izquierda: [{figura: 'diamante', cantidad: 1}],
      derecha: [{figura: 'circulo', cantidad: 2}]
    },
    balanza2: {
      izquierda: [{figura: 'diamante', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 2}]
    },
    problema: {
      izquierda: [{figura: 'cuadrado', cantidad: 1}]
    },
    opciones: [
      {figura: 'diamante', cantidad: 1},
      {figura: 'circulo', cantidad: 2},
      {figura: 'cuadrado', cantidad: 2},
      {figura: 'diamante', cantidad: 2},
      {figura: 'circulo', cantidad: 1} //   Correcta (Opción 5)
    ],
    respuestaCorrecta: 4
  },

  // ===== NIVEL 4: RELACIONES MÚLTIPLES (5 ejercicios) =====
  {
    id: "wais_21",
    nivel: 4,
    balanza1: {
      izquierda: [{figura: 'diamante', cantidad: 1}],
      derecha: [{figura: 'circulo', cantidad: 6}]
    },
    balanza2: {
      izquierda: [{figura: 'diamante', cantidad: 2}],
      derecha: [{figura: 'circulo', cantidad: 6}]
    },
    problema: {
      izquierda: [{figura: 'cuadrado', cantidad: 1}]
    },
    opciones: [
      {figura: 'circulo', cantidad: 6},
      {figura: 'diamante', cantidad: 2},
      {figura: 'circulo', cantidad: 3},
      {figura: 'cuadrado', cantidad: 2},
      {figura: 'circulo', cantidad: 6} //   Correcta (Opción 5)
    ],
    respuestaCorrecta: 4
  },

  {
    id: "wais_22",
    nivel: 4,
    balanza1: {
      izquierda: [{figura: 'cuadrado', cantidad: 1}],
      derecha: [{figura: 'circulo', cantidad: 3}]
    },
    balanza2: {
      izquierda: [{figura: 'cuadrado', cantidad: 2}],
      derecha: [{figura: 'circulo', cantidad: 4}]
    },
    problema: {
      izquierda: [{figura: 'circulo', cantidad: 2}]
    },
    opciones: [
      {figura: 'circulo', cantidad: 2},
      {figura: 'circulo', cantidad: 3},
      {figura: 'circulo', cantidad: 4}, //   Correcta (Opción 3)
      {figura: 'circulo', cantidad: 2},
      {figura: 'circulo', cantidad: 5}
    ],
    respuestaCorrecta: 2
  },

  {
    id: "wais_23",
    nivel: 4,
    balanza1: {
      izquierda: [{figura: 'circulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 1}]
    },
    balanza2: {
      izquierda: [{figura: 'circulo', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 1}]
    },
    problema: {
      izquierda: [{figura: 'circulo', cantidad: 1}]
    },
    opciones: [
      {figura: 'cuadrado', cantidad: 2},
      {figura: 'circulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 1}, //   Correcta (Opción 3)
      {figura: 'circulo', cantidad: 4},
      {figura: 'cuadrado', cantidad: 1}
    ],
    respuestaCorrecta: 2
  },

  {
    id: "wais_24",
    nivel: 4,
    balanza1: {
      izquierda: [{figura: 'diamante', cantidad: 2}],
      derecha: [{figura: 'circulo', cantidad: 2}]
    },
    balanza2: {
      izquierda: [{figura: 'diamante', cantidad: 2}],
      derecha: [{figura: 'cuadrado', cantidad: 4}]
    },
    problema: {
      izquierda: [{figura: 'diamante', cantidad: 1}]
    },
    opciones: [
      {figura: 'diamante', cantidad: 1},
      {figura: 'circulo', cantidad: 2},
      {figura: 'circulo', cantidad: 1},
      {figura: 'triangulo', cantidad: 1},
      {figura: 'diamante', cantidad: 1}
    ],
    respuestaCorrecta: 2
  },

  {
    id: "wais_25",
    nivel: 4,
    balanza1: {
      izquierda: [{figura: 'estrella', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 3}]
    },
    balanza2: {
      izquierda: [{figura: 'estrella', cantidad: 1}],
      derecha: [{figura: 'cuadrado', cantidad: 1}]
    },
    problema: {
      izquierda: [{figura: 'cuadrado', cantidad: 1}]
    },
    opciones: [
      {figura: 'cuadrado', cantidad: 2},
      {figura: 'circulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 3},
      {figura: 'triangulo', cantidad: 1},
      {figura: 'cuadrado', cantidad: 1} //   Correcta (Opción 5)
    ],
    respuestaCorrecta: 4
  }
];

// Función para obtener ejercicios por nivel
export const obtenerEjerciciosPorNivel = (nivel) => {
  return ejerciciosWAIS.filter(ejercicio => ejercicio.nivel === nivel);
};

export const niveles = [
  {
    id: 1,
    nombre: "Básico",
    tiempo: 600, //   10 minutos TOTAL para toda la prueba
    ensayos: obtenerEjerciciosPorNivel(1),
    descripcion: "Relaciones simples 1:1"
  },
  {
    id: 2, 
    nombre: "Intermedio",
    tiempo: 600, // El mismo tiempo continúa corriendo
    ensayos: obtenerEjerciciosPorNivel(2),
    descripcion: "Relaciones proporcionales"
  },
  {
    id: 3,
    nombre: "Avanzado", 
    tiempo: 600, // El mismo tiempo continúa corriendo
    ensayos: obtenerEjerciciosPorNivel(3),
    descripcion: "Combinaciones complejas"
  },
  {
    id: 4,
    nombre: "Experto",
    tiempo: 600, // El mismo tiempo continúa corriendo
    ensayos: obtenerEjerciciosPorNivel(4),
    descripcion: "Relaciones múltiples"
  }
];

export const obtenerEnsayo = (nivelActual, reiniciar = false) => {
  //   VALIDACIONES de entrada
  if (!nivelActual || nivelActual < 1 || nivelActual > 4) {
    console.error(`Nivel inválido: ${nivelActual}`);
    return null;
  }

  // Reiniciar índices si es necesario
  if (reiniciar) {
    indicesNivel = { 1: 0, 2: 0, 3: 0, 4: 0 };
    console.log('🔄 Índices reiniciados');
  }

  const nivel = niveles[nivelActual - 1];
  if (!nivel || !nivel.ensayos || nivel.ensayos.length === 0) {
    console.error(`No hay ensayos para el nivel ${nivelActual}`);
    return null;
  }
  
  const indiceActual = indicesNivel[nivelActual];
  
  if (indiceActual >= nivel.ensayos.length) {
    console.log(`🏁 Completados todos los ensayos del nivel ${nivelActual}`);
    return null;
  }
  
  const ensayoSecuencial = nivel.ensayos[indiceActual];
  
  //   VALIDAR que el ensayo sea válido
  if (!ensayoSecuencial || !ensayoSecuencial.opciones || ensayoSecuencial.opciones.length === 0) {
    console.error(`Ensayo inválido en nivel ${nivelActual}, índice ${indiceActual}`);
    return null;
  }
  
  indicesNivel[nivelActual]++;
  
  console.log(`🎯 Ensayo obtenido para nivel ${nivelActual}: ${ensayoSecuencial.id} (${indiceActual + 1}/${nivel.ensayos.length})`);
  return ensayoSecuencial;
};

export const verificarRespuesta = (ensayo, opcionSeleccionada) => {
  // Validaciones exhaustivas
  if (!ensayo) {
    console.error('Ensayo es null o undefined');
    return false;
  }
  
  if (!ensayo.opciones || !Array.isArray(ensayo.opciones)) {
    console.error('Ensayo sin opciones válidas');
    return false;
  }
  
  if (typeof ensayo.respuestaCorrecta !== 'number' || 
      ensayo.respuestaCorrecta < 0 || 
      ensayo.respuestaCorrecta >= ensayo.opciones.length) {
    console.error('Índice de respuesta correcta inválido');
    return false;
  }
  
  if (!opcionSeleccionada || !opcionSeleccionada.figura) {
    console.error('Opción seleccionada inválida');
    return false;
  }
  
  const opcionCorrecta = ensayo.opciones[ensayo.respuestaCorrecta];
  
  if (!opcionCorrecta) {
    console.error('No se pudo obtener la opción correcta');
    return false;
  }
  
  const esCorrecta = opcionSeleccionada.figura === opcionCorrecta.figura && 
                     opcionSeleccionada.cantidad === opcionCorrecta.cantidad;
  
  console.log(`🔍 Verificación:`, {
    ensayoId: ensayo.id,
    seleccionada: opcionSeleccionada,
    correcta: opcionCorrecta,
    resultado: esCorrecta
  });
  
  return esCorrecta;
};

// Función para verificar si hay más ensayos en el nivel
export const hayMasEnsayosEnNivel = (nivelActual) => {
  const nivel = niveles[nivelActual - 1];
  if (!nivel) return false;
  
  return indicesNivel[nivelActual] < nivel.ensayos.length;
};

// Función para obtener progreso del nivel actual
export const getProgresoNivel = (nivelActual) => {
  const nivel = niveles[nivelActual - 1];
  if (!nivel) return { actual: 0, total: 0 };
  
  return {
    actual: indicesNivel[nivelActual],
    total: nivel.ensayos.length
  };
};
