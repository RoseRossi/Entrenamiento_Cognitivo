export const patrones = [
  // Matrices 2x2 - punto1
  {
    id: "2x2-1",
    nivel: 1,
    grid: [require("../../../assets/images/games/juego2/matrices2x2/punto1/matriz1.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices2x2/punto1/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices2x2/punto1/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices2x2/punto1/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices2x2/punto1/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices2x2/punto1/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices2x2/punto1/opcion6.svg").default
    ],
    correct: 3,
    recomendacion: "Observa la relación entre las figuras en diagonal. La figura superior izquierda se relaciona con la inferior derecha, al igual que la superior derecha con la que falta."
  },
  // Matrices 2x2 - punto2
  {
    id: "2x2-2",
    nivel: 1,
    grid: [require("../../../assets/images/games/juego2/matrices2x2/punto2/matriz2.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices2x2/punto2/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices2x2/punto2/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices2x2/punto2/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices2x2/punto2/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices2x2/punto2/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices2x2/punto2/opcion6.svg").default
    ],
    correct: 1,
    recomendacion: "Analiza cómo las figuras cambian de posición. Hay un patrón de movimiento sistemático de los elementos dentro de la matriz."
  },

  // Matrices 3x3 - Serie C (C1-C12)
  {
    id: "3x3-C1",
    nivel: 2,
    categoria: "C",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto1/matrizC1.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto1/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto1/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto1/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto1/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto1/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto1/opcion6.svg").default
    ],
    correct: 4,
    recomendacion: "Examina las formas geométricas y cómo progresan en cada fila. Busca el patrón de incremento o transformación gradual de elementos."
  },
  {
    id: "3x3-C2",
    nivel: 2,
    categoria: "C",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto2/matrizC2.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto2/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto2/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto2/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto2/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto2/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto2/opcion6.svg").default
    ],
    correct: 1,
    recomendacion: "Observa la orientación y posición de las figuras. Hay un patrón de rotación o reflexión que se mantiene consistente a través de las filas y columnas."
  },
  {
    id: "3x3-C3",
    nivel: 2,
    categoria: "C",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto3/matrizC3.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto3/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto3/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto3/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto3/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto3/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto3/opcion6.svg").default
    ],
    correct: 1,
    recomendacion: "Fíjate en los elementos que se agregan o quitan en cada casilla. El patrón puede estar en la cantidad o tipo de figuras que aparecen."
  },
  {
    id: "3x3-C4",
    nivel: 2,
    categoria: "C",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto4/matrizC4.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto4/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto4/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto4/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto4/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto4/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto4/opcion6.svg").default
    ],
    correct: 1,
    recomendacion: "Analiza las secuencias horizontales y verticales. Los elementos siguen un orden específico que se repite o alterna de manera predecible."
  },
  {
    id: "3x3-C5",
    nivel: 2,
    categoria: "C",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto5/matrizC5.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto5/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto5/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto5/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto5/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto5/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto5/opcion6.svg").default
    ],
    correct: 0,
    recomendacion: "Busca patrones de simetría o complementariedad. La figura faltante debe completar el equilibrio visual y lógico de la matriz."
  },
  {
    id: "3x3-C6",
    nivel: 2,
    categoria: "C",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto6/matrizC6.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto6/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto6/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto6/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto6/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto6/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto6/opcion6.svg").default
    ],
    correct: 2,
    recomendacion: "Examina las diagonales y cómo se relacionan. El patrón puede seguir direcciones diagonales además de las horizontales y verticales tradicionales."
  },
  {
    id: "3x3-C7",
    nivel: 2,
    categoria: "C",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto7/matrizC7.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto7/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto7/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto7/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto7/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto7/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto7/opcion6.svg").default
    ],
    correct: 0,
    recomendacion: "Cuenta los elementos en cada casilla. El patrón numérico o de cantidad puede ser la clave para encontrar la respuesta correcta."
  },
  {
    id: "3x3-C8",
    nivel: 2,
    categoria: "C",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto8/matrizC8.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto8/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto8/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto8/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto8/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto8/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto8/opcion6.svg").default
    ],
    correct: 3,
    recomendacion: "Observa las transformaciones graduales entre figuras. Los elementos cambian progresivamente siguiendo una secuencia lógica específica."
  },
  {
    id: "3x3-C9",
    nivel: 2,
    categoria: "C",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto9/matrizC9.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto9/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto9/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto9/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto9/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto9/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto9/opcion6.svg").default
    ],
    correct: 2,
    recomendacion: "Busca patrones de combinación entre elementos. Las figuras pueden fusionarse o interactuar siguiendo reglas específicas de superposición."
  },
  {
    id: "3x3-C10",
    nivel: 2,
    categoria: "C",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto10/matrizC10.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto10/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto10/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto10/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto10/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto10/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto10/opcion6.svg").default
    ],
    correct: 1,
    recomendacion: "Analiza la distribución de espacios positivos y negativos. El equilibrio entre áreas llenas y vacías sigue un patrón consistente."
  },
  {
    id: "3x3-C11",
    nivel: 2,
    categoria: "C",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto11/matrizC11.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto11/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto11/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto11/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto11/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto11/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto11/opcion6.svg").default
    ],
    correct: 2,
    recomendacion: "Presta atención a las relaciones entre elementos adyacentes. Cada casilla influye en las casillas vecinas según reglas específicas."
  },
  {
    id: "3x3-C12",
    nivel: 2,
    categoria: "C",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto12/matrizC12.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto12/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto12/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto12/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto12/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto12/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesC/punto12/opcion6.svg").default
    ],
    correct: 4,
    recomendacion: "Busca la lógica de completitud total. La figura faltante debe completar el conjunto de manera que toda la matriz tenga coherencia y equilibrio."
  },

  // Matrices 3x3 - Serie D (D1-D11) - Patrones más complejos
  {
    id: "3x3-D1",
    nivel: 3,
    categoria: "D",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto1/matrizD1.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto1/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto1/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto1/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto1/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto1/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto1/opcion6.svg").default
    ],
    correct: 3,
    recomendacion: "En nivel avanzado, busca múltiples transformaciones simultáneas: rotación, cambio de tamaño y posición ocurren al mismo tiempo."
  },
  {
    id: "3x3-D2",
    nivel: 3,
    categoria: "D",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto2/matrizD2.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto2/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto2/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto2/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto2/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto2/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto2/opcion6.svg").default
    ],
    correct: 5,
    recomendacion: "Analiza patrones de intersección y superposición complejos. Las figuras interactúan siguiendo reglas de combinación avanzadas."
  },
  {
    id: "3x3-D3",
    nivel: 3,
    categoria: "D",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto3/matrizD3.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto3/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto3/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto3/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto3/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto3/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto3/opcion6.svg").default
    ],
    correct: 0,
    recomendacion: "Busca patrones de exclusión y negación. A veces el patrón está en identificar qué elementos NO deben aparecer en la casilla faltante."
  },
  {
    id: "3x3-D4",
    nivel: 3,
    categoria: "D",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto4/matrizD4.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto4/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto4/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto4/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto4/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto4/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto4/opcion6.svg").default
    ],
    correct: 0,
    recomendacion: "Considera patrones de progresión aritmética o geométrica. El número, tamaño o complejidad de elementos puede seguir una secuencia matemática."
  },
  {
    id: "3x3-D5",
    nivel: 3,
    categoria: "D",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto5/matrizD5.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto5/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto5/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto5/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto5/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto5/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto5/opcion6.svg").default
    ],
    correct: 4,
    recomendacion: "Examina patrones de movimiento complejo. Las figuras pueden seguir trayectorias específicas y predecibles a través de toda la matriz."
  },
  {
    id: "3x3-D6",
    nivel: 3,
    categoria: "D",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto6/matrizD6.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto6/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto6/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto6/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto6/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto6/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto6/opcion6.svg").default
    ],
    correct: 1,
    recomendacion: "Busca patrones de transformación condicional. Las reglas de cambio pueden variar según la posición o el contexto de cada elemento."
  },
  {
    id: "3x3-D7",
    nivel: 3,
    categoria: "D",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto7/matrizD7.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto7/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto7/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto7/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto7/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto7/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto7/opcion6.svg").default
    ],
    correct: 2,
    recomendacion: "Analiza la distribución y equilibrio visual. El peso visual y la simetría de los elementos pueden ser factores determinantes."
  },
  {
    id: "3x3-D8",
    nivel: 3,
    categoria: "D",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto8/matrizD8.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto8/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto8/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto8/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto8/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto8/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto8/opcion6.svg").default
    ],
    correct: 0,
    recomendacion: "Considera patrones de alternancia compleja. Múltiples secuencias pueden ejecutarse simultáneamente con diferentes ritmos y reglas."
  },
  {
    id: "3x3-D9",
    nivel: 3,
    categoria: "D",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto9/matrizD9.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto9/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto9/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto9/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto9/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto9/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto9/opcion6.svg").default
    ],
    correct: 0,
    recomendacion: "Busca patrones de composición modular. Elementos independientes se combinan siguiendo reglas específicas para formar configuraciones complejas."
  },
  {
    id: "3x3-D10",
    nivel: 3,
    categoria: "D",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto10/matrizD10.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto10/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto10/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto10/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto10/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto10/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto10/opcion6.svg").default
    ],
    correct: 2,
    recomendacion: "Examina las relaciones de proporcionalidad y escalamiento. Los tamaños relativos de elementos siguen ratios matemáticos específicos."
  },
  {
    id: "3x3-D11",
    nivel: 3,
    categoria: "D",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto11/matrizD11.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto11/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto11/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto11/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto11/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto11/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesD/punto11/opcion6.svg").default
    ],
    correct: 3,
    recomendacion: "Analiza patrones de jerarquía y anidamiento. Elementos que contienen otros elementos siguen sus propias reglas internas de organización."
  },

  // Matrices 3x3 - Serie E (E1-E12) - Patrones expertos
  {
    id: "3x3-E1",
    nivel: 4,
    categoria: "E",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto1/matrizE1.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto1/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto1/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto1/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto1/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto1/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto1/opcion6.svg").default
    ],
    correct: 4,
    recomendacion: "Nivel experto: busca patrones abstractos que involucren múltiples variables simultáneas y transformaciones no lineales complejas."
  },
  {
    id: "3x3-E2",
    nivel: 4,
    categoria: "E",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto2/matrizE2.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto2/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto2/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto2/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto2/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto2/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto2/opcion6.svg").default
    ],
    correct: 0,
    recomendacion: "Considera patrones de emergencia: propiedades que surgen de la interacción compleja entre elementos aparentemente simples."
  },
  {
    id: "3x3-E3",
    nivel: 4,
    categoria: "E",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto3/matrizE3.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto3/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto3/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto3/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto3/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto3/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto3/opcion6.svg").default
    ],
    correct: 4,
    recomendacion: "Busca meta-patrones: patrones que gobiernan cómo otros patrones cambian y evolucionan a través de la matriz."
  },
  {
    id: "3x3-E4",
    nivel: 4,
    categoria: "E",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto4/matrizE4.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto4/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto4/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto4/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto4/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto4/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto4/opcion6.svg").default
    ],
    correct: 0,
    recomendacion: "Analiza sistemas de reglas recursivas: reglas que se aplican a sí mismas en diferentes niveles de abstracción y complejidad."
  },
  {
    id: "3x3-E5",
    nivel: 4,
    categoria: "E",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto5/matrizE5.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto5/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto5/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto5/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto5/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto5/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto5/opcion6.svg").default
    ],
    correct: 2,
    recomendacion: "Considera patrones de invarianza: identifica elementos que permanecen constantes mientras otros elementos cambian sistemáticamente."
  },
  {
    id: "3x3-E6",
    nivel: 4,
    categoria: "E",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto6/matrizE6.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto6/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto6/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto6/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto6/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto6/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto6/opcion6.svg").default
    ],
    correct: 2,
    recomendacion: "Examina patrones de dualidad y complementariedad compleja entre múltiples dimensiones de análisis simultáneo."
  },
  {
    id: "3x3-E7",
    nivel: 4,
    categoria: "E",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto7/matrizE7.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto7/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto7/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto7/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto7/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto7/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto7/opcion6.svg").default
    ],
    correct: 3,
    recomendacion: "Busca patrones de auto-referencia: elementos que se definen en relación a la estructura completa y global de la matriz."
  },
  {
    id: "3x3-E8",
    nivel: 4,
    categoria: "E",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto8/matrizE8.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto8/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto8/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto8/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto8/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto8/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto8/opcion6.svg").default
    ],
    correct: 4,
    recomendacion: "Analiza patrones de optimización: busca la solución que mejor equilibra múltiples criterios y restricciones simultáneas."
  },
  {
    id: "3x3-E9",
    nivel: 4,
    categoria: "E",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto9/matrizE9.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto9/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto9/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto9/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto9/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto9/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto9/opcion6.svg").default
    ],
    correct: 2,
    recomendacion: "Considera patrones de transformación topológica: cambios que preservan ciertas propiedades estructurales fundamentales."
  },
  {
    id: "3x3-E10",
    nivel: 4,
    categoria: "E",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto10/matrizE10.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto10/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto10/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto10/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto10/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto10/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto10/opcion6.svg").default
    ],
    correct: 2,
    recomendacion: "Busca patrones de convergencia: múltiples secuencias independientes que apuntan hacia una configuración específica y única."
  },
  {
    id: "3x3-E11",
    nivel: 4,
    categoria: "E",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto11/matrizE11.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto11/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto11/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto11/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto11/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto11/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto11/opcion6.svg").default
    ],
    correct: 0,
    recomendacion: "Analiza patrones de máxima entropía: la configuración que maximiza la información disponible y minimiza la redundancia."
  },
  {
    id: "3x3-E12",
    nivel: 4,
    categoria: "E",
    grid: [require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto12/matrizE12.svg").default],
    options: [
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto12/opcion1.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto12/opcion2.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto12/opcion3.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto12/opcion4.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto12/opcion5.svg").default,
      require("../../../assets/images/games/juego2/matrices3x3/matricesE/punto12/opcion6.svg").default
    ],
    correct: 3,
    recomendacion: "Busca la síntesis perfecta: la solución que integra armónicamente todos los patrones parciales en una coherencia total y absoluta."
  }
];

