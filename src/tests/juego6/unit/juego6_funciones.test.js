import {
  generarEnsayo,
  verificarRespuesta,
  calcularRetraso
} from '../../../components/Games/juego6/juego6_funciones';

describe('Juego6 - Posner Haciendo Cola (Attention Task)', () => {
  describe('generarEnsayo', () => {
    test('should return object with required properties', () => {
      const ensayo = generarEnsayo(true);
      
      expect(ensayo).toHaveProperty('direccionFlecha');
      expect(ensayo).toHaveProperty('ubicacionEstimulo');
      expect(ensayo).toHaveProperty('congruente');
    });

    test('should return valid direccionFlecha (izquierda or derecha)', () => {
      for (let i = 0; i < 20; i++) {
        const ensayo = generarEnsayo(true);
        expect(['izquierda', 'derecha']).toContain(ensayo.direccionFlecha);
      }
    });

    test('should return valid ubicacionEstimulo (izquierda or derecha)', () => {
      for (let i = 0; i < 20; i++) {
        const ensayo = generarEnsayo(true);
        expect(['izquierda', 'derecha']).toContain(ensayo.ubicacionEstimulo);
      }
    });

    test('should return congruente value matching input', () => {
      const ensayoCongruente = generarEnsayo(true);
      const ensayoIncongruente = generarEnsayo(false);
      
      expect(ensayoCongruente.congruente).toBe(true);
      expect(ensayoIncongruente.congruente).toBe(false);
    });

    describe('congruent trials', () => {
      test('should generate congruent trial where arrow and stimulus match', () => {
        const ensayo = generarEnsayo(true);
        
        expect(ensayo.congruente).toBe(true);
        expect(ensayo.direccionFlecha).toBe(ensayo.ubicacionEstimulo);
      });

      test('should generate different arrow directions for congruent trials', () => {
        const direcciones = new Set();
        
        for (let i = 0; i < 30; i++) {
          const ensayo = generarEnsayo(true);
          direcciones.add(ensayo.direccionFlecha);
        }
        
        // Should have both directions over 30 trials
        expect(direcciones.size).toBe(2);
        expect(direcciones.has('izquierda')).toBe(true);
        expect(direcciones.has('derecha')).toBe(true);
      });

      test('should always match direction and location in congruent trials', () => {
        for (let i = 0; i < 50; i++) {
          const ensayo = generarEnsayo(true);
          expect(ensayo.direccionFlecha).toBe(ensayo.ubicacionEstimulo);
        }
      });
    });

    describe('incongruent trials', () => {
      test('should generate incongruent trial where arrow and stimulus differ', () => {
        const ensayo = generarEnsayo(false);
        
        expect(ensayo.congruente).toBe(false);
        expect(ensayo.direccionFlecha).not.toBe(ensayo.ubicacionEstimulo);
      });

      test('should generate different arrow directions for incongruent trials', () => {
        const direcciones = new Set();
        
        for (let i = 0; i < 30; i++) {
          const ensayo = generarEnsayo(false);
          direcciones.add(ensayo.direccionFlecha);
        }
        
        // Should have both directions over 30 trials
        expect(direcciones.size).toBe(2);
        expect(direcciones.has('izquierda')).toBe(true);
        expect(direcciones.has('derecha')).toBe(true);
      });

      test('should always have opposite direction and location in incongruent trials', () => {
        for (let i = 0; i < 50; i++) {
          const ensayo = generarEnsayo(false);
          expect(ensayo.direccionFlecha).not.toBe(ensayo.ubicacionEstimulo);
          
          if (ensayo.direccionFlecha === 'izquierda') {
            expect(ensayo.ubicacionEstimulo).toBe('derecha');
          } else {
            expect(ensayo.ubicacionEstimulo).toBe('izquierda');
          }
        }
      });
    });

    test('should generate randomized arrow directions over multiple calls', () => {
      const ensayos = [];
      
      for (let i = 0; i < 10; i++) {
        ensayos.push(generarEnsayo(true));
      }
      
      // Check that we don't always get the same direction
      const allSame = ensayos.every(e => e.direccionFlecha === ensayos[0].direccionFlecha);
      expect(allSame).toBe(false);
    });
  });

  describe('verificarRespuesta', () => {
    test('should return true when response matches stimulus location', () => {
      expect(verificarRespuesta('izquierda', 'izquierda')).toBe(true);
      expect(verificarRespuesta('derecha', 'derecha')).toBe(true);
    });

    test('should return false when response does not match stimulus location', () => {
      expect(verificarRespuesta('izquierda', 'derecha')).toBe(false);
      expect(verificarRespuesta('derecha', 'izquierda')).toBe(false);
    });

    test('should handle all possible combinations', () => {
      const combinations = [
        { respuesta: 'izquierda', estimulo: 'izquierda', expected: true },
        { respuesta: 'izquierda', estimulo: 'derecha', expected: false },
        { respuesta: 'derecha', estimulo: 'izquierda', expected: false },
        { respuesta: 'derecha', estimulo: 'derecha', expected: true }
      ];

      combinations.forEach(({ respuesta, estimulo, expected }) => {
        expect(verificarRespuesta(respuesta, estimulo)).toBe(expected);
      });
    });

    test('should work with actual ensayo data', () => {
      const ensayo = generarEnsayo(true);
      
      // Correct response (responding to stimulus location)
      const correctResponse = verificarRespuesta(ensayo.ubicacionEstimulo, ensayo.ubicacionEstimulo);
      expect(correctResponse).toBe(true);
      
      // Incorrect response
      const incorrectLocation = ensayo.ubicacionEstimulo === 'izquierda' ? 'derecha' : 'izquierda';
      const incorrectResponse = verificarRespuesta(incorrectLocation, ensayo.ubicacionEstimulo);
      expect(incorrectResponse).toBe(false);
    });
  });

  describe('calcularRetraso', () => {
    test('should return a number', () => {
      const retraso = calcularRetraso();
      expect(typeof retraso).toBe('number');
    });

    test('should return value between 300ms and 1000ms', () => {
      for (let i = 0; i < 100; i++) {
        const retraso = calcularRetraso();
        expect(retraso).toBeGreaterThanOrEqual(300);
        expect(retraso).toBeLessThanOrEqual(1000);
      }
    });

    test('should return an integer value', () => {
      for (let i = 0; i < 50; i++) {
        const retraso = calcularRetraso();
        expect(Number.isInteger(retraso)).toBe(true);
      }
    });

    test('should generate different values over multiple calls', () => {
      const retrasos = new Set();
      
      for (let i = 0; i < 100; i++) {
        retrasos.add(calcularRetraso());
      }
      
      // Should generate multiple different values
      expect(retrasos.size).toBeGreaterThan(10);
    });

    test('should produce values distributed across the range', () => {
      const retrasos = [];
      
      for (let i = 0; i < 200; i++) {
        retrasos.push(calcularRetraso());
      }
      
      // Check that we have values in different parts of the range
      const hasLow = retrasos.some(r => r < 500);
      const hasMid = retrasos.some(r => r >= 500 && r < 800);
      const hasHigh = retrasos.some(r => r >= 800);
      
      expect(hasLow).toBe(true);
      expect(hasMid).toBe(true);
      expect(hasHigh).toBe(true);
    });

    test('should have average around 650ms (middle of range)', () => {
      const retrasos = [];
      
      for (let i = 0; i < 500; i++) {
        retrasos.push(calcularRetraso());
      }
      
      const average = retrasos.reduce((sum, r) => sum + r, 0) / retrasos.length;
      
      // Average should be around 650 (middle of 300-1000)
      // Allow some variance due to randomness
      expect(average).toBeGreaterThan(600);
      expect(average).toBeLessThan(700);
    });
  });

  describe('Integration tests', () => {
    test('should simulate a complete congruent trial', () => {
      const ensayo = generarEnsayo(true);
      const retraso = calcularRetraso();
      
      expect(ensayo.congruente).toBe(true);
      expect(ensayo.direccionFlecha).toBe(ensayo.ubicacionEstimulo);
      expect(retraso).toBeGreaterThanOrEqual(300);
      expect(retraso).toBeLessThanOrEqual(1000);
      
      // User responds to stimulus location (correct)
      const resultado = verificarRespuesta(ensayo.ubicacionEstimulo, ensayo.ubicacionEstimulo);
      expect(resultado).toBe(true);
    });

    test('should simulate a complete incongruent trial', () => {
      const ensayo = generarEnsayo(false);
      const retraso = calcularRetraso();
      
      expect(ensayo.congruente).toBe(false);
      expect(ensayo.direccionFlecha).not.toBe(ensayo.ubicacionEstimulo);
      expect(retraso).toBeGreaterThanOrEqual(300);
      expect(retraso).toBeLessThanOrEqual(1000);
      
      // User responds to stimulus location (correct)
      const resultado = verificarRespuesta(ensayo.ubicacionEstimulo, ensayo.ubicacionEstimulo);
      expect(resultado).toBe(true);
    });

    test('should detect error when user follows arrow instead of stimulus', () => {
      const ensayo = generarEnsayo(false); // Incongruent trial
      
      // User incorrectly follows the arrow direction instead of stimulus location
      const resultado = verificarRespuesta(ensayo.direccionFlecha, ensayo.ubicacionEstimulo);
      expect(resultado).toBe(false);
    });

    test('should simulate multiple trials with varying congruency', () => {
      const trials = [
        { congruente: true, correct: true },
        { congruente: false, correct: true },
        { congruente: true, correct: false },
        { congruente: false, correct: false }
      ];

      trials.forEach(({ congruente, correct }) => {
        const ensayo = generarEnsayo(congruente);
        const retraso = calcularRetraso();
        
        expect(ensayo.congruente).toBe(congruente);
        expect(retraso).toBeGreaterThanOrEqual(300);
        
        if (correct) {
          // Respond to stimulus location
          const resultado = verificarRespuesta(ensayo.ubicacionEstimulo, ensayo.ubicacionEstimulo);
          expect(resultado).toBe(true);
        } else {
          // Respond to wrong location
          const wrongLocation = ensayo.ubicacionEstimulo === 'izquierda' ? 'derecha' : 'izquierda';
          const resultado = verificarRespuesta(wrongLocation, ensayo.ubicacionEstimulo);
          expect(resultado).toBe(false);
        }
      });
    });

    test('should demonstrate Posner effect (harder to respond correctly on incongruent trials)', () => {
      // This test simulates the expected behavioral pattern
      const congruentTrial = generarEnsayo(true);
      const incongruentTrial = generarEnsayo(false);
      
      // Both trials should be verifiable
      expect(verificarRespuesta(congruentTrial.ubicacionEstimulo, congruentTrial.ubicacionEstimulo)).toBe(true);
      expect(verificarRespuesta(incongruentTrial.ubicacionEstimulo, incongruentTrial.ubicacionEstimulo)).toBe(true);
      
      // But incongruent trials have conflicting arrow direction
      expect(congruentTrial.direccionFlecha).toBe(congruentTrial.ubicacionEstimulo);
      expect(incongruentTrial.direccionFlecha).not.toBe(incongruentTrial.ubicacionEstimulo);
    });

    test('should generate balanced trials over multiple runs', () => {
      const trials = {
        congruent: { left: 0, right: 0 },
        incongruent: { left: 0, right: 0 }
      };
      
      for (let i = 0; i < 100; i++) {
        const congruent = generarEnsayo(true);
        const incongruent = generarEnsayo(false);
        
        if (congruent.ubicacionEstimulo === 'izquierda') trials.congruent.left++;
        else trials.congruent.right++;
        
        if (incongruent.ubicacionEstimulo === 'izquierda') trials.incongruent.left++;
        else trials.incongruent.right++;
      }
      
      // Should have roughly balanced left/right for both types
      expect(trials.congruent.left).toBeGreaterThan(30);
      expect(trials.congruent.right).toBeGreaterThan(30);
      expect(trials.incongruent.left).toBeGreaterThan(30);
      expect(trials.incongruent.right).toBeGreaterThan(30);
    });
  });
});

