import {
  GAME_METADATA,
  COGNITIVE_DOMAINS,
  getGameMetadata,
  getDomainMetadata,
  getActiveGames,
  getGamesByDomain,
  getAllDomains,
  validateGameExists,
  validateDomainExists
} from '../../../services/gameConfig/GAME_METADATA';

describe('GAME_METADATA', () => {
  describe('GAME_METADATA object', () => {
    test('should contain all 8 games', () => {
      const gameIds = Object.keys(GAME_METADATA);
      expect(gameIds).toHaveLength(8);
    });

    test('should have valid structure for all games', () => {
      Object.values(GAME_METADATA).forEach(game => {
        expect(game).toHaveProperty('id');
        expect(game).toHaveProperty('name');
        expect(game).toHaveProperty('displayName');
        expect(game).toHaveProperty('description');
        expect(game).toHaveProperty('cognitiveDomain');
        expect(game).toHaveProperty('domainDisplayName');
        expect(game).toHaveProperty('category');
        expect(game).toHaveProperty('difficulty');
        expect(game).toHaveProperty('scoring');
        expect(game).toHaveProperty('version');
        expect(game).toHaveProperty('isActive');
        expect(game).toHaveProperty('tags');
      });
    });

    test('should have all games marked as active', () => {
      Object.values(GAME_METADATA).forEach(game => {
        expect(game.isActive).toBe(true);
      });
    });

    test('should have valid difficulty levels for all games', () => {
      Object.values(GAME_METADATA).forEach(game => {
        expect(game.difficulty).toHaveProperty('easy');
        expect(game.difficulty).toHaveProperty('medium');
        expect(game.difficulty).toHaveProperty('hard');
        
        Object.values(game.difficulty).forEach(diff => {
          expect(diff).toHaveProperty('minTime');
          expect(diff).toHaveProperty('maxTime');
          expect(diff).toHaveProperty('maxScore');
          expect(diff.minTime).toBeGreaterThan(0);
          expect(diff.maxTime).toBeGreaterThan(diff.minTime);
          expect(diff.maxScore).toBe(1);
        });
      });
    });

    test('should have valid scoring configuration for all games', () => {
      Object.values(GAME_METADATA).forEach(game => {
        expect(game.scoring).toHaveProperty('type');
        expect(game.scoring).toHaveProperty('minScore');
        expect(game.scoring).toHaveProperty('maxScore');
        expect(game.scoring).toHaveProperty('precision');
        
        expect(game.scoring.minScore).toBe(0);
        expect(game.scoring.maxScore).toBe(1);
        expect(typeof game.scoring.precision).toBe('number');
        expect(game.scoring.precision).toBeGreaterThanOrEqual(2);
      });
    });

    test('should have tags array for all games', () => {
      Object.values(GAME_METADATA).forEach(game => {
        expect(Array.isArray(game.tags)).toBe(true);
        expect(game.tags.length).toBeGreaterThan(0);
      });
    });

    test('should have specific games present', () => {
      expect(GAME_METADATA).toHaveProperty('razonamiento_gramatical');
      expect(GAME_METADATA).toHaveProperty('matrices_progresivas');
      expect(GAME_METADATA).toHaveProperty('aprendizaje_listas_verbales');
      expect(GAME_METADATA).toHaveProperty('balance_balanza');
      expect(GAME_METADATA).toHaveProperty('reconociendo_objetos');
      expect(GAME_METADATA).toHaveProperty('posner_haciendo_cola');
      expect(GAME_METADATA).toHaveProperty('forward_memory_span');
      expect(GAME_METADATA).toHaveProperty('reverse_memory_span');
    });
  });

  describe('COGNITIVE_DOMAINS object', () => {
    test('should contain all 6 cognitive domains', () => {
      const domainIds = Object.keys(COGNITIVE_DOMAINS);
      expect(domainIds).toHaveLength(6);
    });

    test('should have valid structure for all domains', () => {
      Object.values(COGNITIVE_DOMAINS).forEach(domain => {
        expect(domain).toHaveProperty('id');
        expect(domain).toHaveProperty('name');
        expect(domain).toHaveProperty('description');
        expect(domain).toHaveProperty('color');
        expect(domain).toHaveProperty('icon');
        expect(domain).toHaveProperty('skills');
      });
    });

    test('should have skills array for all domains', () => {
      Object.values(COGNITIVE_DOMAINS).forEach(domain => {
        expect(Array.isArray(domain.skills)).toBe(true);
        expect(domain.skills.length).toBeGreaterThan(0);
      });
    });

    test('should have color codes for all domains', () => {
      Object.values(COGNITIVE_DOMAINS).forEach(domain => {
        expect(domain.color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    test('should have emoji icons for all domains', () => {
      Object.values(COGNITIVE_DOMAINS).forEach(domain => {
        expect(typeof domain.icon).toBe('string');
        expect(domain.icon.length).toBeGreaterThan(0);
      });
    });

    test('should have specific domains present', () => {
      expect(COGNITIVE_DOMAINS).toHaveProperty('lenguaje');
      expect(COGNITIVE_DOMAINS).toHaveProperty('razonamiento_abstracto');
      expect(COGNITIVE_DOMAINS).toHaveProperty('memoria');
      expect(COGNITIVE_DOMAINS).toHaveProperty('funciones_ejecutivas');
      expect(COGNITIVE_DOMAINS).toHaveProperty('atencion');
      expect(COGNITIVE_DOMAINS).toHaveProperty('memoria_trabajo');
    });
  });

  describe('getGameMetadata', () => {
    test('should return game metadata for valid game ID', () => {
      const game = getGameMetadata('razonamiento_gramatical');
      
      expect(game).not.toBeNull();
      expect(game.id).toBe('razonamiento_gramatical');
      expect(game.name).toBe('Razonamiento Gramatical');
    });

    test('should return null for invalid game ID', () => {
      expect(getGameMetadata('invalid_game')).toBeNull();
      expect(getGameMetadata('nonexistent')).toBeNull();
    });

    test('should return null for null input', () => {
      expect(getGameMetadata(null)).toBeNull();
    });

    test('should return complete game object', () => {
      const game = getGameMetadata('matrices_progresivas');
      
      expect(game).toHaveProperty('id');
      expect(game).toHaveProperty('name');
      expect(game).toHaveProperty('displayName');
      expect(game).toHaveProperty('cognitiveDomain');
      expect(game).toHaveProperty('difficulty');
      expect(game).toHaveProperty('scoring');
    });

    test('should work for all valid game IDs', () => {
      const gameIds = [
        'razonamiento_gramatical',
        'matrices_progresivas',
        'aprendizaje_listas_verbales',
        'balance_balanza',
        'reconociendo_objetos',
        'posner_haciendo_cola',
        'forward_memory_span',
        'reverse_memory_span'
      ];

      gameIds.forEach(id => {
        const game = getGameMetadata(id);
        expect(game).not.toBeNull();
        expect(game.id).toBe(id);
      });
    });
  });

  describe('getDomainMetadata', () => {
    test('should return domain metadata for valid domain ID', () => {
      const domain = getDomainMetadata('lenguaje');
      
      expect(domain).not.toBeNull();
      expect(domain.id).toBe('lenguaje');
      expect(domain.name).toBe('Lenguaje');
    });

    test('should return null for invalid domain ID', () => {
      expect(getDomainMetadata('invalid_domain')).toBeNull();
      expect(getDomainMetadata('nonexistent')).toBeNull();
    });

    test('should return null for null input', () => {
      expect(getDomainMetadata(null)).toBeNull();
    });

    test('should return complete domain object', () => {
      const domain = getDomainMetadata('memoria');
      
      expect(domain).toHaveProperty('id');
      expect(domain).toHaveProperty('name');
      expect(domain).toHaveProperty('description');
      expect(domain).toHaveProperty('color');
      expect(domain).toHaveProperty('icon');
      expect(domain).toHaveProperty('skills');
    });

    test('should work for all valid domain IDs', () => {
      const domainIds = [
        'lenguaje',
        'razonamiento_abstracto',
        'memoria',
        'funciones_ejecutivas',
        'atencion',
        'memoria_trabajo'
      ];

      domainIds.forEach(id => {
        const domain = getDomainMetadata(id);
        expect(domain).not.toBeNull();
        expect(domain.id).toBe(id);
      });
    });
  });

  describe('getActiveGames', () => {
    test('should return array of active games', () => {
      const games = getActiveGames();
      
      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBeGreaterThan(0);
    });

    test('should return all 8 games (all active)', () => {
      const games = getActiveGames();
      expect(games).toHaveLength(8);
    });

    test('should only include games with isActive: true', () => {
      const games = getActiveGames();
      
      games.forEach(game => {
        expect(game.isActive).toBe(true);
      });
    });

    test('should return game objects with all properties', () => {
      const games = getActiveGames();
      
      games.forEach(game => {
        expect(game).toHaveProperty('id');
        expect(game).toHaveProperty('name');
        expect(game).toHaveProperty('displayName');
        expect(game).toHaveProperty('cognitiveDomain');
      });
    });
  });

  describe('getGamesByDomain', () => {
    test('should return games for lenguaje domain', () => {
      const games = getGamesByDomain('lenguaje');
      
      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBeGreaterThan(0);
      
      games.forEach(game => {
        expect(game.cognitiveDomain).toBe('lenguaje');
      });
    });

    test('should return games for memoria domain', () => {
      const games = getGamesByDomain('memoria');
      
      expect(games.length).toBeGreaterThan(0);
      
      games.forEach(game => {
        expect(game.cognitiveDomain).toBe('memoria');
      });
    });

    test('should return games for memoria_trabajo domain', () => {
      const games = getGamesByDomain('memoria_trabajo');
      
      expect(games.length).toBeGreaterThan(0);
      
      games.forEach(game => {
        expect(game.cognitiveDomain).toBe('memoria_trabajo');
      });
    });

    test('should return empty array for domain with no games', () => {
      // If a domain exists but has no games
      const games = getGamesByDomain('nonexistent_domain');
      expect(games).toEqual([]);
    });

    test('should only return active games', () => {
      const games = getGamesByDomain('lenguaje');
      
      games.forEach(game => {
        expect(game.isActive).toBe(true);
      });
    });

    test('should cover all domains', () => {
      const domains = ['lenguaje', 'razonamiento_abstracto', 'memoria', 
                      'funciones_ejecutivas', 'atencion', 'memoria_trabajo'];
      
      let totalGames = 0;
      domains.forEach(domain => {
        const games = getGamesByDomain(domain);
        totalGames += games.length;
      });
      
      // Should have all 8 games distributed across domains
      expect(totalGames).toBe(8);
    });
  });

  describe('getAllDomains', () => {
    test('should return array of all domains', () => {
      const domains = getAllDomains();
      
      expect(Array.isArray(domains)).toBe(true);
      expect(domains).toHaveLength(6);
    });

    test('should return domain objects with all properties', () => {
      const domains = getAllDomains();
      
      domains.forEach(domain => {
        expect(domain).toHaveProperty('id');
        expect(domain).toHaveProperty('name');
        expect(domain).toHaveProperty('description');
        expect(domain).toHaveProperty('color');
        expect(domain).toHaveProperty('icon');
        expect(domain).toHaveProperty('skills');
      });
    });

    test('should include all expected domains', () => {
      const domains = getAllDomains();
      const domainIds = domains.map(d => d.id);
      
      expect(domainIds).toContain('lenguaje');
      expect(domainIds).toContain('razonamiento_abstracto');
      expect(domainIds).toContain('memoria');
      expect(domainIds).toContain('funciones_ejecutivas');
      expect(domainIds).toContain('atencion');
      expect(domainIds).toContain('memoria_trabajo');
    });
  });

  describe('validateGameExists', () => {
    test('should return true for valid active game', () => {
      expect(validateGameExists('razonamiento_gramatical')).toBe(true);
      expect(validateGameExists('matrices_progresivas')).toBe(true);
      expect(validateGameExists('balance_balanza')).toBe(true);
    });

    test('should return false for invalid game ID', () => {
      expect(validateGameExists('invalid_game')).toBe(false);
      expect(validateGameExists('nonexistent')).toBe(false);
    });

    test('should return false for null/undefined', () => {
      expect(validateGameExists(null)).toBe(false);
      expect(validateGameExists(undefined)).toBe(false);
    });

    test('should validate all 8 games', () => {
      const gameIds = [
        'razonamiento_gramatical',
        'matrices_progresivas',
        'aprendizaje_listas_verbales',
        'balance_balanza',
        'reconociendo_objetos',
        'posner_haciendo_cola',
        'forward_memory_span',
        'reverse_memory_span'
      ];

      gameIds.forEach(id => {
        expect(validateGameExists(id)).toBe(true);
      });
    });

    test('should be case-sensitive', () => {
      expect(validateGameExists('RAZONAMIENTO_GRAMATICAL')).toBe(false);
      expect(validateGameExists('Matrices_Progresivas')).toBe(false);
    });
  });

  describe('validateDomainExists', () => {
    test('should return true for valid domain', () => {
      expect(validateDomainExists('lenguaje')).toBe(true);
      expect(validateDomainExists('memoria')).toBe(true);
      expect(validateDomainExists('atencion')).toBe(true);
    });

    test('should return false for invalid domain ID', () => {
      expect(validateDomainExists('invalid_domain')).toBe(false);
      expect(validateDomainExists('nonexistent')).toBe(false);
    });

    test('should return false for null/undefined', () => {
      expect(validateDomainExists(null)).toBe(false);
      expect(validateDomainExists(undefined)).toBe(false);
    });

    test('should validate all 6 domains', () => {
      const domainIds = [
        'lenguaje',
        'razonamiento_abstracto',
        'memoria',
        'funciones_ejecutivas',
        'atencion',
        'memoria_trabajo'
      ];

      domainIds.forEach(id => {
        expect(validateDomainExists(id)).toBe(true);
      });
    });

    test('should be case-sensitive', () => {
      expect(validateDomainExists('LENGUAJE')).toBe(false);
      expect(validateDomainExists('Memoria')).toBe(false);
    });
  });

  describe('Integration and consistency tests', () => {
    test('every game should reference a valid cognitive domain', () => {
      Object.values(GAME_METADATA).forEach(game => {
        expect(validateDomainExists(game.cognitiveDomain)).toBe(true);
      });
    });

    test('every game cognitive domain should match its domain metadata', () => {
      Object.values(GAME_METADATA).forEach(game => {
        const domain = getDomainMetadata(game.cognitiveDomain);
        expect(domain).not.toBeNull();
        expect(domain.id).toBe(game.cognitiveDomain);
      });
    });

    test('game ID should match the key in GAME_METADATA', () => {
      Object.entries(GAME_METADATA).forEach(([key, game]) => {
        expect(game.id).toBe(key);
      });
    });

    test('domain ID should match the key in COGNITIVE_DOMAINS', () => {
      Object.entries(COGNITIVE_DOMAINS).forEach(([key, domain]) => {
        expect(domain.id).toBe(key);
      });
    });

    test('all games returned by getActiveGames should validate', () => {
      const games = getActiveGames();
      
      games.forEach(game => {
        expect(validateGameExists(game.id)).toBe(true);
      });
    });

    test('all domains returned by getAllDomains should validate', () => {
      const domains = getAllDomains();
      
      domains.forEach(domain => {
        expect(validateDomainExists(domain.id)).toBe(true);
      });
    });

    test('getGamesByDomain should return consistent results', () => {
      const allGames = getActiveGames();
      const domains = getAllDomains();
      
      domains.forEach(domain => {
        const gamesInDomain = getGamesByDomain(domain.id);
        const expectedGames = allGames.filter(g => g.cognitiveDomain === domain.id);
        
        expect(gamesInDomain).toHaveLength(expectedGames.length);
      });
    });

    test('all scoring types should be valid', () => {
      const validTypes = ['percentage', 'efficiency', 'accuracy-speed', 'categories-errors'];
      
      Object.values(GAME_METADATA).forEach(game => {
        expect(validTypes).toContain(game.scoring.type);
      });
    });

    test('all categories should be valid', () => {
      const validCategories = [
        'verbal',
        'visual-spatial',
        'verbal-memory',
        'executive',
        'visual-memory',
        'attention',
        'working-memory',
        'working-memory-reverse'
      ];
      
      Object.values(GAME_METADATA).forEach(game => {
        expect(validCategories).toContain(game.category);
      });
    });
  });
});

