import React, { useEffect, useState, useCallback } from "react";
import GameLayout from "../GameLayout/GameLayout";
import { auth } from "../../../services/firebase/firebaseConfig";
import { gameService } from "../../../services/firebase/gameService";
import { userService } from "../../../services/firebase/userService";
import "./juego7_estilo.css";
import { generarCirculos, generarSecuencia } from "./juego7_funciones";

const Juego7 = () => {
  const [circulos, setCirculos] = useState([]);
  const [secuencia, setSecuencia] = useState([]);
  const [resaltando, setResaltando] = useState(false);
  const [respuesta, setRespuesta] = useState([]);
  const [amplitud, setAmplitud] = useState(3);
  const [fallos, setFallos] = useState(0);
  const [ensayos, setEnsayos] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  // Estados para Firebase
  const [user, setUser] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [resultadoGuardado, setResultadoGuardado] = useState(false);
  const [ensayosDetallados, setEnsayosDetallados] = useState([]);
  const [tiempoInicioEnsayo, setTiempoInicioEnsayo] = useState(null);

  // Guardar resultado usando useCallback
  const guardarResultado = useCallback(async () => {
    if (!user) {
      console.log('No hay usuario autenticado para guardar resultado');
      return;
    }

    try {
      console.log('Guardando resultado del Juego 7...');
      
      const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000);
      const amplitudMaxima = amplitud;
      const ensayosCompletados = ensayos;
      const ensayosCorrectos = ensayosDetallados.filter(e => e.correcto).length;
      
      // Calcular métricas específicas de memoria de trabajo visuoespacial
      const spanMemoria = amplitudMaxima; // Amplitud máxima alcanzada
      const porcentajePrecision = ensayosDetallados.length > 0 ? Math.round((ensayosCorrectos / ensayosDetallados.length) * 100) : 0;
      const eficienciaProgresion = amplitudMaxima - 3; // Progreso desde amplitud inicial
      
      // Analizar patrones de errores
      const erroresPorAmplitud = {};
      ensayosDetallados.forEach(ensayo => {
        if (!ensayo.correcto) {
          const amp = ensayo.amplitud;
          erroresPorAmplitud[amp] = (erroresPorAmplitud[amp] || 0) + 1;
        }
      });

      // Determinar nivel basado en span alcanzado y precisión
      let nivelJuego = 'basico';
      if (spanMemoria >= 6 && porcentajePrecision >= 80) {
        nivelJuego = 'avanzado';
      } else if (spanMemoria >= 5 && porcentajePrecision >= 70) {
        nivelJuego = 'intermedio';
      }

      // Score basado en span máximo y eficiencia
      const scoreSpan = Math.min(70, (spanMemoria - 3) * 10); 
      const scorePrecision = porcentajePrecision * 0.3; 
      const scoreFinal = Math.round(scoreSpan + scorePrecision);

      const resultData = {
        userId: user.uid,
        gameId: 'corsi_blocks',
        cognitiveDomain: 'memoria',
        level: nivelJuego,
        score: scoreFinal,
        timeSpent: tiempoTranscurrido,
        correctAnswers: ensayosCorrectos,
        totalQuestions: ensayosDetallados.length,
        details: {
          spanMemoriaVisuoespacial: spanMemoria,
          amplitudMaximaAlcanzada: amplitudMaxima,
          ensayosCompletados: ensayosCompletados,
          ensayosCorrectos: ensayosCorrectos,
          porcentajePrecision: porcentajePrecision,
          eficienciaProgresion: eficienciaProgresion,
          fallosTotales: fallos,
          razonTermino: fallos >= 2 ? 'dos_fallos_consecutivos' : 
                       (spanMemoria >= 9 ? 'span_maximo_alcanzado' : 'usuario_salio'),
          erroresPorAmplitud: erroresPorAmplitud,
          secuenciasGeneradas: ensayosDetallados.map(e => e.secuenciaOriginal),
          respuestasUsuario: ensayosDetallados.map(e => e.respuestaUsuario),
          tiempoPromedioRespuesta: ensayosDetallados.length > 0 ? 
            Math.round(ensayosDetallados.reduce((sum, e) => sum + e.tiempoRespuesta, 0) / ensayosDetallados.length) : 0,
          posicionesCirculos: circulos, // Configuración espacial usada
          ensayosDetallados: ensayosDetallados
        }
      };

      // Guardar resultado del juego
      await gameService.saveGameResult(resultData);
      
      // Actualizar progreso del usuario en el dominio cognitivo
      await userService.updateUserProgress(user.uid, 'memoria', scoreFinal);
      
      console.log('Resultado del Juego 7 guardado exitosamente');
      setResultadoGuardado(true);
      
    } catch (error) {
      console.error('Error guardando resultado del Juego 7:', error);
    }
  }, [user, tiempoInicio, amplitud, ensayos, fallos, ensayosDetallados, circulos]);

  // Inicialización
  useEffect(() => {
    setUser(auth.currentUser);
    setTiempoInicio(Date.now());
  }, []);

  // Guardar resultado cuando el juego termine
  useEffect(() => {
    if (juegoTerminado && !resultadoGuardado && user && tiempoInicio) {
      guardarResultado();
    }
  }, [juegoTerminado, resultadoGuardado, user, tiempoInicio, guardarResultado]);

  useEffect(() => {
    setCirculos(generarCirculos(10));
  }, []);

  const iniciarEnsayo = useCallback(() => {
    const nuevaSecuencia = generarSecuencia(circulos.length, amplitud);
    setSecuencia(nuevaSecuencia);
    setRespuesta([]);
    setResaltando(true);
    setTiempoInicioEnsayo(Date.now());

    nuevaSecuencia.forEach((i, index) => {
      setTimeout(() => {
        const circulo = document.getElementById(`circulo-${i}`);
        if (circulo) {
          circulo.classList.add("resaltado");
          setTimeout(() => {
            circulo.classList.remove("resaltado");
            if (index === nuevaSecuencia.length - 1) {
              setResaltando(false);
            }
          }, 333);
        }
      }, index * 666);
    });
  }, [circulos.length, amplitud]);

  useEffect(() => {
    if (circulos.length > 0) iniciarEnsayo();
  }, [circulos, iniciarEnsayo]);

  const manejarClick = (index) => {
    if (resaltando || respuesta.length >= secuencia.length || juegoTerminado) return;
    
    const nuevaRespuesta = [...respuesta, index];
    setRespuesta(nuevaRespuesta);

    if (nuevaRespuesta.length === secuencia.length) {
      const correcta = secuencia.every((val, i) => val === nuevaRespuesta[i]);
      const tiempoRespuesta = Date.now() - tiempoInicioEnsayo;

      // Registrar ensayo detallado
      const ensayoDetallado = {
        ensayoNumero: ensayos + 1,
        amplitud: amplitud,
        secuenciaOriginal: [...secuencia],
        respuestaUsuario: [...nuevaRespuesta],
        correcto: correcta,
        tiempoRespuesta: tiempoRespuesta,
        tiempoMostrando: secuencia.length * 666, // Tiempo total mostrando secuencia
        posicionesUsadas: secuencia.map(idx => circulos[idx]),
        erroresEnPosicion: correcta ? [] : secuencia.map((orig, i) => ({
          posicion: i,
          esperado: orig,
          recibido: nuevaRespuesta[i] || null,
          correcto: orig === nuevaRespuesta[i]
        }))
      };
      setEnsayosDetallados(prev => [...prev, ensayoDetallado]);

      if (correcta) {
        const nuevosEnsayos = ensayos + 1;
        setEnsayos(nuevosEnsayos);
        
        // Aumentar amplitud cada 3 ensayos correctos
        if (nuevosEnsayos % 3 === 0) {
          setAmplitud(prev => prev + 1);
        }
        
        // Verificar si se alcanzó el span máximo teórico
        if (amplitud >= 9) {
          setJuegoTerminado(true);
        } else {
          setTimeout(() => iniciarEnsayo(), 1000);
        }
      } else {
        const nuevosFallos = fallos + 1;
        setFallos(nuevosFallos);
        
        if (nuevosFallos >= 2) {
          setJuegoTerminado(true);
        } else {
          setTimeout(() => iniciarEnsayo(), 1000);
        }
      }
    }
  };

  const reiniciarJuego = () => {
    setCirculos(generarCirculos(10));
    setSecuencia([]);
    setRespuesta([]);
    setAmplitud(3);
    setFallos(0);
    setEnsayos(0);
    setJuegoTerminado(false);
    setResultadoGuardado(false);
    setEnsayosDetallados([]);
    setTiempoInicio(Date.now());
  };

  const generarAnalisis = () => {
    const spanAlcanzado = amplitud;
    const porcentajePrecision = ensayosDetallados.length > 0 ? 
      Math.round((ensayosDetallados.filter(e => e.correcto).length / ensayosDetallados.length) * 100) : 0;

    if (fallos >= 2) {
      return `Has cometido dos errores y el juego ha terminado. Tu span de memoria visuoespacial alcanzado fue ${spanAlcanzado} elementos con ${porcentajePrecision}% de precisión. Intenta crear estrategias visuales para recordar mejor las secuencias.`;
    }
    
    if (spanAlcanzado >= 7) {
      return `¡Excelente span de memoria visuoespacial! Alcanzaste ${spanAlcanzado} elementos con ${porcentajePrecision}% de precisión. Tu capacidad para recordar secuencias espaciales está muy desarrollada.`;
    }
    
    if (spanAlcanzado >= 5) {
      return `Buen rendimiento. Tu span de memoria visuoespacial es ${spanAlcanzado} elementos con ${porcentajePrecision}% de precisión. Esto está dentro del rango normal-alto para adultos.`;
    }
    
    if (spanAlcanzado >= 4) {
      return `Rendimiento promedio. Tu span de memoria visuoespacial es ${spanAlcanzado} elementos con ${porcentajePrecision}% de precisión. Puedes mejorar practicando técnicas de visualización espacial.`;
    }
    
    return `Tu span de memoria visuoespacial es ${spanAlcanzado} elementos con ${porcentajePrecision}% de precisión. Sigue practicando para desarrollar mejores estrategias de memorización espacial.`;
  };

  const obtenerProgreso = () => {
    return `Span actual: ${amplitud} | Ensayos: ${ensayos} | Fallos: ${fallos}/2`;
  };

  return (
    <GameLayout
      title="Bloques de Corsi"
      description="Observa y repite la secuencia de los círculos en el orden correcto. El span aumenta cada 3 aciertos consecutivos."
      stats={{ 
        amplitud, 
        fallos,
        ensayos,
        progreso: obtenerProgreso()
      }}
      gameOver={juegoTerminado}
      finalStats={{
        completed: amplitud >= 9,
        level: amplitud,
        score: ensayos,
        mistakes: fallos,
        span: amplitud,
        precision: ensayosDetallados.length > 0 ? 
          Math.round((ensayosDetallados.filter(e => e.correcto).length / ensayosDetallados.length) * 100) : 0
      }}
      onRestart={reiniciarJuego}
      analysis={generarAnalisis()}
      onFallo={fallos}
      onCorrectAnswer={ensayos}
    >
      {!juegoTerminado ? (
        <>
          <div className="info">
            <p>{resaltando ? `Observa la secuencia... (${amplitud} elementos)` : 
                           `Repite la secuencia haciendo clic en los círculos (${respuesta.length}/${secuencia.length})`}</p>
          </div>
          <div className="area-circulos">
            {circulos.map((pos, index) => (
              <div
                key={index}
                id={`circulo-${index}`}
                className={`circulo ${!resaltando ? 'seleccionable' : ''}`}
                style={{ top: pos.top, left: pos.left }}
                onClick={() => manejarClick(index)}
              ></div>
            ))}
          </div>
        </>
      ) : (
        // Mostrar estado de guardado cuando termine el juego
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="resultado">
            <h3>Resultados Finales</h3>
            <p><strong>Span de memoria visuoespacial:</strong> {amplitud} elementos</p>
            <p><strong>Ensayos completados:</strong> {ensayos}</p>
            <p><strong>Precisión:</strong> {ensayosDetallados.length > 0 ? 
              Math.round((ensayosDetallados.filter(e => e.correcto).length / ensayosDetallados.length) * 100) : 0}%</p>
            <p><strong>Fallos:</strong> {fallos}/2</p>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            {resultadoGuardado ? (
              <p style={{ color: '#22c55e', fontWeight: 'bold' }}>
                Resultado guardado correctamente
              </p>
            ) : (
              <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                Guardando resultado...
              </p>
            )}
          </div>
        </div>
      )}
    </GameLayout>
  );
};

export default Juego7;