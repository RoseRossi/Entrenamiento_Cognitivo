import {
  ejerciciosWAIS,
  niveles,
  obtenerEjerciciosPorNivel,
  obtenerEnsayo,
  verificarRespuesta,
  hayMasEnsayosEnNivel,
  getProgresoNivel
} from '../../../components/Games/juego4/juego4_funciones';

describe('Juego4 - Balance de Balanza', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });
  describe('ejerciciosWAIS array', () => {
    test('should have valid structure for all exercises', () => {
      expect(Array.isArray(ejerciciosWAIS)).toBe(true);
      expect(ejerciciosWAIS.length).toBe(25); // Total WAIS exercises
      
      ejerciciosWAIS.forEach((ejercicio, index) => {
        expect(ejercicio).toHaveProperty('id');
        expect(ejercicio).toHaveProperty('nivel');
        expect(ejercicio).toHaveProperty('balanza1');
        expect(ejercicio).toHaveProperty('balanza2');
        expect(ejercicio).toHaveProperty('problema');
        expect(ejercicio).toHaveProperty('opciones');
        expect(ejercicio).toHaveProperty('respuestaCorrecta');
        
        expect(typeof ejercicio.id).toBe('string');
        expect(typeof ejercicio.nivel).toBe('number');
        expect(Array.isArray(ejercicio.opciones)).toBe(true);
        expect(typeof ejercicio.respuestaCorrecta).toBe('number');
      });
    });

    test('should have 5 options for each exercise', () => {
      ejerciciosWAIS.forEach(ejercicio => {
        expect(ejercicio.opciones).toHaveLength(5);
      });
    });

    test('should have valid correct answer index (0-4)', () => {
      ejerciciosWAIS.forEach(ejercicio => {
        expect(ejercicio.respuestaCorrecta).toBeGreaterThanOrEqual(0);
        expect(ejercicio.respuestaCorrecta).toBeLessThan(5);
      });
    });

    test('should have balanza structure with izquierda and derecha', () => {
      ejerciciosWAIS.forEach(ejercicio => {
        expect(ejercicio.balanza1).toHaveProperty('izquierda');
        expect(ejercicio.balanza1).toHaveProperty('derecha');
        expect(ejercicio.balanza2).toHaveProperty('izquierda');
        expect(ejercicio.balanza2).toHaveProperty('derecha');
        
        expect(Array.isArray(ejercicio.balanza1.izquierda)).toBe(true);
        expect(Array.isArray(ejercicio.balanza1.derecha)).toBe(true);
        expect(Array.isArray(ejercicio.balanza2.izquierda)).toBe(true);
        expect(Array.isArray(ejercicio.balanza2.derecha)).toBe(true);
      });
    });

    test('should have problema with izquierda', () => {
      ejerciciosWAIS.forEach(ejercicio => {
        expect(ejercicio.problema).toHaveProperty('izquierda');
        expect(Array.isArray(ejercicio.problema.izquierda)).toBe(true);
      });
    });

    test('should have exercises for all 4 levels', () => {
      const nivel1 = ejerciciosWAIS.filter(e => e.nivel === 1);
      const nivel2 = ejerciciosWAIS.filter(e => e.nivel === 2);
      const nivel3 = ejerciciosWAIS.filter(e => e.nivel === 3);
      const nivel4 = ejerciciosWAIS.filter(e => e.nivel === 4);
      
      expect(nivel1.length).toBe(6);
      expect(nivel2.length).toBe(8);
      expect(nivel3.length).toBe(6);
      expect(nivel4.length).toBe(5);
    });

    test('should have figura and cantidad for shapes', () => {
      ejerciciosWAIS.forEach(ejercicio => {
        [...ejercicio.balanza1.izquierda, ...ejercicio.balanza1.derecha,
         ...ejercicio.balanza2.izquierda, ...ejercicio.balanza2.derecha,
         ...ejercicio.problema.izquierda, ...ejercicio.opciones].forEach(item => {
          expect(item).toHaveProperty('figura');
          expect(item).toHaveProperty('cantidad');
          expect(typeof item.figura).toBe('string');
          expect(typeof item.cantidad).toBe('number');
          expect(item.cantidad).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('niveles array', () => {
    test('should have 4 levels', () => {
      expect(niveles).toHaveLength(4);
    });

    test('should have valid structure for each level', () => {
      niveles.forEach((nivel, index) => {
        expect(nivel).toHaveProperty('id');
        expect(nivel).toHaveProperty('nombre');
        expect(nivel).toHaveProperty('tiempo');
        expect(nivel).toHaveProperty('ensayos');
        expect(nivel).toHaveProperty('descripcion');
        
        expect(nivel.id).toBe(index + 1);
        expect(typeof nivel.nombre).toBe('string');
        expect(typeof nivel.tiempo).toBe('number');
        expect(Array.isArray(nivel.ensayos)).toBe(true);
        expect(typeof nivel.descripcion).toBe('string');
      });
    });

    test('should all have same tiempo (600 seconds = 10 minutes)', () => {
      niveles.forEach(nivel => {
        expect(nivel.tiempo).toBe(600);
      });
    });

    test('should have correct number of ensayos per level', () => {
      expect(niveles[0].ensayos).toHaveLength(6);  // Nivel 1: Básico
      expect(niveles[1].ensayos).toHaveLength(8);  // Nivel 2: Intermedio
      expect(niveles[2].ensayos).toHaveLength(6);  // Nivel 3: Avanzado
      expect(niveles[3].ensayos).toHaveLength(5);  // Nivel 4: Experto
    });
  });

  describe('obtenerEjerciciosPorNivel', () => {
    test('should return 6 exercises for nivel 1', () => {
      const ejercicios = obtenerEjerciciosPorNivel(1);
      expect(ejercicios).toHaveLength(6);
      ejercicios.forEach(ej => expect(ej.nivel).toBe(1));
    });

    test('should return 8 exercises for nivel 2', () => {
      const ejercicios = obtenerEjerciciosPorNivel(2);
      expect(ejercicios).toHaveLength(8);
      ejercicios.forEach(ej => expect(ej.nivel).toBe(2));
    });

    test('should return 6 exercises for nivel 3', () => {
      const ejercicios = obtenerEjerciciosPorNivel(3);
      expect(ejercicios).toHaveLength(6);
      ejercicios.forEach(ej => expect(ej.nivel).toBe(3));
    });

    test('should return 5 exercises for nivel 4', () => {
      const ejercicios = obtenerEjerciciosPorNivel(4);
      expect(ejercicios).toHaveLength(5);
      ejercicios.forEach(ej => expect(ej.nivel).toBe(4));
    });

    test('should return empty array for invalid level', () => {
      expect(obtenerEjerciciosPorNivel(0)).toEqual([]);
      expect(obtenerEjerciciosPorNivel(5)).toEqual([]);
      expect(obtenerEjerciciosPorNivel(99)).toEqual([]);
    });

    test('should return exercises with valid IDs', () => {
      const ejercicios1 = obtenerEjerciciosPorNivel(1);
      ejercicios1.forEach(ej => {
        expect(ej.id).toMatch(/^wais_0[1-6]$/);
      });
    });
  });

  describe('obtenerEnsayo', () => {
    test('should return first ensayo when reset is called', () => {
      // Reset returns the first ensayo AND increments
      const ensayo = obtenerEnsayo(1, true);
      
      expect(ensayo).not.toBeNull();
      expect(ensayo.id).toBe('wais_01');
      expect(ensayo.nivel).toBe(1);
    });

    test('should return sequential ensayos', () => {
      // Reset and get first
      const ensayo1 = obtenerEnsayo(1, true);
      const ensayo2 = obtenerEnsayo(1);
      const ensayo3 = obtenerEnsayo(1);
      
      expect(ensayo1.id).toBe('wais_01');
      expect(ensayo2.id).toBe('wais_02');
      expect(ensayo3.id).toBe('wais_03');
    });

    test('should return null when all ensayos for level are consumed', () => {
      obtenerEnsayo(1, true); // Reset and get first (1/6)
      // Get remaining 5
      for (let i = 0; i < 5; i++) {
        obtenerEnsayo(1);
      }
      
      const nextEnsayo = obtenerEnsayo(1);
      expect(nextEnsayo).toBeNull();
    });

    test('should reset indices when reiniciar is true', () => {
      obtenerEnsayo(1, true); // Reset, get wais_01
      obtenerEnsayo(1); // Get wais_02
      
      const resetEnsayo = obtenerEnsayo(1, true); // Reset again, get wais_01
      expect(resetEnsayo.id).toBe('wais_01');
    });

    test('should maintain separate indices for different levels', () => {
      obtenerEnsayo(1, true); // Reset ALL levels, get wais_01
      
      const ensayo2_1 = obtenerEnsayo(2); // Get wais_07 from level 2
      const ensayo1_2 = obtenerEnsayo(1); // Get wais_02 from level 1
      const ensayo2_2 = obtenerEnsayo(2); // Get wais_08 from level 2
      
      expect(ensayo2_1.id).toBe('wais_07');
      expect(ensayo1_2.id).toBe('wais_02');
      expect(ensayo2_2.id).toBe('wais_08');
    });

    test('should return null for invalid level', () => {
      expect(obtenerEnsayo(0)).toBeNull();
      expect(obtenerEnsayo(5)).toBeNull();
      expect(obtenerEnsayo(-1)).toBeNull();
    });

    test('should validate ensayo structure before returning', () => {
      const ensayo = obtenerEnsayo(1);
      
      expect(ensayo).toHaveProperty('opciones');
      expect(ensayo.opciones).toHaveLength(5);
      expect(ensayo).toHaveProperty('respuestaCorrecta');
    });
  });

  describe('verificarRespuesta', () => {
    test('should return true for correct answer', () => {
      const ensayo = ejerciciosWAIS[0]; // wais_01
      const opcionCorrecta = ensayo.opciones[ensayo.respuestaCorrecta];
      
      const resultado = verificarRespuesta(ensayo, opcionCorrecta);
      expect(resultado).toBe(true);
    });

    test('should return false for incorrect answer', () => {
      const ensayo = ejerciciosWAIS[0];
      const opcionIncorrecta = ensayo.opciones[(ensayo.respuestaCorrecta + 1) % 5];
      
      const resultado = verificarRespuesta(ensayo, opcionIncorrecta);
      expect(resultado).toBe(false);
    });

    test('should validate both figura and cantidad', () => {
      const ensayo = ejerciciosWAIS[0];
      const opcionCorrecta = ensayo.opciones[ensayo.respuestaCorrecta];
      
      // Same figura, wrong cantidad
      const wrongCantidad = {
        figura: opcionCorrecta.figura,
        cantidad: opcionCorrecta.cantidad + 1
      };
      expect(verificarRespuesta(ensayo, wrongCantidad)).toBe(false);
      
      // Wrong figura, same cantidad
      const wrongFigura = {
        figura: 'wrong',
        cantidad: opcionCorrecta.cantidad
      };
      expect(verificarRespuesta(ensayo, wrongFigura)).toBe(false);
    });

    test('should handle null ensayo', () => {
      const resultado = verificarRespuesta(null, { figura: 'circulo', cantidad: 1 });
      expect(resultado).toBe(false);
    });

    test('should handle null opcion', () => {
      const ensayo = ejerciciosWAIS[0];
      const resultado = verificarRespuesta(ensayo, null);
      expect(resultado).toBe(false);
    });

    test('should handle ensayo without opciones', () => {
      const invalidEnsayo = { id: 'test', respuestaCorrecta: 0 };
      const resultado = verificarRespuesta(invalidEnsayo, { figura: 'circulo', cantidad: 1 });
      expect(resultado).toBe(false);
    });

    test('should handle invalid respuestaCorrecta index', () => {
      const ensayo = { ...ejerciciosWAIS[0], respuestaCorrecta: 99 };
      const opcion = { figura: 'circulo', cantidad: 1 };
      const resultado = verificarRespuesta(ensayo, opcion);
      expect(resultado).toBe(false);
    });

    test('should validate all exercises have correct answer at specified index', () => {
      ejerciciosWAIS.forEach(ensayo => {
        const opcionCorrecta = ensayo.opciones[ensayo.respuestaCorrecta];
        expect(verificarRespuesta(ensayo, opcionCorrecta)).toBe(true);
      });
    });
  });

  describe('hayMasEnsayosEnNivel', () => {
    beforeEach(() => {
      obtenerEnsayo(1, true); // Reset
    });

    test('should return true when ensayos are available', () => {
      expect(hayMasEnsayosEnNivel(1)).toBe(true);
    });

    test('should return false when all ensayos consumed', () => {
      // Nivel 1 has 6 ensayos
      for (let i = 0; i < 6; i++) {
        obtenerEnsayo(1);
      }
      
      expect(hayMasEnsayosEnNivel(1)).toBe(false);
    });

    test('should return true after consuming some but not all ensayos', () => {
      obtenerEnsayo(1);
      obtenerEnsayo(1);
      
      expect(hayMasEnsayosEnNivel(1)).toBe(true);
    });

    test('should return false for invalid level', () => {
      expect(hayMasEnsayosEnNivel(0)).toBe(false);
      expect(hayMasEnsayosEnNivel(5)).toBe(false);
    });

    test('should track independently for different levels', () => {
      obtenerEnsayo(1);
      obtenerEnsayo(2);
      
      expect(hayMasEnsayosEnNivel(1)).toBe(true);
      expect(hayMasEnsayosEnNivel(2)).toBe(true);
    });
  });

  describe('getProgresoNivel', () => {
    test('should return progress object with actual and total', () => {
      obtenerEnsayo(1, true); // Reset and consume first
      const progreso = getProgresoNivel(1);
      
      expect(progreso).toHaveProperty('actual');
      expect(progreso).toHaveProperty('total');
    });

    test('should show progress after reset and consuming first ensayo', () => {
      obtenerEnsayo(1, true); // Reset and consume first (index now at 1)
      const progreso = getProgresoNivel(1);
      
      expect(progreso.actual).toBe(1); // Consumed 1
      expect(progreso.total).toBe(6);
    });

    test('should track progress correctly', () => {
      obtenerEnsayo(1, true); // Reset and get first (index at 1)
      let progreso = getProgresoNivel(1);
      expect(progreso.actual).toBe(1);
      
      obtenerEnsayo(1); // Get second (index at 2)
      obtenerEnsayo(1); // Get third (index at 3)
      progreso = getProgresoNivel(1);
      expect(progreso.actual).toBe(3);
    });

    test('should return correct totals for each level', () => {
      expect(getProgresoNivel(1).total).toBe(6);
      expect(getProgresoNivel(2).total).toBe(8);
      expect(getProgresoNivel(3).total).toBe(6);
      expect(getProgresoNivel(4).total).toBe(5);
    });

    test('should return {0, 0} for invalid level', () => {
      const progreso = getProgresoNivel(99);
      expect(progreso.actual).toBe(0);
      expect(progreso.total).toBe(0);
    });

    test('should show completion when all ensayos consumed', () => {
      for (let i = 0; i < 6; i++) {
        obtenerEnsayo(1);
      }
      
      const progreso = getProgresoNivel(1);
      expect(progreso.actual).toBe(6);
      expect(progreso.total).toBe(6);
    });
  });

  describe('Integration tests', () => {
    beforeEach(() => {
      obtenerEnsayo(1, true);
      obtenerEnsayo(2, true);
      obtenerEnsayo(3, true);
      obtenerEnsayo(4, true);
    });

    test('should complete full nivel 1 flow', () => {
      let correctAnswers = 0;
      
      while (hayMasEnsayosEnNivel(1)) {
        const ensayo = obtenerEnsayo(1);
        const opcionCorrecta = ensayo.opciones[ensayo.respuestaCorrecta];
        
        if (verificarRespuesta(ensayo, opcionCorrecta)) {
          correctAnswers++;
        }
      }
      
      expect(correctAnswers).toBe(6);
      expect(hayMasEnsayosEnNivel(1)).toBe(false);
      
      const progreso = getProgresoNivel(1);
      expect(progreso.actual).toBe(6);
      expect(progreso.total).toBe(6);
    });

    test('should handle multiple levels independently', () => {
      obtenerEnsayo(1);
      obtenerEnsayo(1);
      obtenerEnsayo(2);
      
      expect(getProgresoNivel(1).actual).toBe(2);
      expect(getProgresoNivel(2).actual).toBe(1);
      expect(hayMasEnsayosEnNivel(1)).toBe(true);
      expect(hayMasEnsayosEnNivel(2)).toBe(true);
    });
  });
});

