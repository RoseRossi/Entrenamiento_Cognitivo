import {
  getPalabrasCountForLevel,
  getDisplayTimeForLevel,
  getSelectionTimeForLevel,
  generarPalabrasOriginales,
  generarMarDePalabras,
  JUEGO3_CONFIG
} from '../../../components/Games/juego3/juego3_funciones';

describe('Juego3 - Aprendizaje de Listas Verbales', () => {
  describe('JUEGO3_CONFIG', () => {
    test('should have valid configuration values', () => {
      expect(JUEGO3_CONFIG.START_LEVEL).toBe(1);
      expect(JUEGO3_CONFIG.MAX_LEVEL).toBe(7);
      expect(JUEGO3_CONFIG.PASS_THRESHOLD).toBe(0.5); // 50% threshold
      expect(JUEGO3_CONFIG.ROUNDS_PER_LEVEL).toBe(3);
    });

    test('should have valid word count configuration', () => {
      expect(JUEGO3_CONFIG.MIN_WORDS).toBe(6);
      expect(JUEGO3_CONFIG.MAX_WORDS).toBe(12);
      expect(JUEGO3_CONFIG.WORDS_PER_LEVEL).toBe(1);
    });

    test('should have valid timing configuration', () => {
      expect(JUEGO3_CONFIG.INITIAL_DISPLAY_TIME).toBe(2000);
      expect(JUEGO3_CONFIG.MIN_DISPLAY_TIME).toBe(500);
      expect(JUEGO3_CONFIG.TIME_DECREASE_PER_LEVEL).toBeGreaterThan(0);
      expect(JUEGO3_CONFIG.INITIAL_SELECTION_TIMER).toBe(25);
      expect(JUEGO3_CONFIG.MIN_SELECTION_TIMER).toBe(10);
    });

    test('should have valid game configuration', () => {
      expect(JUEGO3_CONFIG.ROUNDS_PER_LEVEL).toBe(3);
      expect(JUEGO3_CONFIG.DISTRACTOR_POOL_SIZE).toBe(12);
      expect(JUEGO3_CONFIG.TOTAL_WORD_SEA).toBe(24);
      expect(JUEGO3_CONFIG.FAIL_ON_TIMER_EXPIRY).toBe(true);
    });
  });

  describe('getPalabrasCountForLevel', () => {
    test('should return 6 words for level 1', () => {
      expect(getPalabrasCountForLevel(1)).toBe(6);
    });

    test('should return 7 words for level 2', () => {
      expect(getPalabrasCountForLevel(2)).toBe(7);
    });

    test('should return 8 words for level 3', () => {
      expect(getPalabrasCountForLevel(3)).toBe(8);
    });

    test('should return 12 words for level 7', () => {
      expect(getPalabrasCountForLevel(7)).toBe(12);
    });

    test('should not exceed MAX_WORDS (12) at high levels', () => {
      expect(getPalabrasCountForLevel(10)).toBe(12);
      expect(getPalabrasCountForLevel(100)).toBe(12);
    });

    test('should increase by 1 word per level', () => {
      for (let i = 1; i < 7; i++) {
        expect(getPalabrasCountForLevel(i + 1)).toBe(getPalabrasCountForLevel(i) + 1);
      }
    });

    test('should return valid word counts for all levels 1-7', () => {
      const expectedCounts = [6, 7, 8, 9, 10, 11, 12];
      
      for (let i = 1; i <= 7; i++) {
        expect(getPalabrasCountForLevel(i)).toBe(expectedCounts[i - 1]);
      }
    });
  });

  describe('getDisplayTimeForLevel', () => {
    test('should return 2000ms for level 1', () => {
      expect(getDisplayTimeForLevel(1)).toBe(2000);
    });

    test('should decrease time as level increases', () => {
      for (let i = 1; i < 7; i++) {
        expect(getDisplayTimeForLevel(i + 1)).toBeLessThanOrEqual(getDisplayTimeForLevel(i));
      }
    });

    test('should not go below MIN_DISPLAY_TIME (500ms)', () => {
      expect(getDisplayTimeForLevel(7)).toBeGreaterThanOrEqual(500);
      expect(getDisplayTimeForLevel(10)).toBeGreaterThanOrEqual(500);
      expect(getDisplayTimeForLevel(100)).toBe(500);
    });

    test('should return numbers divisible by or close to expected decrease', () => {
      // Level 1: 2000ms
      // Level 2: 2000 - 214 = 1786ms
      expect(getDisplayTimeForLevel(2)).toBe(1786);
    });

    test('should reach minimum at level 7', () => {
      const timeLevel7 = getDisplayTimeForLevel(7);
      expect(timeLevel7).toBeGreaterThanOrEqual(500);
      expect(timeLevel7).toBeLessThanOrEqual(800); // Should be close to minimum
    });
  });

  describe('getSelectionTimeForLevel', () => {
    test('should return 25 seconds for level 1', () => {
      expect(getSelectionTimeForLevel(1)).toBe(25);
    });

    test('should decrease time as level increases', () => {
      for (let i = 1; i < 7; i++) {
        expect(getSelectionTimeForLevel(i + 1)).toBeLessThanOrEqual(getSelectionTimeForLevel(i));
      }
    });

    test('should not go below MIN_SELECTION_TIMER (10 seconds)', () => {
      expect(getSelectionTimeForLevel(7)).toBeGreaterThanOrEqual(10);
      expect(getSelectionTimeForLevel(10)).toBeGreaterThanOrEqual(10);
      expect(getSelectionTimeForLevel(100)).toBe(10);
    });

    test('should return rounded integer values', () => {
      for (let i = 1; i <= 7; i++) {
        const time = getSelectionTimeForLevel(i);
        expect(Number.isInteger(time)).toBe(true);
      }
    });

    test('should be between min and max values for all valid levels', () => {
      for (let i = 1; i <= 7; i++) {
        const time = getSelectionTimeForLevel(i);
        expect(time).toBeGreaterThanOrEqual(10);
        expect(time).toBeLessThanOrEqual(25);
      }
    });
  });

  describe('generarPalabrasOriginales', () => {
    test('should return array of correct length for each level', () => {
      for (let i = 1; i <= 7; i++) {
        const palabras = generarPalabrasOriginales(i);
        const expectedCount = getPalabrasCountForLevel(i);
        expect(palabras).toHaveLength(expectedCount);
      }
    });

    test('should return 6 words for level 1', () => {
      const palabras = generarPalabrasOriginales(1);
      expect(palabras).toHaveLength(6);
    });

    test('should return 12 words for level 7', () => {
      const palabras = generarPalabrasOriginales(7);
      expect(palabras).toHaveLength(12);
    });

    test('should return strings', () => {
      const palabras = generarPalabrasOriginales(5);
      palabras.forEach(palabra => {
        expect(typeof palabra).toBe('string');
      });
    });

    test('should return non-empty strings', () => {
      const palabras = generarPalabrasOriginales(5);
      palabras.forEach(palabra => {
        expect(palabra.length).toBeGreaterThan(0);
      });
    });

    test('should return words in same order for same level (deterministic)', () => {
      const palabras1 = generarPalabrasOriginales(3);
      const palabras2 = generarPalabrasOriginales(3);
      
      expect(palabras1).toEqual(palabras2);
    });

    test('should return subset of pool in order', () => {
      const palabras = generarPalabrasOriginales(4); // Level 4: 6 + (4-1)*1 = 9 words
      const pool = ["cielo", "montaña", "río", "fuego", "sol", "luna",
                    "estrella", "nieve", "mar", "bosque", "viento", "roca"];
      
      // Level 4 gives 9 words
      expect(palabras).toEqual(pool.slice(0, 9));
    });
  });

  describe('generarMarDePalabras', () => {
    const palabrasOriginales = ["cielo", "montaña", "río"];

    test('should return array with original words plus available distractors', () => {
      const mar = generarMarDePalabras(palabrasOriginales);
      // 3 original + 12 distractors available = 15 max
      expect(mar.length).toBeGreaterThanOrEqual(3);
      expect(mar.length).toBeLessThanOrEqual(24);
    });

    test('should include all original words', () => {
      const mar = generarMarDePalabras(palabrasOriginales);
      
      palabrasOriginales.forEach(palabra => {
        expect(mar).toContain(palabra);
      });
    });

    test('should add distractor words', () => {
      const mar = generarMarDePalabras(palabrasOriginales);
      const distractores = mar.filter(palabra => !palabrasOriginales.includes(palabra));
      
      // Should have some distractors (max 12 available)
      expect(distractores.length).toBeGreaterThan(0);
      expect(distractores.length).toBeLessThanOrEqual(12);
    });

    test('should not have duplicate words', () => {
      const mar = generarMarDePalabras(palabrasOriginales);
      const uniqueWords = new Set(mar);
      
      expect(uniqueWords.size).toBe(mar.length);
    });

    test('should shuffle words (not in original order)', () => {
      // Run multiple times to check for shuffling
      let allSame = true;
      const firstMar = generarMarDePalabras(palabrasOriginales);
      
      for (let i = 0; i < 10; i++) {
        const mar = generarMarDePalabras(palabrasOriginales);
        if (JSON.stringify(mar) !== JSON.stringify(firstMar)) {
          allSame = false;
          break;
        }
      }
      
      // With shuffling, it's extremely unlikely all 10 runs produce same order
      expect(allSame).toBe(false);
    });

    test('should work with different numbers of original words', () => {
      const small = generarMarDePalabras(["cielo"]);
      const medium = generarMarDePalabras(["cielo", "montaña", "río", "fuego"]);
      const large = generarMarDePalabras(generarPalabrasOriginales(7));
      
      // Each should have originals + available distractors (max 12)
      expect(small.length).toBeGreaterThanOrEqual(1);
      expect(medium.length).toBeGreaterThanOrEqual(4);
      expect(large.length).toBeGreaterThanOrEqual(7);
    });

    test('should return only strings', () => {
      const mar = generarMarDePalabras(palabrasOriginales);
      
      mar.forEach(palabra => {
        expect(typeof palabra).toBe('string');
      });
    });

    test('should handle maximum words (12)', () => {
      const maxWords = generarPalabrasOriginales(7); // 12 words
      const mar = generarMarDePalabras(maxWords);
      
      // 12 original + 12 distractors = 24 max (if all fit)
      expect(mar.length).toBeGreaterThanOrEqual(12);
      expect(mar.length).toBeLessThanOrEqual(24);
      maxWords.forEach(palabra => {
        expect(mar).toContain(palabra);
      });
    });

    test('should handle minimum words (6)', () => {
      const minWords = generarPalabrasOriginales(1); // 6 words
      const mar = generarMarDePalabras(minWords);
      
      // 6 original + up to 12 distractors
      expect(mar.length).toBeGreaterThanOrEqual(6);
      expect(mar.length).toBeLessThanOrEqual(18);
      minWords.forEach(palabra => {
        expect(mar).toContain(palabra);
      });
    });
  });

  describe('Integration tests', () => {
    test('should generate complete game flow for level 1', () => {
      const nivel = 1;
      const palabrasCount = getPalabrasCountForLevel(nivel);
      const displayTime = getDisplayTimeForLevel(nivel);
      const selectionTime = getSelectionTimeForLevel(nivel);
      const palabrasOriginales = generarPalabrasOriginales(nivel);
      const marDePalabras = generarMarDePalabras(palabrasOriginales);
      
      expect(palabrasCount).toBe(6);
      expect(displayTime).toBe(2000);
      expect(selectionTime).toBe(25);
      expect(palabrasOriginales).toHaveLength(6);
      expect(marDePalabras.length).toBeGreaterThanOrEqual(6);
    });

    test('should generate complete game flow for level 7', () => {
      const nivel = 7;
      const palabrasCount = getPalabrasCountForLevel(nivel);
      const displayTime = getDisplayTimeForLevel(nivel);
      const selectionTime = getSelectionTimeForLevel(nivel);
      const palabrasOriginales = generarPalabrasOriginales(nivel);
      const marDePalabras = generarMarDePalabras(palabrasOriginales);
      
      expect(palabrasCount).toBe(12);
      expect(displayTime).toBeGreaterThanOrEqual(500);
      expect(selectionTime).toBeGreaterThanOrEqual(10);
      expect(palabrasOriginales).toHaveLength(12);
      expect(marDePalabras.length).toBeGreaterThanOrEqual(12);
    });

    test('should maintain consistency across levels', () => {
      for (let nivel = 1; nivel <= 7; nivel++) {
        const palabrasCount = getPalabrasCountForLevel(nivel);
        const palabrasOriginales = generarPalabrasOriginales(nivel);
        const marDePalabras = generarMarDePalabras(palabrasOriginales);
        
        expect(palabrasOriginales).toHaveLength(palabrasCount);
        expect(marDePalabras.length).toBeGreaterThanOrEqual(palabrasCount);
        
        palabrasOriginales.forEach(palabra => {
          expect(marDePalabras).toContain(palabra);
        });
      }
    });
  });
});

