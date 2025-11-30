import {
  patrones,
  verificarRespuesta,
  obtenerPatronesPorCategoria,
  obtenerPatronesPorNivel,
  obtenerPatrones2x2,
  obtenerPatrones3x3,
  obtenerNombreNivel,
  determinarNivelDificultad,
  obtenerDescripcionNivel,
  obtenerTiempoPorNivel
} from '../../../components/Games/juego2/juego2_funciones';

describe('Juego2 - Matrices Progresivas', () => {
  describe('patrones array', () => {
    test('should have valid structure for all patterns', () => {
      expect(Array.isArray(patrones)).toBe(true);
      expect(patrones.length).toBeGreaterThan(0);
      
      patrones.forEach((patron, index) => {
        expect(patron).toHaveProperty('id');
        expect(patron).toHaveProperty('nivel');
        expect(patron).toHaveProperty('grid');
        expect(patron).toHaveProperty('options');
        expect(patron).toHaveProperty('correct');
        expect(patron).toHaveProperty('recomendacion');
        
        expect(typeof patron.id).toBe('string');
        expect(typeof patron.nivel).toBe('number');
        expect(Array.isArray(patron.grid)).toBe(true);
        expect(Array.isArray(patron.options)).toBe(true);
        expect(typeof patron.correct).toBe('number');
        expect(typeof patron.recomendacion).toBe('string');
      });
    });

    test('should have 6 options for each pattern', () => {
      patrones.forEach(patron => {
        expect(patron.options).toHaveLength(6);
      });
    });

    test('should have valid correct answer index (0-5)', () => {
      patrones.forEach(patron => {
        expect(patron.correct).toBeGreaterThanOrEqual(0);
        expect(patron.correct).toBeLessThan(6);
      });
    });

    test('should have 2x2 patterns', () => {
      const patrones2x2 = patrones.filter(p => p.id.includes('2x2'));
      expect(patrones2x2.length).toBeGreaterThan(0);
    });

    test('should have 3x3 patterns', () => {
      const patrones3x3 = patrones.filter(p => p.id.includes('3x3'));
      expect(patrones3x3.length).toBeGreaterThan(0);
    });

    test('should have category C, D, and E patterns', () => {
      const categoriaC = patrones.filter(p => p.categoria === 'C');
      const categoriaD = patrones.filter(p => p.categoria === 'D');
      const categoriaE = patrones.filter(p => p.categoria === 'E');
      
      expect(categoriaC.length).toBeGreaterThan(0);
      expect(categoriaD.length).toBeGreaterThan(0);
      expect(categoriaE.length).toBeGreaterThan(0);
    });

    test('should have patterns for levels 1-4', () => {
      const nivel1 = patrones.filter(p => p.nivel === 1);
      const nivel2 = patrones.filter(p => p.nivel === 2);
      const nivel3 = patrones.filter(p => p.nivel === 3);
      const nivel4 = patrones.filter(p => p.nivel === 4);
      
      expect(nivel1.length).toBeGreaterThan(0);
      expect(nivel2.length).toBeGreaterThan(0);
      expect(nivel3.length).toBeGreaterThan(0);
      expect(nivel4.length).toBeGreaterThan(0);
    });
  });

  describe('verificarRespuesta', () => {
    test('should return true when selection matches correct answer', () => {
      expect(verificarRespuesta(0, 0)).toBe(true);
      expect(verificarRespuesta(3, 3)).toBe(true);
      expect(verificarRespuesta(5, 5)).toBe(true);
    });

    test('should return false when selection does not match correct answer', () => {
      expect(verificarRespuesta(0, 1)).toBe(false);
      expect(verificarRespuesta(2, 5)).toBe(false);
      expect(verificarRespuesta(5, 0)).toBe(false);
    });

    test('should handle all valid indices (0-5)', () => {
      for (let i = 0; i < 6; i++) {
        expect(verificarRespuesta(i, i)).toBe(true);
        expect(verificarRespuesta(i, (i + 1) % 6)).toBe(false);
      }
    });
  });

  describe('obtenerPatronesPorCategoria', () => {
    test('should return only category C patterns', () => {
      const categoriaC = obtenerPatronesPorCategoria('C');
      
      expect(Array.isArray(categoriaC)).toBe(true);
      expect(categoriaC.length).toBeGreaterThan(0);
      
      categoriaC.forEach(patron => {
        expect(patron.categoria).toBe('C');
      });
    });

    test('should return only category D patterns', () => {
      const categoriaD = obtenerPatronesPorCategoria('D');
      
      expect(Array.isArray(categoriaD)).toBe(true);
      expect(categoriaD.length).toBeGreaterThan(0);
      
      categoriaD.forEach(patron => {
        expect(patron.categoria).toBe('D');
      });
    });

    test('should return only category E patterns', () => {
      const categoriaE = obtenerPatronesPorCategoria('E');
      
      expect(Array.isArray(categoriaE)).toBe(true);
      expect(categoriaE.length).toBeGreaterThan(0);
      
      categoriaE.forEach(patron => {
        expect(patron.categoria).toBe('E');
      });
    });

    test('should return empty array for non-existent category', () => {
      const result = obtenerPatronesPorCategoria('Z');
      expect(result).toEqual([]);
    });

    test('should return 12 patterns for category C', () => {
      const categoriaC = obtenerPatronesPorCategoria('C');
      expect(categoriaC).toHaveLength(12);
    });

    test('should return 11 patterns for category D', () => {
      const categoriaD = obtenerPatronesPorCategoria('D');
      expect(categoriaD).toHaveLength(11);
    });

    test('should return 12 patterns for category E', () => {
      const categoriaE = obtenerPatronesPorCategoria('E');
      expect(categoriaE).toHaveLength(12);
    });
  });

  describe('obtenerPatronesPorNivel', () => {
    test('should return only nivel 1 patterns', () => {
      const nivel1 = obtenerPatronesPorNivel(1);
      
      expect(Array.isArray(nivel1)).toBe(true);
      expect(nivel1.length).toBeGreaterThan(0);
      
      nivel1.forEach(patron => {
        expect(patron.nivel).toBe(1);
      });
    });

    test('should return only nivel 2 patterns', () => {
      const nivel2 = obtenerPatronesPorNivel(2);
      
      expect(Array.isArray(nivel2)).toBe(true);
      expect(nivel2.length).toBeGreaterThan(0);
      
      nivel2.forEach(patron => {
        expect(patron.nivel).toBe(2);
      });
    });

    test('should return only nivel 3 patterns', () => {
      const nivel3 = obtenerPatronesPorNivel(3);
      
      expect(Array.isArray(nivel3)).toBe(true);
      expect(nivel3.length).toBeGreaterThan(0);
      
      nivel3.forEach(patron => {
        expect(patron.nivel).toBe(3);
      });
    });

    test('should return only nivel 4 patterns', () => {
      const nivel4 = obtenerPatronesPorNivel(4);
      
      expect(Array.isArray(nivel4)).toBe(true);
      expect(nivel4.length).toBeGreaterThan(0);
      
      nivel4.forEach(patron => {
        expect(patron.nivel).toBe(4);
      });
    });

    test('should return empty array for non-existent level', () => {
      const result = obtenerPatronesPorNivel(99);
      expect(result).toEqual([]);
    });
  });

  describe('obtenerPatrones2x2', () => {
    test('should return only 2x2 patterns', () => {
      const patrones2x2 = obtenerPatrones2x2();
      
      expect(Array.isArray(patrones2x2)).toBe(true);
      expect(patrones2x2.length).toBeGreaterThan(0);
      
      patrones2x2.forEach(patron => {
        expect(patron.id).toMatch(/2x2/);
      });
    });

    test('should return exactly 2 patterns', () => {
      const patrones2x2 = obtenerPatrones2x2();
      expect(patrones2x2).toHaveLength(2);
    });

    test('should all be nivel 1', () => {
      const patrones2x2 = obtenerPatrones2x2();
      
      patrones2x2.forEach(patron => {
        expect(patron.nivel).toBe(1);
      });
    });
  });

  describe('obtenerPatrones3x3', () => {
    test('should return only 3x3 patterns', () => {
      const patrones3x3 = obtenerPatrones3x3();
      
      expect(Array.isArray(patrones3x3)).toBe(true);
      expect(patrones3x3.length).toBeGreaterThan(0);
      
      patrones3x3.forEach(patron => {
        expect(patron.id).toMatch(/3x3/);
      });
    });

    test('should return 35 patterns (12 C + 11 D + 12 E)', () => {
      const patrones3x3 = obtenerPatrones3x3();
      expect(patrones3x3).toHaveLength(35);
    });

    test('should all be nivel 2, 3, or 4', () => {
      const patrones3x3 = obtenerPatrones3x3();
      
      patrones3x3.forEach(patron => {
        expect([2, 3, 4]).toContain(patron.nivel);
      });
    });
  });

  describe('obtenerNombreNivel', () => {
    test('should return correct name for nivel 1', () => {
      expect(obtenerNombreNivel(1)).toBe('Básico');
    });

    test('should return correct name for nivel 2', () => {
      expect(obtenerNombreNivel(2)).toBe('Intermedio');
    });

    test('should return correct name for nivel 3', () => {
      expect(obtenerNombreNivel(3)).toBe('Avanzado');
    });

    test('should return correct name for nivel 4', () => {
      expect(obtenerNombreNivel(4)).toBe('Experto');
    });

    test('should return "Desconocido" for invalid level', () => {
      expect(obtenerNombreNivel(0)).toBe('Desconocido');
      expect(obtenerNombreNivel(5)).toBe('Desconocido');
      expect(obtenerNombreNivel(99)).toBe('Desconocido');
    });
  });

  describe('determinarNivelDificultad', () => {
    test('should return "experto" for nivel 4 with high precision', () => {
      const result = determinarNivelDificultad(10, 85, 4);
      expect(result).toBe('experto');
    });

    test('should return "experto" for nivel 4 with exactly 80% precision', () => {
      const result = determinarNivelDificultad(10, 80, 4);
      expect(result).toBe('experto');
    });

    test('should return "avanzado" for nivel 3 with 70% precision', () => {
      const result = determinarNivelDificultad(8, 70, 3);
      expect(result).toBe('avanzado');
    });

    test('should return "avanzado" for nivel 3 with high precision', () => {
      const result = determinarNivelDificultad(8, 85, 3);
      expect(result).toBe('avanzado');
    });

    test('should return "intermedio" for nivel 2 with 60% precision', () => {
      const result = determinarNivelDificultad(5, 60, 2);
      expect(result).toBe('intermedio');
    });

    test('should return "intermedio" for nivel 2 with high precision', () => {
      const result = determinarNivelDificultad(5, 80, 2);
      expect(result).toBe('intermedio');
    });

    test('should return "basico" for nivel 1', () => {
      const result = determinarNivelDificultad(2, 60, 1);
      expect(result).toBe('basico');
    });

    test('should return "basico" for low precision at any level', () => {
      expect(determinarNivelDificultad(10, 50, 4)).toBe('basico');
      expect(determinarNivelDificultad(8, 50, 3)).toBe('basico');
      expect(determinarNivelDificultad(5, 50, 2)).toBe('basico');
    });

    test('should handle edge cases with precision just below threshold', () => {
      // 79% at nivel 4 is still "avanzado" (needs 80% for expert)
      expect(determinarNivelDificultad(10, 79, 4)).toBe('avanzado');
      // 69% at nivel 3 is still "intermedio" (needs 70% for advanced)
      expect(determinarNivelDificultad(8, 69, 3)).toBe('intermedio');
      // 59% at nivel 2 is "basico" (needs 60% for intermediate)
      expect(determinarNivelDificultad(5, 59, 2)).toBe('basico');
    });
  });

  describe('obtenerDescripcionNivel', () => {
    test('should return correct description for nivel 1', () => {
      const desc = obtenerDescripcionNivel(1);
      expect(desc).toBe('Matrices 2x2 - Patrones básicos de reconocimiento');
    });

    test('should return correct description for nivel 2', () => {
      const desc = obtenerDescripcionNivel(2);
      expect(desc).toBe('Serie C - Relaciones simples entre elementos');
    });

    test('should return correct description for nivel 3', () => {
      const desc = obtenerDescripcionNivel(3);
      expect(desc).toBe('Serie D - Patrones complejos y transformaciones');
    });

    test('should return correct description for nivel 4', () => {
      const desc = obtenerDescripcionNivel(4);
      expect(desc).toBe('Serie E - Razonamiento abstracto avanzado');
    });

    test('should return empty string for invalid level', () => {
      expect(obtenerDescripcionNivel(0)).toBe('');
      expect(obtenerDescripcionNivel(5)).toBe('');
      expect(obtenerDescripcionNivel(99)).toBe('');
    });
  });

  describe('obtenerTiempoPorNivel', () => {
    test('should return 50 seconds for nivel 1', () => {
      expect(obtenerTiempoPorNivel(1)).toBe(50);
    });

    test('should return 45 seconds for nivel 2', () => {
      expect(obtenerTiempoPorNivel(2)).toBe(45);
    });

    test('should return 35 seconds for nivel 3', () => {
      expect(obtenerTiempoPorNivel(3)).toBe(35);
    });

    test('should return 25 seconds for nivel 4', () => {
      expect(obtenerTiempoPorNivel(4)).toBe(25);
    });

    test('should return 30 seconds (default) for invalid level', () => {
      expect(obtenerTiempoPorNivel(0)).toBe(30);
      expect(obtenerTiempoPorNivel(5)).toBe(30);
      expect(obtenerTiempoPorNivel(99)).toBe(30);
    });

    test('should decrease time as level increases', () => {
      const tiempo1 = obtenerTiempoPorNivel(1);
      const tiempo2 = obtenerTiempoPorNivel(2);
      const tiempo3 = obtenerTiempoPorNivel(3);
      const tiempo4 = obtenerTiempoPorNivel(4);
      
      expect(tiempo1).toBeGreaterThan(tiempo2);
      expect(tiempo2).toBeGreaterThan(tiempo3);
      expect(tiempo3).toBeGreaterThan(tiempo4);
    });
  });
});

