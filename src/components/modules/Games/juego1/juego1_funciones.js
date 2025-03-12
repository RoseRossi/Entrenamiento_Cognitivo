export const generarFormacion = () => {
    const squareRight = Math.random() < 0.5;
    const nuevaFormacion = { squareRight };
  
    const declaraciones = [
      "El triángulo está a la izquierda del cuadrado",
      "El cuadrado está a la izquierda del triángulo",
    ];
    const nuevaDeclaracion = declaraciones[Math.floor(Math.random() * declaraciones.length)];
  
    return { nuevaFormacion, nuevaDeclaracion };
  };
  
  export const verificarRespuesta = (declaracion, formacion, respuestaUsuario) => {
    const respuestaCorrecta =
      (declaracion === "El triángulo está a la izquierda del cuadrado" && !formacion.squareRight) ||
      (declaracion === "El cuadrado está a la izquierda del triángulo" && formacion.squareRight);
  
    return respuestaUsuario === respuestaCorrecta;
  };
  