// ...resto del código sin cambios...
export const verificarRespuesta = (seleccion, respuestaCorrecta) => {
  return seleccion === respuestaCorrecta;
};

// Función auxiliar para obtener patrones por categoría
export const obtenerPatronesPorCategoria = (categoria) => {
  return patrones.filter(patron => patron.categoria === categoria);
};

// Función auxiliar para obtener patrones por nivel
export const obtenerPatronesPorNivel = (nivel) => {
  return patrones.filter(patron => patron.nivel === nivel);
};

// Función auxiliar para obtener patrones 2x2
export const obtenerPatrones2x2 = () => {
  return patrones.filter(patron => patron.id.includes("2x2"));
};

// Función auxiliar para obtener patrones 3x3
export const obtenerPatrones3x3 = () => {
  return patrones.filter(patron => patron.id.includes("3x3"));
};

// Función para obtener el nombre del nivel basado en el nivel numérico
export const obtenerNombreNivel = (nivel) => {
  const niveles = {
    1: 'Básico',     // Matrices 2x2
    2: 'Intermedio', // Serie C  
    3: 'Avanzado',   // Serie D
    4: 'Experto'     // Serie E
  };
  return niveles[nivel] || 'Desconocido';
};

// Función para determinar el nivel de dificultad basado en el rendimiento
export const determinarNivelDificultad = (matricesCompletadas, precision, nivelMaximo) => {
  // Si completó matrices de la serie E (nivel 4) con buena precisión
  if (nivelMaximo >= 4 && precision >= 80) {
    return 'experto';
  }
  // Si completó matrices de la serie D (nivel 3) con buena precisión  
  else if (nivelMaximo >= 3 && precision >= 70) {
    return 'avanzado';
  }
  // Si completó matrices de la serie C (nivel 2) con precisión decente
  else if (nivelMaximo >= 2 && precision >= 60) {
    return 'intermedio';
  }
  // Por defecto o si solo completó 2x2
  else {
    return 'basico';
  }
};

// Función para obtener descripción del nivel
export const obtenerDescripcionNivel = (nivel) => {
  const descripciones = {
    1: 'Matrices 2x2 - Patrones básicos de reconocimiento',
    2: 'Serie C - Relaciones simples entre elementos', 
    3: 'Serie D - Patrones complejos y transformaciones',
    4: 'Serie E - Razonamiento abstracto avanzado'
  };
  return descripciones[nivel] || '';
};

// Función para obtener tiempo por nivel de dificultad
export const obtenerTiempoPorNivel = (nivel) => {
  const tiempos = {
    1: 50,  // Básico (Matrices 2x2): 50 segundos
    2: 45,  // Intermedio (Serie C): 40-45 segundos 
    3: 35,  // Avanzado (Serie D): 30-35 segundos
    4: 25   // Experto (Serie E): 20-25 segundos
  };
  return tiempos[nivel] || 30; // Por defecto 30 segundos
};