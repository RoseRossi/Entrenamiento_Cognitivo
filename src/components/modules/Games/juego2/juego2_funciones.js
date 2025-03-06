export const patrones = [
    {
      id: 1,
      grid: ["🔲", "🔳", "🔲", "🔳", "🔲", "🔳", "🔲", "🔳", null],
      options: ["🔲", "🔳", "🔴", "🔵", "⚫", "⚪"],
      correct: "🔳"
    },
    {
      id: 2,
      grid: ["🟥", "🟦", "🟥", "🟦", "🟥", "🟦", "🟥", "🟦", null],
      options: ["🟥", "🟦", "🟩", "🟪", "🟧", "🟫"],
      correct: "🟥"
    }
  ];
  
  export const verificarRespuesta = (seleccion, respuestaCorrecta) => {
    return seleccion === respuestaCorrecta;
  };
  