export const palabrasOriginales = [
    "cielo", "montaña", "río", "fuego", "sol", "luna",
    "estrella", "nieve", "mar", "bosque", "viento", "roca"
  ];
  
  const distractores = [
    "arena", "hierba", "nube", "lluvia", "trueno", "relámpago",
    "volcán", "cascada", "laguna", "desierto", "jungla", "glaciar"
  ];
  
  export const generarMarDePalabras = () => {
    const mezcla = [...palabrasOriginales];
    while (mezcla.length < 24) {
      const distr = distractores[Math.floor(Math.random() * distractores.length)];
      if (!mezcla.includes(distr)) mezcla.push(distr);
    }
    return mezcla.sort(() => Math.random() - 0.5);
  };