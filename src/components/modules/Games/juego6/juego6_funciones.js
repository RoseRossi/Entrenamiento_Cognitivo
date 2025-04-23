// juego6_funciones.js
export const generarEnsayo = () => {
    // 60% congruente, 40% incongruente
    const congruente = Math.random() < 0.6;
    const direccionFlecha = Math.random() < 0.5 ? "izquierda" : "derecha";
    
    let ubicacionEstimulo;
    if (congruente) {
      ubicacionEstimulo = direccionFlecha;
    } else {
      ubicacionEstimulo = direccionFlecha === "izquierda" ? "derecha" : "izquierda";
    }
    
    return {
      direccionFlecha,
      ubicacionEstimulo,
      congruente
    };
  };
  
  export const verificarRespuesta = (respuesta, estimulo) => {
    return respuesta === estimulo;
  };
  
  export const calcularRetraso = () => {
    // Retraso aleatorio entre 300ms y 1000ms
    return Math.floor(Math.random() * 700) + 300;
  };