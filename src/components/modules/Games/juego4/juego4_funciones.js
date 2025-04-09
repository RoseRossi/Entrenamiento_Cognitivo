export const niveles = [
    {
      id: 1,
      nombre: "Nivel Básico",
      tiempo: 120, // 2 minutos para nivel básico
      descripcion: "Relaciones simples entre figuras",
      ensayos: [
        {
          balanza1: {
            izquierda: [{ figura: 'triangulo', cantidad: 2 }],
            derecha: [{ figura: 'cuadrado', cantidad: 1 }]
          },
          balanza2: {
            izquierda: [{ figura: 'cuadrado', cantidad: 1 }],
            derecha: [{ figura: 'circulo', cantidad: 2 }]
          },
          problema: {
            izquierda: [{ figura: 'triangulo', cantidad: 4 }],
            derecha: '?'
          },
          opciones: [
            { figura: 'cuadrado', cantidad: 2 },
            { figura: 'circulo', cantidad: 4 },
            { figura: 'triangulo', cantidad: 4 },
            { figura: 'cuadrado', cantidad: 1 },
            { figura: 'circulo', cantidad: 2 }
          ],
          respuestaCorrecta: { figura: 'cuadrado', cantidad: 2 }
        },
        {
          balanza1: {
            izquierda: [{ figura: 'circulo', cantidad: 3 }],
            derecha: [{ figura: 'triangulo', cantidad: 2 }]
          },
          balanza2: {
            izquierda: [{ figura: 'triangulo', cantidad: 4 }],
            derecha: [{ figura: 'cuadrado', cantidad: 2 }]
          },
          problema: {
            izquierda: [{ figura: 'circulo', cantidad: 6 }],
            derecha: '?'
          },
          opciones: [
            { figura: 'triangulo', cantidad: 4 },
            { figura: 'cuadrado', cantidad: 3 },
            { figura: 'triangulo', cantidad: 6 },
            { figura: 'cuadrado', cantidad: 4 },
            { figura: 'circulo', cantidad: 6 }
          ],
          respuestaCorrecta: { figura: 'triangulo', cantidad: 4 }
        }
      ]
    },
    {
      id: 2,
      nombre: "Nivel Intermedio",
      tiempo: 90, // 1.5 minutos
      descripcion: "Relaciones más complejas",
      ensayos: [
        {
          balanza1: {
            izquierda: [
              { figura: 'triangulo', cantidad: 2 },
              { figura: 'circulo', cantidad: 1 }
            ],
            derecha: [{ figura: 'cuadrado', cantidad: 2 }]
          },
          balanza2: {
            izquierda: [{ figura: 'cuadrado', cantidad: 1 }],
            derecha: [
              { figura: 'triangulo', cantidad: 1 },
              { figura: 'circulo', cantidad: 1 }
            ]
          },
          problema: {
            izquierda: [
              { figura: 'triangulo', cantidad: 3 },
              { figura: 'circulo', cantidad: 2 }
            ],
            derecha: '?'
          },
          opciones: [
            { figura: 'cuadrado', cantidad: 3 },
            { figura: 'triangulo', cantidad: 5 },
            { figura: 'circulo', cantidad: 4 },
            { figura: 'cuadrado', cantidad: 4 },
            { figura: 'triangulo', cantidad: 2 }
          ],
          respuestaCorrecta: { figura: 'cuadrado', cantidad: 4 }
        }
      ]
    },
    {
      id: 3,
      nombre: "Nivel Avanzado",
      tiempo: 60, // 1 minuto
      descripcion: "Múltiples relaciones proporcionales",
      ensayos: [
        {
          balanza1: {
            izquierda: [
              { figura: 'triangulo', cantidad: 3 },
              { figura: 'cuadrado', cantidad: 1 }
            ],
            derecha: [{ figura: 'circulo', cantidad: 4 }]
          },
          balanza2: {
            izquierda: [
              { figura: 'cuadrado', cantidad: 2 },
              { figura: 'circulo', cantidad: 1 }
            ],
            derecha: [{ figura: 'triangulo', cantidad: 5 }]
          },
          problema: {
            izquierda: [
              { figura: 'triangulo', cantidad: 2 },
              { figura: 'cuadrado', cantidad: 3 },
              { figura: 'circulo', cantidad: 1 }
            ],
            derecha: '?'
          },
          opciones: [
            { figura: 'triangulo', cantidad: 6 },
            { figura: 'cuadrado', cantidad: 4 },
            { figura: 'circulo', cantidad: 5 },
            { figura: 'triangulo', cantidad: 4 },
            { figura: 'circulo', cantidad: 7 }
          ],
          respuestaCorrecta: { figura: 'circulo', cantidad: 5 }
        }
      ]
    }
  ];
  
  // Función para obtener un ensayo aleatorio de un nivel
  export const obtenerEnsayo = (nivelId) => {
    const nivel = niveles.find(n => n.id === nivelId);
    if (!nivel) return null;
    
    const ensayos = nivel.ensayos;
    const indiceAleatorio = Math.floor(Math.random() * ensayos.length);
    return ensayos[indiceAleatorio];
  };
  
  // Función para verificar la respuesta
  export const verificarRespuesta = (ensayo, opcionSeleccionada) => {
    return (
      opcionSeleccionada.figura === ensayo.respuestaCorrecta.figura &&
      opcionSeleccionada.cantidad === ensayo.respuestaCorrecta.cantidad
    );
  };