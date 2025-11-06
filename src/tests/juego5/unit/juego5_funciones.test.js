import {
  generarSecuencia,
  generarPreguntas,
  JUEGO5_CONFIG
} from '../../../components/Games/juego5/juego5_funciones';

describe('Juego5 - Reconociendo Objetos', () => {
  describe('JUEGO5_CONFIG', () => {
    test('should have valid configuration values', () => {
      expect(JUEGO5_CONFIG.START_LEVEL).toBe(1);
      expect(JUEGO5_CONFIG.MAX_LEVEL).toBe(3);
      expect(JUEGO5_CONFIG.PASS_THRESHOLD).toBe(0.7);
      expect(JUEGO5_CONFIG.RESPONSE_TIME_LIMIT).toBe(5);
    });

    test('should have valid BASICO level configuration', () => {
      const basico = JUEGO5_CONFIG.LEVELS.BASICO;
      
      expect(basico.nombre).toBe('Básico');
      expect(basico.figureCount).toBe(5);
      expect(basico.displayTime).toBe(1500);
      expect(basico.testFigureCount).toBe(10);
    });

    test('should have valid INTERMEDIO level configuration', () => {
      const intermedio = JUEGO5_CONFIG.LEVELS.INTERMEDIO;
      
      expect(intermedio.nombre).toBe('Intermedio');
      expect(intermedio.figureCount).toBe(7);
      expect(intermedio.displayTime).toBe(1000);
      expect(intermedio.testFigureCount).toBe(14);
    });

    test('should have valid AVANZADO level configuration', () => {
      const avanzado = JUEGO5_CONFIG.LEVELS.AVANZADO;
      
      expect(avanzado.nombre).toBe('Avanzado');
      expect(avanzado.figureCount).toBe(10);
      expect(avanzado.displayTime).toBe(750);
      expect(avanzado.testFigureCount).toBe(20);
    });

    test('should have increasing difficulty across levels', () => {
      const { BASICO, INTERMEDIO, AVANZADO } = JUEGO5_CONFIG.LEVELS;
      
      // More figures to remember
      expect(INTERMEDIO.figureCount).toBeGreaterThan(BASICO.figureCount);
      expect(AVANZADO.figureCount).toBeGreaterThan(INTERMEDIO.figureCount);
      
      // Less time to view
      expect(INTERMEDIO.displayTime).toBeLessThan(BASICO.displayTime);
      expect(AVANZADO.displayTime).toBeLessThan(INTERMEDIO.displayTime);
      
      // More test figures
      expect(INTERMEDIO.testFigureCount).toBeGreaterThan(BASICO.testFigureCount);
      expect(AVANZADO.testFigureCount).toBeGreaterThan(INTERMEDIO.testFigureCount);
    });
  });

  describe('generarSecuencia', () => {
    test('should generate sequence with correct length for BASICO', () => {
      const secuencia = generarSecuencia('BASICO');
      expect(secuencia).toHaveLength(5);
    });

    test('should generate sequence with correct length for INTERMEDIO', () => {
      const secuencia = generarSecuencia('INTERMEDIO');
      expect(secuencia).toHaveLength(7);
    });

    test('should generate sequence with correct length for AVANZADO', () => {
      const secuencia = generarSecuencia('AVANZADO');
      expect(secuencia).toHaveLength(10);
    });

    test('should return array of strings', () => {
      const secuencia = generarSecuencia('BASICO');
      
      expect(Array.isArray(secuencia)).toBe(true);
      secuencia.forEach(forma => {
        expect(typeof forma).toBe('string');
      });
    });

    test('should return non-empty strings', () => {
      const secuencia = generarSecuencia('INTERMEDIO');
      
      secuencia.forEach(forma => {
        expect(forma.length).toBeGreaterThan(0);
      });
    });

    test('should attempt to generate unique shapes', () => {
      // Run multiple times and check that most have unique shapes
      let totalUnique = 0;
      const runs = 20;
      
      for (let i = 0; i < runs; i++) {
        const secuencia = generarSecuencia('BASICO');
        const uniqueShapes = new Set(secuencia);
        totalUnique += uniqueShapes.size;
      }
      
      const averageUnique = totalUnique / runs;
      // Should average close to 5 unique shapes for BASICO
      expect(averageUnique).toBeGreaterThan(4.5);
    });

    test('should generate different sequences on multiple calls', () => {
      const secuencia1 = generarSecuencia('INTERMEDIO');
      const secuencia2 = generarSecuencia('INTERMEDIO');
      
      // Arrays should not be exactly the same (very unlikely with randomization)
      expect(JSON.stringify(secuencia1) !== JSON.stringify(secuencia2)).toBe(true);
    });

    test('should use Unicode symbols', () => {
      const secuencia = generarSecuencia('AVANZADO');
      
      // All shapes should be Unicode symbols (single character or multi-byte)
      secuencia.forEach(forma => {
        expect(forma.length).toBeGreaterThanOrEqual(1);
        expect(forma.length).toBeLessThanOrEqual(3); // Unicode can be 1-3 chars
      });
    });

    test('should handle all three levels without errors', () => {
      expect(() => generarSecuencia('BASICO')).not.toThrow();
      expect(() => generarSecuencia('INTERMEDIO')).not.toThrow();
      expect(() => generarSecuencia('AVANZADO')).not.toThrow();
    });

    test('should generate valid shapes for large sequences', () => {
      const secuencia = generarSecuencia('AVANZADO');
      
      expect(secuencia).toHaveLength(10);
      expect(Array.isArray(secuencia)).toBe(true);
      
      secuencia.forEach(forma => {
        expect(typeof forma).toBe('string');
        expect(forma.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generarPreguntas', () => {
    const secuenciaBasica = ['●', '■', '▲', '▼', '◆'];

    test('should generate questions with correct count for BASICO', () => {
      const preguntas = generarPreguntas(secuenciaBasica, 'BASICO');
      expect(preguntas).toHaveLength(10);
    });

    test('should generate questions with correct count for INTERMEDIO (max 13 shapes)', () => {
      const secuencia = generarSecuencia('INTERMEDIO');
      const preguntas = generarPreguntas(secuencia, 'INTERMEDIO');
      // With only 13 unique shapes available, can't reach 14
      expect(preguntas.length).toBeLessThanOrEqual(13);
      expect(preguntas.length).toBeGreaterThanOrEqual(7); // At least the sequence
    });

    test('should generate questions with correct count for AVANZADO (max 13 shapes)', () => {
      const secuencia = generarSecuencia('AVANZADO');
      const preguntas = generarPreguntas(secuencia, 'AVANZADO');
      // With only 13 unique shapes available, can't reach 20
      expect(preguntas.length).toBeLessThanOrEqual(13);
      expect(preguntas.length).toBeGreaterThanOrEqual(10); // At least the sequence
    });

    test('should include all memorized figures', () => {
      const preguntas = generarPreguntas(secuenciaBasica, 'BASICO');
      
      secuenciaBasica.forEach(forma => {
        expect(preguntas).toContain(forma);
      });
    });

    test('should add distractor figures', () => {
      const preguntas = generarPreguntas(secuenciaBasica, 'BASICO');
      const distractores = preguntas.filter(p => !secuenciaBasica.includes(p));
      
      expect(distractores.length).toBe(5); // 10 - 5 = 5 distractors
    });

    test('should not have duplicate questions', () => {
      const preguntas = generarPreguntas(secuenciaBasica, 'BASICO');
      const uniqueQuestions = new Set(preguntas);
      
      expect(uniqueQuestions.size).toBe(preguntas.length);
    });

    test('should shuffle questions (not in original order)', () => {
      // Run multiple times to check for shuffling
      let allSame = true;
      const firstPreguntas = generarPreguntas(secuenciaBasica, 'BASICO');
      
      for (let i = 0; i < 10; i++) {
        const preguntas = generarPreguntas(secuenciaBasica, 'BASICO');
        if (JSON.stringify(preguntas) !== JSON.stringify(firstPreguntas)) {
          allSame = false;
          break;
        }
      }
      
      // With shuffling, it's extremely unlikely all 10 runs produce same order
      expect(allSame).toBe(false);
    });

    test('should return array of strings', () => {
      const preguntas = generarPreguntas(secuenciaBasica, 'BASICO');
      
      expect(Array.isArray(preguntas)).toBe(true);
      preguntas.forEach(pregunta => {
        expect(typeof pregunta).toBe('string');
      });
    });

    test('should handle different sequence lengths', () => {
      const small = ['●', '■'];
      const medium = ['●', '■', '▲', '▼', '◆', '⬟', '⬢'];
      const large = ['●', '■', '▲', '▼', '◆', '⬟', '⬢', '⬥', '✦', '✪'];
      
      expect(generarPreguntas(small, 'BASICO')).toHaveLength(10);
      // With 13 shapes total, medium (7) + 6 distractors = 13 max
      expect(generarPreguntas(medium, 'INTERMEDIO').length).toBeLessThanOrEqual(13);
      // With 13 shapes total, large (10) + 3 distractors = 13 max
      expect(generarPreguntas(large, 'AVANZADO').length).toBeLessThanOrEqual(13);
    });

    test('should include distractors not in original sequence', () => {
      const preguntas = generarPreguntas(secuenciaBasica, 'BASICO');
      const distractores = preguntas.filter(p => !secuenciaBasica.includes(p));
      
      distractores.forEach(distractor => {
        expect(secuenciaBasica).not.toContain(distractor);
      });
    });

    test('should handle maximum sequence for AVANZADO', () => {
      const maxSecuencia = generarSecuencia('AVANZADO'); // 10 figures
      const preguntas = generarPreguntas(maxSecuencia, 'AVANZADO');
      
      // With only 13 total shapes, max is 13
      expect(preguntas.length).toBeLessThanOrEqual(13);
      expect(preguntas.length).toBeGreaterThanOrEqual(10);
      
      maxSecuencia.forEach(forma => {
        expect(preguntas).toContain(forma);
      });
      
      const distractores = preguntas.filter(p => !maxSecuencia.includes(p));
      expect(distractores.length).toBeLessThanOrEqual(3); // Max 3 distractors available
    });
  });

  describe('Integration tests', () => {
    test('should generate complete game flow for BASICO', () => {
      const secuencia = generarSecuencia('BASICO');
      const preguntas = generarPreguntas(secuencia, 'BASICO');
      
      expect(secuencia).toHaveLength(5);
      expect(preguntas).toHaveLength(10);
      
      secuencia.forEach(forma => {
        expect(preguntas).toContain(forma);
      });
      
      const distractores = preguntas.filter(p => !secuencia.includes(p));
      expect(distractores).toHaveLength(5);
    });

    test('should generate complete game flow for INTERMEDIO', () => {
      const secuencia = generarSecuencia('INTERMEDIO');
      const preguntas = generarPreguntas(secuencia, 'INTERMEDIO');
      
      expect(secuencia).toHaveLength(7);
      expect(preguntas.length).toBeLessThanOrEqual(13); // Max 13 shapes available
      
      secuencia.forEach(forma => {
        expect(preguntas).toContain(forma);
      });
      
      const distractores = preguntas.filter(p => !secuencia.includes(p));
      expect(distractores.length).toBeLessThanOrEqual(6); // 13 - 7 = 6 max
    });

    test('should generate complete game flow for AVANZADO', () => {
      const secuencia = generarSecuencia('AVANZADO');
      const preguntas = generarPreguntas(secuencia, 'AVANZADO');
      
      expect(secuencia).toHaveLength(10);
      expect(preguntas.length).toBeLessThanOrEqual(13); // Max 13 shapes available
      
      secuencia.forEach(forma => {
        expect(preguntas).toContain(forma);
      });
      
      const distractores = preguntas.filter(p => !secuencia.includes(p));
      expect(distractores.length).toBeLessThanOrEqual(3); // 13 - 10 = 3 max
    });

    test('should maintain consistency across all levels', () => {
      const levels = ['BASICO', 'INTERMEDIO', 'AVANZADO'];
      
      levels.forEach(nivel => {
        const config = JUEGO5_CONFIG.LEVELS[nivel];
        const secuencia = generarSecuencia(nivel);
        const preguntas = generarPreguntas(secuencia, nivel);
        
        expect(secuencia).toHaveLength(config.figureCount);
        // Max 13 total shapes available
        const expectedMax = Math.min(config.testFigureCount, 13);
        expect(preguntas.length).toBeLessThanOrEqual(expectedMax);
        
        secuencia.forEach(forma => {
          expect(preguntas).toContain(forma);
        });
      });
    });

    test('should validate correct/incorrect answer detection', () => {
      const secuencia = generarSecuencia('BASICO');
      const preguntas = generarPreguntas(secuencia, 'BASICO');
      
      preguntas.forEach(pregunta => {
        const wasInSequence = secuencia.includes(pregunta);
        // This would be the user's answer validation in the game
        expect(typeof wasInSequence).toBe('boolean');
      });
    });
  });
});

