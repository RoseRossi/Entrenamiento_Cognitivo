const formas = ["⬤", "■", "▲", "◆", "⬟", "⬢", "⬥", "✦", "✪", "✧"];

export const generarSecuencia = () => {
  const secuencia = [];
  for (let i = 0; i < 20; i++) {
    const forma = formas[Math.floor(Math.random() * formas.length)];
    secuencia.push(forma);
  }
  return secuencia;
};

export const generarPreguntas = (secuencia) => {
  const preguntas = [...secuencia];
  while (preguntas.length < 40) {
    const forma = formas[Math.floor(Math.random() * formas.length)];
    preguntas.push(forma);
  }
  return preguntas.sort(() => Math.random() - 0.5);
};