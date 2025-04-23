export const generarCirculos = (cantidad) => {
  const posiciones = [];
  while (posiciones.length < cantidad) {
    const top = Math.floor(Math.random() * 80) + "%";
    const left = Math.floor(Math.random() * 80) + "%";
    const nueva = { top, left };
    if (!posiciones.some(p => Math.abs(parseInt(p.top) - parseInt(nueva.top)) < 10 && Math.abs(parseInt(p.left) - parseInt(nueva.left)) < 10)) {
      posiciones.push(nueva);
    }
  }
  return posiciones;
};

export const generarSecuencia = (max, longitud) => {
  const secuencia = [];
  while (secuencia.length < longitud) {
    const indice = Math.floor(Math.random() * max);
    secuencia.push(indice);
  }
  return secuencia;
};