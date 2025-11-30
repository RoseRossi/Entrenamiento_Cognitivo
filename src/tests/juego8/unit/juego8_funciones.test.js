import {
  generarEjercicios,
  generarSecuenciaAleatoria,
  verificarRespuesta,
  obtenerSecuenciaInversa,
  validarEjercicio,
  analizarRendimiento,
  verificarCantidadEjercicios
} from '../../../components/Games/juego8/juego8_funciones';

describe('Juego8 - Reverse Memory Span', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });
  describe('generarEjercicios', () => {
    test('should generate exactly 33 exercises', () => {
      const ejercicios = generarEjercicios();
      expect(ejercicios).toHaveLength(33);
    });

    test('should generate 3 training exercises with amplitude 2', () => {
      const ejercicios = generarEjercicios();
      const entrenamiento = ejercicios.filter(e => e.amplitud === 2);
      
      expect(entrenamiento).toHaveLength(3);
    });

    test('should generate 5 exercises for each amplitude from 3 to 8', () => {
      const ejercicios = generarEjercicios();
      
      for (let amplitud = 3; amplitud <= 8; amplitud++) {
        const ejerciciosAmplitud = ejercicios.filter(e => e.amplitud === amplitud);
        expect(ejerciciosAmplitud).toHaveLength(5);
      }
    });

    test('should have valid structure for all exercises', () => {
      const ejercicios = generarEjercicios();
      
      ejercicios.forEach(ejercicio => {
        expect(ejercicio).toHaveProperty('amplitud');
        expect(ejercicio).toHaveProperty('secuencia');
        expect(ejercicio).toHaveProperty('id');
        
        expect(typeof ejercicio.amplitud).toBe('number');
        expect(Array.isArray(ejercicio.secuencia)).toBe(true);
        expect(typeof ejercicio.id).toBe('string');
      });
    });

    test('should have secuencia length matching amplitud', () => {
      const ejercicios = generarEjercicios();
      
      ejercicios.forEach(ejercicio => {
        expect(ejercicio.secuencia).toHaveLength(ejercicio.amplitud);
      });
    });

    test('should have valid IDs', () => {
      const ejercicios = generarEjercicios();
      
      ejercicios.forEach(ejercicio => {
        expect(ejercicio.id).toMatch(/^\d+_\d+$/);
      });
    });

    test('should have amplitudes between 2 and 8', () => {
      const ejercicios = generarEjercicios();
      
      ejercicios.forEach(ejercicio => {
        expect(ejercicio.amplitud).toBeGreaterThanOrEqual(2);
        expect(ejercicio.amplitud).toBeLessThanOrEqual(8);
      });
    });

    test('should generate different sequences on each call', () => {
      const ejercicios1 = generarEjercicios();
      const ejercicios2 = generarEjercicios();
      
      // Compare first exercise sequences
      expect(JSON.stringify(ejercicios1[0].secuencia))
        .not.toBe(JSON.stringify(ejercicios2[0].secuencia));
    });
  });

  describe('generarSecuenciaAleatoria', () => {
    test('should generate sequence of correct length', () => {
      expect(generarSecuenciaAleatoria(3)).toHaveLength(3);
      expect(generarSecuenciaAleatoria(5)).toHaveLength(5);
      expect(generarSecuenciaAleatoria(8)).toHaveLength(8);
    });

    test('should generate array of numbers', () => {
      const secuencia = generarSecuenciaAleatoria(5);
      
      secuencia.forEach(num => {
        expect(typeof num).toBe('number');
      });
    });

    test('should generate numbers between 0 and 8 (grid positions)', () => {
      const secuencia = generarSecuenciaAleatoria(6);
      
      secuencia.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(8);
      });
    });

    test('should not have repeated numbers (no repetition)', () => {
      const secuencia = generarSecuenciaAleatoria(7);
      const unique = new Set(secuencia);
      
      expect(unique.size).toBe(secuencia.length);
    });

    test('should generate different sequences on multiple calls', () => {
      const secuencia1 = generarSecuenciaAleatoria(5);
      const secuencia2 = generarSecuenciaAleatoria(5);
      
      expect(JSON.stringify(secuencia1)).not.toBe(JSON.stringify(secuencia2));
    });

    test('should handle minimum length (2)', () => {
      const secuencia = generarSecuenciaAleatoria(2);
      
      expect(secuencia).toHaveLength(2);
      expect(secuencia[0]).not.toBe(secuencia[1]);
    });

    test('should handle maximum length (8)', () => {
      const secuencia = generarSecuenciaAleatoria(8);
      
      expect(secuencia).toHaveLength(8);
      
      const unique = new Set(secuencia);
      expect(unique.size).toBe(8);
    });

    test('should not mutate available positions pool', () => {
      // Multiple calls should all work
      expect(() => {
        for (let i = 0; i < 10; i++) {
          generarSecuenciaAleatoria(6);
        }
      }).not.toThrow();
    });
  });

  describe('verificarRespuesta', () => {
    test('should return true for correctly reversed sequence', () => {
      const original = [1, 2, 3, 4];
      const respuesta = [4, 3, 2, 1];
      
      expect(verificarRespuesta(respuesta, original)).toBe(true);
    });

    test('should return false for incorrect reverse', () => {
      const original = [1, 2, 3, 4];
      const respuesta = [1, 2, 3, 4]; // Not reversed
      
      expect(verificarRespuesta(respuesta, original)).toBe(false);
    });

    test('should return false for partially correct reverse', () => {
      const original = [1, 2, 3, 4];
      const respuesta = [4, 3, 1, 2]; // Wrong order
      
      expect(verificarRespuesta(respuesta, original)).toBe(false);
    });

    test('should return false for wrong length', () => {
      const original = [1, 2, 3, 4];
      const respuesta = [4, 3, 2]; // Too short
      
      expect(verificarRespuesta(respuesta, original)).toBe(false);
    });

    test('should return false for empty response', () => {
      const original = [1, 2, 3];
      const respuesta = [];
      
      expect(verificarRespuesta(respuesta, original)).toBe(false);
    });

    test('should handle invalid inputs gracefully', () => {
      expect(verificarRespuesta(null, [1, 2, 3])).toBe(false);
      expect(verificarRespuesta([1, 2], null)).toBe(false);
      expect(verificarRespuesta('invalid', [1, 2])).toBe(false);
    });

    test('should not mutate original sequence', () => {
      const original = [1, 2, 3, 4];
      const originalCopy = [...original];
      const respuesta = [4, 3, 2, 1];
      
      verificarRespuesta(respuesta, original);
      
      expect(original).toEqual(originalCopy);
    });

    test('should work with different sequence lengths', () => {
      expect(verificarRespuesta([2, 1], [1, 2])).toBe(true);
      expect(verificarRespuesta([3, 2, 1], [1, 2, 3])).toBe(true);
      expect(verificarRespuesta([5, 4, 3, 2, 1], [1, 2, 3, 4, 5])).toBe(true);
    });

    test('should verify all positions match', () => {
      const original = [0, 4, 7, 2, 8];
      const correctReverse = [8, 2, 7, 4, 0];
      const incorrectReverse = [8, 2, 7, 4, 1]; // Last one wrong
      
      expect(verificarRespuesta(correctReverse, original)).toBe(true);
      expect(verificarRespuesta(incorrectReverse, original)).toBe(false);
    });
  });

  describe('obtenerSecuenciaInversa', () => {
    test('should return reversed sequence', () => {
      expect(obtenerSecuenciaInversa([1, 2, 3])).toEqual([3, 2, 1]);
      expect(obtenerSecuenciaInversa([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
    });

    test('should not mutate original sequence', () => {
      const original = [1, 2, 3, 4];
      const originalCopy = [...original];
      
      obtenerSecuenciaInversa(original);
      
      expect(original).toEqual(originalCopy);
    });

    test('should handle empty array', () => {
      expect(obtenerSecuenciaInversa([])).toEqual([]);
    });

    test('should handle single element', () => {
      expect(obtenerSecuenciaInversa([5])).toEqual([5]);
    });

    test('should handle two elements', () => {
      expect(obtenerSecuenciaInversa([1, 2])).toEqual([2, 1]);
    });

    test('should return empty array for invalid input', () => {
      expect(obtenerSecuenciaInversa(null)).toEqual([]);
      expect(obtenerSecuenciaInversa(undefined)).toEqual([]);
      expect(obtenerSecuenciaInversa('not an array')).toEqual([]);
    });

    test('should work with different data types in array', () => {
      expect(obtenerSecuenciaInversa([0, 1, 2])).toEqual([2, 1, 0]);
      expect(obtenerSecuenciaInversa([8, 7, 6])).toEqual([6, 7, 8]);
    });
  });

  describe('validarEjercicio', () => {
    test('should return true for valid exercise', () => {
      const ejercicio = {
        amplitud: 3,
        secuencia: [1, 2, 3],
        id: '3_1'
      };
      
      expect(validarEjercicio(ejercicio)).toBe(true);
    });

    test('should throw error for null exercise', () => {
      expect(() => validarEjercicio(null)).toThrow('Ejercicio no puede ser null o undefined');
    });

    test('should throw error for undefined exercise', () => {
      expect(() => validarEjercicio(undefined)).toThrow('Ejercicio no puede ser null o undefined');
    });

    test('should throw error for missing secuencia', () => {
      const ejercicio = { amplitud: 3, id: '3_1' };
      expect(() => validarEjercicio(ejercicio)).toThrow('Ejercicio debe tener una secuencia válida');
    });

    test('should throw error for non-array secuencia', () => {
      const ejercicio = { amplitud: 3, secuencia: 'invalid', id: '3_1' };
      expect(() => validarEjercicio(ejercicio)).toThrow('Ejercicio debe tener una secuencia válida');
    });

    test('should throw error for invalid amplitud (too low)', () => {
      const ejercicio = { amplitud: 1, secuencia: [1], id: '1_1' };
      expect(() => validarEjercicio(ejercicio)).toThrow('Amplitud debe ser un número entre 2 y 8');
    });

    test('should throw error for invalid amplitud (too high)', () => {
      const ejercicio = { amplitud: 9, secuencia: [1, 2, 3, 4, 5, 6, 7, 8, 9], id: '9_1' };
      expect(() => validarEjercicio(ejercicio)).toThrow('Amplitud debe ser un número entre 2 y 8');
    });

    test('should throw error when secuencia length does not match amplitud', () => {
      const ejercicio = { amplitud: 4, secuencia: [1, 2, 3], id: '4_1' }; // Length 3, not 4
      expect(() => validarEjercicio(ejercicio)).toThrow('La longitud de la secuencia debe coincidir con la amplitud');
    });

    test('should accept all valid amplitudes (2-8)', () => {
      for (let amp = 2; amp <= 8; amp++) {
        const ejercicio = {
          amplitud: amp,
          secuencia: Array.from({ length: amp }, (_, i) => i),
          id: `${amp}_1`
        };
        expect(validarEjercicio(ejercicio)).toBe(true);
      }
    });
  });

  describe('analizarRendimiento', () => {
    test('should calculate basic statistics correctly', () => {
      const ejercicios = [
        { amplitud: 2, correcto: true },
        { amplitud: 3, correcto: true },
        { amplitud: 3, correcto: false },
        { amplitud: 4, correcto: true }
      ];
      
      const resultado = analizarRendimiento(ejercicios);
      
      expect(resultado.amplitudMaxima).toBe(4);
      expect(resultado.ejerciciosCorrectos).toBe(3);
      expect(resultado.porcentajePrecision).toBe(75); // 3/4 = 75%
    });

    test('should return default values for empty array', () => {
      const resultado = analizarRendimiento([]);
      
      expect(resultado.amplitudMaxima).toBe(2);
      expect(resultado.porcentajePrecision).toBe(0);
      expect(resultado.ejerciciosCorrectos).toBe(0);
      expect(resultado.rendimientoPorAmplitud).toEqual({});
    });

    test('should handle invalid input gracefully', () => {
      expect(analizarRendimiento(null).amplitudMaxima).toBe(2);
      expect(analizarRendimiento(undefined).amplitudMaxima).toBe(2);
      expect(analizarRendimiento('invalid').amplitudMaxima).toBe(2);
    });

    test('should calculate performance by amplitude', () => {
      const ejercicios = [
        { amplitud: 3, correcto: true },
        { amplitud: 3, correcto: true },
        { amplitud: 3, correcto: false },
        { amplitud: 4, correcto: true },
        { amplitud: 4, correcto: false }
      ];
      
      const resultado = analizarRendimiento(ejercicios);
      
      expect(resultado.rendimientoPorAmplitud[3].intentos).toBe(3);
      expect(resultado.rendimientoPorAmplitud[3].aciertos).toBe(2);
      expect(resultado.rendimientoPorAmplitud[3].porcentaje).toBe(67); // 2/3 ≈ 67%
      
      expect(resultado.rendimientoPorAmplitud[4].intentos).toBe(2);
      expect(resultado.rendimientoPorAmplitud[4].aciertos).toBe(1);
      expect(resultado.rendimientoPorAmplitud[4].porcentaje).toBe(50); // 1/2 = 50%
    });

    test('should find maximum amplitude from correct answers only', () => {
      const ejercicios = [
        { amplitud: 3, correcto: true },
        { amplitud: 4, correcto: true },
        { amplitud: 5, correcto: false },
        { amplitud: 6, correcto: false }
      ];
      
      const resultado = analizarRendimiento(ejercicios);
      
      expect(resultado.amplitudMaxima).toBe(4); // Only count correct answers
    });

    test('should handle all incorrect answers', () => {
      const ejercicios = [
        { amplitud: 2, correcto: false },
        { amplitud: 3, correcto: false },
        { amplitud: 4, correcto: false }
      ];
      
      const resultado = analizarRendimiento(ejercicios);
      
      expect(resultado.amplitudMaxima).toBe(2); // Default when no correct
      expect(resultado.ejerciciosCorrectos).toBe(0);
      expect(resultado.porcentajePrecision).toBe(0);
    });

    test('should calculate precision as percentage', () => {
      const ejercicios = [
        { amplitud: 2, correcto: true },
        { amplitud: 2, correcto: true },
        { amplitud: 3, correcto: true },
        { amplitud: 3, correcto: false }
      ];
      
      const resultado = analizarRendimiento(ejercicios);
      
      expect(resultado.porcentajePrecision).toBe(75); // 3/4 = 75%
    });

    test('should handle 100% precision', () => {
      const ejercicios = [
        { amplitud: 2, correcto: true },
        { amplitud: 3, correcto: true },
        { amplitud: 4, correcto: true }
      ];
      
      const resultado = analizarRendimiento(ejercicios);
      
      expect(resultado.porcentajePrecision).toBe(100);
    });
  });

  describe('verificarCantidadEjercicios', () => {
    test('should return summary with total count', () => {
      const resumen = verificarCantidadEjercicios();
      
      expect(resumen).toHaveProperty('total');
      expect(resumen).toHaveProperty('porAmplitud');
      expect(resumen.total).toBe(33);
    });

    test('should have correct count per amplitude', () => {
      const resumen = verificarCantidadEjercicios();
      
      expect(resumen.porAmplitud[2]).toBe(3);
      expect(resumen.porAmplitud[3]).toBe(5);
      expect(resumen.porAmplitud[4]).toBe(5);
      expect(resumen.porAmplitud[5]).toBe(5);
      expect(resumen.porAmplitud[6]).toBe(5);
      expect(resumen.porAmplitud[7]).toBe(5);
      expect(resumen.porAmplitud[8]).toBe(5);
    });

    test('should sum to 33 total exercises', () => {
      const resumen = verificarCantidadEjercicios();
      const sum = Object.values(resumen.porAmplitud).reduce((a, b) => a + b, 0);
      
      expect(sum).toBe(33);
    });
  });

  describe('Integration tests', () => {
    test('should complete full game flow', () => {
      const ejercicios = generarEjercicios();
      
      expect(ejercicios).toHaveLength(33);
      
      // Validate all exercises
      ejercicios.forEach(ejercicio => {
        expect(validarEjercicio(ejercicio)).toBe(true);
      });
      
      // Simulate user playing
      const resultados = ejercicios.map(ejercicio => {
        const secuenciaInversa = obtenerSecuenciaInversa(ejercicio.secuencia);
        const correcto = verificarRespuesta(secuenciaInversa, ejercicio.secuencia);
        
        return {
          amplitud: ejercicio.amplitud,
          correcto: correcto
        };
      });
      
      // Analyze performance
      const analisis = analizarRendimiento(resultados);
      
      expect(analisis.ejerciciosCorrectos).toBe(33); // All correct in this simulation
      expect(analisis.porcentajePrecision).toBe(100);
    });

    test('should handle mixed performance correctly', () => {
      const ejercicios = generarEjercicios();
      
      // Simulate user getting some right, some wrong
      const resultados = ejercicios.map((ejercicio, index) => {
        const correcto = index % 2 === 0; // Alternate correct/incorrect
        
        return {
          amplitud: ejercicio.amplitud,
          correcto: correcto
        };
      });
      
      const analisis = analizarRendimiento(resultados);
      
      // Should be roughly 50% (17/33)
      expect(analisis.porcentajePrecision).toBeGreaterThan(45);
      expect(analisis.porcentajePrecision).toBeLessThan(55);
    });

    test('should verify sequence reversal logic', () => {
      const secuencia = generarSecuenciaAleatoria(5);
      const inversa = obtenerSecuenciaInversa(secuencia);
      
      // Verify inverse is correct
      expect(verificarRespuesta(inversa, secuencia)).toBe(true);
      
      // Verify original is wrong
      expect(verificarRespuesta(secuencia, secuencia)).toBe(false);
    });

    test('should maintain data integrity across all operations', () => {
      const ejercicio = {
        amplitud: 4,
        secuencia: [1, 2, 3, 4],
        id: '4_1'
      };
      
      const originalSecuencia = [...ejercicio.secuencia];
      
      // Run multiple operations
      validarEjercicio(ejercicio);
      const inversa = obtenerSecuenciaInversa(ejercicio.secuencia);
      verificarRespuesta(inversa, ejercicio.secuencia);
      
      // Original should remain unchanged
      expect(ejercicio.secuencia).toEqual(originalSecuencia);
    });
  });
});

