import {
  generarCirculos,
  generarSecuencia,
  JUEGO7_CONFIG
} from '../../../components/Games/juego7/juego7_funciones';

describe('Juego7 - Forward Memory Span (Bloques de Corsi)', () => {
  describe('JUEGO7_CONFIG', () => {
    test('should have valid configuration values', () => {
      expect(JUEGO7_CONFIG.START_LEVEL).toBe(1);
      expect(JUEGO7_CONFIG.MAX_LEVEL).toBe(3);
      expect(JUEGO7_CONFIG.ACIERTOS_PARA_AUMENTAR).toBe(3);
      expect(JUEGO7_CONFIG.FALLOS_CONSECUTIVOS_PARA_TERMINAR).toBe(2);
    });

    test('should have valid BASICO level configuration', () => {
      const basico = JUEGO7_CONFIG.LEVELS.BASICO;
      
      expect(basico.nombre).toBe('Básico');
      expect(basico.numCirculos).toBe(8);
      expect(basico.tiempoResaltado).toBe(400);
      expect(basico.tiempoEntrePasos).toBe(400);
      expect(basico.secuenciaInicial).toBe(3);
    });

    test('should have valid INTERMEDIO level configuration', () => {
      const intermedio = JUEGO7_CONFIG.LEVELS.INTERMEDIO;
      
      expect(intermedio.nombre).toBe('Intermedio');
      expect(intermedio.numCirculos).toBe(10);
      expect(intermedio.tiempoResaltado).toBe(333);
      expect(intermedio.tiempoEntrePasos).toBe(333);
      expect(intermedio.secuenciaInicial).toBe(3);
    });

    test('should have valid AVANZADO level configuration', () => {
      const avanzado = JUEGO7_CONFIG.LEVELS.AVANZADO;
      
      expect(avanzado.nombre).toBe('Avanzado');
      expect(avanzado.numCirculos).toBe(12);
      expect(avanzado.tiempoResaltado).toBe(300);
      expect(avanzado.tiempoEntrePasos).toBe(300);
      expect(avanzado.secuenciaInicial).toBe(4);
    });

    test('should have increasing difficulty across levels', () => {
      const { BASICO, INTERMEDIO, AVANZADO } = JUEGO7_CONFIG.LEVELS;
      
      // More circles to track
      expect(INTERMEDIO.numCirculos).toBeGreaterThan(BASICO.numCirculos);
      expect(AVANZADO.numCirculos).toBeGreaterThan(INTERMEDIO.numCirculos);
      
      // Faster timing (less time)
      expect(INTERMEDIO.tiempoResaltado).toBeLessThan(BASICO.tiempoResaltado);
      expect(AVANZADO.tiempoResaltado).toBeLessThan(INTERMEDIO.tiempoResaltado);
      
      // Longer initial sequence for advanced
      expect(AVANZADO.secuenciaInicial).toBeGreaterThan(BASICO.secuenciaInicial);
    });
  });

  describe('generarCirculos', () => {
    test('should generate correct number of circles', () => {
      const circulos = generarCirculos(8);
      expect(circulos).toHaveLength(8);
    });

    test('should generate array of position objects', () => {
      const circulos = generarCirculos(5);
      
      expect(Array.isArray(circulos)).toBe(true);
      circulos.forEach(circulo => {
        expect(circulo).toHaveProperty('top');
        expect(circulo).toHaveProperty('left');
      });
    });

    test('should generate positions as percentage strings', () => {
      const circulos = generarCirculos(5);
      
      circulos.forEach(circulo => {
        expect(typeof circulo.top).toBe('string');
        expect(typeof circulo.left).toBe('string');
        expect(circulo.top).toMatch(/%$/);
        expect(circulo.left).toMatch(/%$/);
      });
    });

    test('should generate positions within valid range (0-80%)', () => {
      const circulos = generarCirculos(10);
      
      circulos.forEach(circulo => {
        const topValue = parseInt(circulo.top);
        const leftValue = parseInt(circulo.left);
        
        expect(topValue).toBeGreaterThanOrEqual(0);
        expect(topValue).toBeLessThanOrEqual(80);
        expect(leftValue).toBeGreaterThanOrEqual(0);
        expect(leftValue).toBeLessThanOrEqual(80);
      });
    });

    test('should avoid collisions (minimum distance between circles)', () => {
      const circulos = generarCirculos(12);
      const minDistancia = 12;
      
      for (let i = 0; i < circulos.length; i++) {
        for (let j = i + 1; j < circulos.length; j++) {
          const distanciaTop = Math.abs(parseInt(circulos[i].top) - parseInt(circulos[j].top));
          const distanciaLeft = Math.abs(parseInt(circulos[i].left) - parseInt(circulos[j].left));
          
          // At least one dimension should be separated by minimum distance
          const noCollision = distanciaTop >= minDistancia || distanciaLeft >= minDistancia;
          expect(noCollision).toBe(true);
        }
      }
    });

    test('should generate different positions for each circle', () => {
      const circulos = generarCirculos(8);
      const positions = circulos.map(c => `${c.top},${c.left}`);
      const uniquePositions = new Set(positions);
      
      expect(uniquePositions.size).toBe(circulos.length);
    });

    test('should generate different layouts on multiple calls', () => {
      const layout1 = generarCirculos(5);
      const layout2 = generarCirculos(5);
      
      const same = JSON.stringify(layout1) === JSON.stringify(layout2);
      expect(same).toBe(false);
    });

    test('should handle different quantities of circles', () => {
      expect(() => generarCirculos(3)).not.toThrow();
      expect(() => generarCirculos(8)).not.toThrow();
      expect(() => generarCirculos(10)).not.toThrow();
      expect(() => generarCirculos(12)).not.toThrow();
      
      expect(generarCirculos(3)).toHaveLength(3);
      expect(generarCirculos(8)).toHaveLength(8);
      expect(generarCirculos(10)).toHaveLength(10);
      expect(generarCirculos(12)).toHaveLength(12);
    });

    test('should work with BASICO level configuration', () => {
      const numCirculos = JUEGO7_CONFIG.LEVELS.BASICO.numCirculos;
      const circulos = generarCirculos(numCirculos);
      
      expect(circulos).toHaveLength(8);
    });

    test('should work with INTERMEDIO level configuration', () => {
      const numCirculos = JUEGO7_CONFIG.LEVELS.INTERMEDIO.numCirculos;
      const circulos = generarCirculos(numCirculos);
      
      expect(circulos).toHaveLength(10);
    });

    test('should work with AVANZADO level configuration', () => {
      const numCirculos = JUEGO7_CONFIG.LEVELS.AVANZADO.numCirculos;
      const circulos = generarCirculos(numCirculos);
      
      expect(circulos).toHaveLength(12);
    });
  });

  describe('generarSecuencia', () => {
    test('should generate sequence of correct length', () => {
      const secuencia = generarSecuencia(8, 3);
      expect(secuencia).toHaveLength(3);
    });

    test('should generate array of numbers', () => {
      const secuencia = generarSecuencia(10, 5);
      
      expect(Array.isArray(secuencia)).toBe(true);
      secuencia.forEach(indice => {
        expect(typeof indice).toBe('number');
      });
    });

    test('should generate indices within valid range', () => {
      const max = 8;
      const secuencia = generarSecuencia(max, 5);
      
      secuencia.forEach(indice => {
        expect(indice).toBeGreaterThanOrEqual(0);
        expect(indice).toBeLessThan(max);
      });
    });

    test('should generate different sequences on multiple calls', () => {
      const secuencia1 = generarSecuencia(8, 4);
      const secuencia2 = generarSecuencia(8, 4);
      
      const same = JSON.stringify(secuencia1) === JSON.stringify(secuencia2);
      expect(same).toBe(false);
    });

    test('should handle different sequence lengths', () => {
      expect(generarSecuencia(8, 1)).toHaveLength(1);
      expect(generarSecuencia(8, 3)).toHaveLength(3);
      expect(generarSecuencia(8, 5)).toHaveLength(5);
      expect(generarSecuencia(8, 8)).toHaveLength(8);
    });

    test('should allow repetition of indices (circles can repeat)', () => {
      // With a large sequence, repetitions are expected
      const secuencia = generarSecuencia(5, 20);
      const uniqueIndices = new Set(secuencia);
      
      // If no repetition allowed, this would be impossible
      // So we expect repetitions
      expect(uniqueIndices.size).toBeLessThan(secuencia.length);
    });

    test('should work with BASICO initial sequence length', () => {
      const config = JUEGO7_CONFIG.LEVELS.BASICO;
      const secuencia = generarSecuencia(config.numCirculos, config.secuenciaInicial);
      
      expect(secuencia).toHaveLength(3);
      secuencia.forEach(indice => {
        expect(indice).toBeGreaterThanOrEqual(0);
        expect(indice).toBeLessThan(8);
      });
    });

    test('should work with INTERMEDIO initial sequence length', () => {
      const config = JUEGO7_CONFIG.LEVELS.INTERMEDIO;
      const secuencia = generarSecuencia(config.numCirculos, config.secuenciaInicial);
      
      expect(secuencia).toHaveLength(3);
      secuencia.forEach(indice => {
        expect(indice).toBeGreaterThanOrEqual(0);
        expect(indice).toBeLessThan(10);
      });
    });

    test('should work with AVANZADO initial sequence length', () => {
      const config = JUEGO7_CONFIG.LEVELS.AVANZADO;
      const secuencia = generarSecuencia(config.numCirculos, config.secuenciaInicial);
      
      expect(secuencia).toHaveLength(4);
      secuencia.forEach(indice => {
        expect(indice).toBeGreaterThanOrEqual(0);
        expect(indice).toBeLessThan(12);
      });
    });

    test('should distribute indices across the range', () => {
      const samples = [];
      for (let i = 0; i < 100; i++) {
        samples.push(...generarSecuencia(10, 5));
      }
      
      const uniqueIndices = new Set(samples);
      
      // Should use most or all available indices over many samples
      expect(uniqueIndices.size).toBeGreaterThanOrEqual(8);
    });

    test('should handle edge case of sequence length 1', () => {
      const secuencia = generarSecuencia(8, 1);
      
      expect(secuencia).toHaveLength(1);
      expect(secuencia[0]).toBeGreaterThanOrEqual(0);
      expect(secuencia[0]).toBeLessThan(8);
    });

    test('should handle sequence as long as max circles', () => {
      const secuencia = generarSecuencia(8, 8);
      
      expect(secuencia).toHaveLength(8);
      secuencia.forEach(indice => {
        expect(indice).toBeGreaterThanOrEqual(0);
        expect(indice).toBeLessThan(8);
      });
    });
  });

  describe('Integration tests', () => {
    test('should generate complete game setup for BASICO level', () => {
      const config = JUEGO7_CONFIG.LEVELS.BASICO;
      const circulos = generarCirculos(config.numCirculos);
      const secuencia = generarSecuencia(config.numCirculos, config.secuenciaInicial);
      
      expect(circulos).toHaveLength(8);
      expect(secuencia).toHaveLength(3);
      
      // Verify sequence indices are valid for generated circles
      secuencia.forEach(indice => {
        expect(indice).toBeLessThan(circulos.length);
        expect(circulos[indice]).toBeDefined();
      });
    });

    test('should generate complete game setup for INTERMEDIO level', () => {
      const config = JUEGO7_CONFIG.LEVELS.INTERMEDIO;
      const circulos = generarCirculos(config.numCirculos);
      const secuencia = generarSecuencia(config.numCirculos, config.secuenciaInicial);
      
      expect(circulos).toHaveLength(10);
      expect(secuencia).toHaveLength(3);
      
      secuencia.forEach(indice => {
        expect(indice).toBeLessThan(circulos.length);
        expect(circulos[indice]).toBeDefined();
      });
    });

    test('should generate complete game setup for AVANZADO level', () => {
      const config = JUEGO7_CONFIG.LEVELS.AVANZADO;
      const circulos = generarCirculos(config.numCirculos);
      const secuencia = generarSecuencia(config.numCirculos, config.secuenciaInicial);
      
      expect(circulos).toHaveLength(12);
      expect(secuencia).toHaveLength(4);
      
      secuencia.forEach(indice => {
        expect(indice).toBeLessThan(circulos.length);
        expect(circulos[indice]).toBeDefined();
      });
    });

    test('should simulate progression from initial to longer sequences', () => {
      const config = JUEGO7_CONFIG.LEVELS.BASICO;
      const circulos = generarCirculos(config.numCirculos);
      
      // Simulate increasing sequence length as player progresses
      const secuencias = [
        generarSecuencia(config.numCirculos, 3),  // Initial
        generarSecuencia(config.numCirculos, 4),  // After 3 correct
        generarSecuencia(config.numCirculos, 5),  // After 3 more correct
        generarSecuencia(config.numCirculos, 6)   // Advanced
      ];
      
      expect(secuencias[0]).toHaveLength(3);
      expect(secuencias[1]).toHaveLength(4);
      expect(secuencias[2]).toHaveLength(5);
      expect(secuencias[3]).toHaveLength(6);
      
      // All sequences should be valid
      secuencias.forEach(secuencia => {
        secuencia.forEach(indice => {
          expect(indice).toBeLessThan(circulos.length);
          expect(circulos[indice]).toBeDefined();
        });
      });
    });

    test('should validate all levels work together', () => {
      const levels = ['BASICO', 'INTERMEDIO', 'AVANZADO'];
      
      levels.forEach(nivel => {
        const config = JUEGO7_CONFIG.LEVELS[nivel];
        const circulos = generarCirculos(config.numCirculos);
        const secuencia = generarSecuencia(config.numCirculos, config.secuenciaInicial);
        
        expect(circulos).toHaveLength(config.numCirculos);
        expect(secuencia).toHaveLength(config.secuenciaInicial);
        
        secuencia.forEach(indice => {
          expect(indice).toBeGreaterThanOrEqual(0);
          expect(indice).toBeLessThan(config.numCirculos);
        });
      });
    });

    test('should maintain spatial separation in realistic game setup', () => {
      const config = JUEGO7_CONFIG.LEVELS.AVANZADO;
      const circulos = generarCirculos(config.numCirculos);
      
      // Check that circles don't overlap
      const minDistancia = 12;
      for (let i = 0; i < circulos.length; i++) {
        for (let j = i + 1; j < circulos.length; j++) {
          const distanciaTop = Math.abs(parseInt(circulos[i].top) - parseInt(circulos[j].top));
          const distanciaLeft = Math.abs(parseInt(circulos[i].left) - parseInt(circulos[j].left));
          
          const noCollision = distanciaTop >= minDistancia || distanciaLeft >= minDistancia;
          expect(noCollision).toBe(true);
        }
      }
    });
  });
});

