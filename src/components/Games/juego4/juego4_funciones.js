// Generador de niveles
const generarNiveles = () => {
  return [
    {
      id: 1,
      nombre: "Nivel Básico",
      tiempo: 120,
      descripcion: "Relaciones simples entre figuras",
      ensayos: [
        {
          balanza1: {
            izquierda: [{ figura: "cuadrado", cantidad: 2 }],
            derecha: [{ figura: "circulo", cantidad: 3 }],
          },
          balanza2: {
            izquierda: [{ figura: "triangulo", cantidad: 2 }],
            derecha: [{ figura: "circulo", cantidad: 3 }],
          },
          problema: {
            izquierda: [{ figura: "cuadrado", cantidad: 2 }],
            derecha: [],
          },
          opciones: [
            { figura: "cuadrado", cantidad: 2 },
            { figura: "triangulo", cantidad: 2 },
            { figura: "circulo", cantidad: 3 },
            { figura: "triangulo", cantidad: 3 },
            { figura: "triangulo", cantidad: 1 },
          ],
          respuestaCorrecta: { figura: "triangulo", cantidad: 2 },
        },
        {
          balanza1: {
            izquierda: [{ figura: "cuadrado", cantidad: 2 }],
            derecha: [{ figura: "circulo", cantidad: 3 }],
          },
          balanza2: {
            izquierda: [{ figura: "diamante", cantidad: 2 }],
            derecha: [{ figura: "circulo", cantidad: 3 }],
          },
          problema: {
            izquierda: [{ figura: "cuadrado", cantidad: 2 }],
            derecha: [],
          },
          opciones: [
            { figura: "diamante", cantidad: 2 },
            { figura: "cuadrado", cantidad: 2 },
            { figura: "circulo", cantidad: 3 },
            { figura: "diamante", cantidad: 3 },
            { figura: "diamante", cantidad: 1 },
          ],
          respuestaCorrecta: { figura: "diamante", cantidad: 2 },
        },
        {
          balanza1: {
            izquierda: [{ figura: "cruz", cantidad: 1 }],
            derecha: [{ figura: "triangulo", cantidad: 2 }]
          },
          balanza2: {
            izquierda: [{ figura: "triangulo", cantidad: 1 }],
            derecha: [{ figura: "rectangulo", cantidad: 1 },
                      { figura: "circulo", cantidad: 1 }]
          },
          problema: {
            izquierda: [{ figura: "triangulo", cantidad: 2}],
            derecha: []
          },
          opciones: [
            { figura: "cruz", cantidad: 1},
            { figura: "triangulo", cantidad: 1},
            { figura: "rectangulo", cantidad: 1},
            { figura: "circulo", cantidad: 1 },
            { figura: "circulo", cantidad: 3 }
          ],
          respuestaCorrecta: { figura: "rectangulo", cantidad: 1
          }
        },
      ],
    },
    {
      id: 2,
      nombre: "Nivel Intermedio",
      tiempo: 90,
      descripcion: "Relaciones más complejas",
      ensayos: [
        {
          balanza1: {
            izquierda: [{ figura: "triangulo", cantidad: 2 }, { figura: "cuadrado", cantidad: 1 }],
            derecha: [{ figura: "circulo", cantidad: 2 }],
          },
          balanza2: {
            izquierda: [{ figura: "triangulo", cantidad: 4 }, { figura: "cuadrado", cantidad: 2 }],
            derecha: [{ figura: "circulo", cantidad: 4 }],
          },
          problema: {
            izquierda: [{ figura: "triangulo", cantidad: 3 }, { figura: "cuadrado", cantidad: 1 }],
            derecha: [],
          },
          opciones: [
            { figura: "circulo", cantidad: 3 }, 
            { figura: "triangulo", cantidad: 3 },
            { figura: "cuadrado", cantidad: 4 },
            { figura: "circulo", cantidad: 2 },
            { figura: "triangulo", cantidad: 2 },
          ],
          respuestaCorrecta: { figura: "circulo", cantidad: 3 },
        },
        {
          balanza1: {
            izquierda: [{ figura: "estrella", cantidad: 1 }],
            derecha: [{ figura: "circulo", cantidad: 2 }]
          },
          balanza2: {
            izquierda: [{ figura: "triangulo", cantidad: 2 }],
            derecha: [{ figura: "circulo", cantidad: 2 }]
          },
          problema: {
            izquierda: [{ figura: "estrella", cantidad: 3 }],
            derecha: []
          },
          opciones: [
            { figura: "circulo", cantidad: 4 },
            { figura: "triangulo", cantidad: 3 },
            { figura: "estrella", cantidad: 1 },
            { figura: "triangulo", cantidad: 2 }
          ],
          respuestaCorrecta: { figura: "triangulo", cantidad: 3 }
        },
        {
          balanza1: {
            izquierda: [{ figura: "triangulo", cantidad: 1 }],
            derecha: [{ figura: "estrella", cantidad: 2 }]
          },
          balanza2: {
            izquierda: [{ figura: "cuadrado", cantidad: 2 }],
            derecha: [{ figura: "estrella", cantidad: 2 }]
          },
          problema: {
            izquierda: [{ figura: "estrella", cantidad: 3 }, { figura: "cuadrado", cantidad: 1 }],
            derecha: []
          },
          opciones: [
            { figura: "estrella", cantidad: 2 },
            { figura: "estrella", cantidad: 1 },
            { figura: "triangulo", cantidad: 1 },
            { figura: "cuadrado", cantidad: 2 }
          ],
          respuestaCorrecta: { figura: "cuadrado", cantidad: 2 }
        }
      ],
    },
    {
      id: 3,
      nombre: "Nivel Avanzado",
      tiempo: 120,
      descripcion: "Relaciones aún más complejas",
      ensayos: [
        {
          balanza1: {
            izquierda: [{ figura: "triangulo", cantidad: 1 }],
            derecha: [{ figura: "circulo", cantidad: 2 }]
          },
          balanza2: {
            izquierda: [{ figura: "cuadrado", cantidad: 2 }],
            derecha: [{ figura: "circulo", cantidad: 3 }]
          },
          problema: {
            izquierda: [{ figura: "triangulo", cantidad: 2 }],
            derecha: []
          },
          opciones: [
            { figura: "cuadrado", cantidad: 2 },
            { figura: "circulo", cantidad: 1 },
            { figura: "circulo", cantidad: 3 },
            { figura: "cuadrado", cantidad: 1 }
          ],
          respuestaCorrecta: { figura: "cuadrado", cantidad: 1 },
        },
        {
          balanza1: {
            izquierda: [{ figura: "estrella", cantidad: 1 }],
            derecha: [{ figura: "circulo", cantidad: 2 }]
          },
          balanza2: {
            izquierda: [{ figura: "triangulo", cantidad: 2 }],
            derecha: [{ figura: "circulo", cantidad: 1 }]
          },
          problema: {
            izquierda: [{ figura: "estrella", cantidad: 2 }],
            derecha: []
          },
          opciones: [
            { figura: "estrella", cantidad: 3 },
            { figura: "triangulo", cantidad: 2 },
            { figura: "triangulo", cantidad: 1 },
            { figura: "circulo", cantidad: 1 }
          ],
          respuestaCorrecta: { figura: "triangulo", cantidad: 2 }
        }, 
        {
          balanza1: {
            izquierda: [{ figura: "circulo", cantidad: 1 }],
            derecha: [{ figura: "cuadrado", cantidad: 1 }]
          },
          balanza2: {
            izquierda: [{ figura: "triangulo", cantidad: 1 }],
            derecha: [{ figura: "cuadrado", cantidad: 2 }]
          },
          problema: {
            izquierda: [{ figura: "circulo", cantidad: 1 }, { figura: "triangulo", cantidad: 1 }],
            derecha: []
          },
          opciones: [
            { figura: "cuadrado", cantidad: 3 },
            { figura: "triangulo", cantidad: 1 },
            { figura: "circulo", cantidad: 1 },
            { figura: "circulo", cantidad: 3 }
          ],
          respuestaCorrecta: { figura: "cuadrado", cantidad: 3 }
        }
      ],
    },
  ];
};

// Exportación de funciones públicas
export const niveles = generarNiveles();

export const obtenerEnsayo = (nivelId) => {
  const nivel = niveles.find((n) => n.id === nivelId);
  if (!nivel) return null;

  return nivel.ensayos[Math.floor(Math.random() * nivel.ensayos.length)];
};

export const verificarRespuesta = (ensayo, opcionSeleccionada) => {
  if (!ensayo || !ensayo.respuestaCorrecta) {
    console.error("Error: ensayo o ensayo.respuestaCorrecta son undefined", ensayo);
    return false;
  }
  console.log('Respuesta Correcta:', ensayo.respuestaCorrecta);
  console.log('Opción Seleccionada:', opcionSeleccionada);
  const esCorrecto =
    ensayo.respuestaCorrecta.figura === opcionSeleccionada.figura &&
    parseInt(ensayo.respuestaCorrecta.cantidad, 10) === parseInt(opcionSeleccionada.cantidad, 10); // Asegurar comparación numérica
  console.log('Es Correcto:', esCorrecto);
  return esCorrecto;
};