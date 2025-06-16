const {
  generateRandomMove,
  generateStrategicMove,
  getComputerMove,
  getAvailableStrategies,
  getComputerStats
} = require('../src/computerPlayer');

const { CHOICES } = require('../src/gameLogic');

describe('Computer Player', () => {
  describe('generateRandomMove', () => {
    test('should return a valid choice', () => {
      const move = generateRandomMove();
      expect(CHOICES).toContain(move);
    });

    test('should return different moves over multiple calls', () => {
      const moves = new Set();
      for (let i = 0; i < 100; i++) {
        moves.add(generateRandomMove());
      }
      expect(moves.size).toBeGreaterThan(1);
    });

    test('should only return valid choices', () => {
      for (let i = 0; i < 50; i++) {
        const move = generateRandomMove();
        expect(['rock', 'paper', 'scissors']).toContain(move);
      }
    });

    test('should have roughly equal distribution over many calls', () => {
      const counts = { rock: 0, paper: 0, scissors: 0 };
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        const move = generateRandomMove();
        counts[move]++;
      }

      // Each choice should appear roughly 1/3 of the time (within 10% tolerance)
      const expectedCount = iterations / 3;
      const tolerance = expectedCount * 0.2; // 20% tolerance for randomness

      expect(counts.rock).toBeGreaterThan(expectedCount - tolerance);
      expect(counts.rock).toBeLessThan(expectedCount + tolerance);
      expect(counts.paper).toBeGreaterThan(expectedCount - tolerance);
      expect(counts.paper).toBeLessThan(expectedCount + tolerance);
      expect(counts.scissors).toBeGreaterThan(expectedCount - tolerance);
      expect(counts.scissors).toBeLessThan(expectedCount + tolerance);
    });
  });

  describe('generateStrategicMove', () => {
    test('should return random move for empty history', () => {
      const move = generateStrategicMove([]);
      expect(CHOICES).toContain(move);
    });

    test('should return random move for undefined history', () => {
      const move = generateStrategicMove();
      expect(CHOICES).toContain(move);
    });

    test('should return random move for invalid history', () => {
      const move = generateStrategicMove(['invalid', 'moves']);
      expect(CHOICES).toContain(move);
    });

    test('should counter the most frequent move in history', () => {
      const rockHeavyHistory = ['rock', 'rock', 'rock', 'paper', 'scissors'];
      const move = generateStrategicMove(rockHeavyHistory);
      // Should counter rock with paper
      expect(move).toBe('paper');
    });

    test('should counter paper-heavy history with scissors', () => {
      const paperHeavyHistory = ['paper', 'paper', 'paper', 'rock', 'scissors'];
      const move = generateStrategicMove(paperHeavyHistory);
      expect(move).toBe('scissors');
    });

    test('should counter scissors-heavy history with rock', () => {
      const scissorsHeavyHistory = ['scissors', 'scissors', 'scissors', 'rock', 'paper'];
      const move = generateStrategicMove(scissorsHeavyHistory);
      expect(move).toBe('rock');
    });

    test('should handle mixed case history', () => {
      const mixedCaseHistory = ['ROCK', 'Rock', 'rock', 'paper', 'SCISSORS'];
      const move = generateStrategicMove(mixedCaseHistory);
      expect(move).toBe('paper'); // Counter rock
    });

    test('should filter out invalid moves and use valid ones', () => {
      const mixedHistory = ['rock', 'invalid', 'rock', 'bad_move', 'rock'];
      const move = generateStrategicMove(mixedHistory);
      expect(move).toBe('paper'); // Counter rock
    });

    test('should handle tie in frequency by picking one', () => {
      const tiedHistory = ['rock', 'paper', 'scissors'];
      const move = generateStrategicMove(tiedHistory);
      expect(CHOICES).toContain(move);
    });
  });

  describe('getComputerMove', () => {
    describe('Random strategy', () => {
      test('should return valid move with random strategy', () => {
        const move = getComputerMove({ strategy: 'random' });
        expect(CHOICES).toContain(move);
      });

      test('should return valid move with default options', () => {
        const move = getComputerMove();
        expect(CHOICES).toContain(move);
      });

      test('should ignore player history for random strategy', () => {
        const move = getComputerMove({ 
          strategy: 'random', 
          playerHistory: ['rock', 'rock', 'rock'] 
        });
        expect(CHOICES).toContain(move);
      });
    });

    describe('Strategic strategy', () => {
      test('should return valid move with strategic strategy', () => {
        const move = getComputerMove({ 
          strategy: 'strategic',
          playerHistory: ['rock', 'paper', 'scissors']
        });
        expect(CHOICES).toContain(move);
      });

      test('should use player history for strategic moves', () => {
        const move = getComputerMove({ 
          strategy: 'strategic',
          playerHistory: ['rock', 'rock', 'rock'],
          difficulty: 1.0 // Always use strategy
        });
        expect(move).toBe('paper'); // Counter rock
      });

      test('should mix strategic and random based on difficulty', () => {
        const moves = new Set();
        for (let i = 0; i < 50; i++) {
          const move = getComputerMove({ 
            strategy: 'strategic',
            playerHistory: ['rock', 'rock', 'rock'],
            difficulty: 0.0 // Always random
          });
          moves.add(move);
        }
        // Should have some variety due to randomness
        expect(moves.size).toBeGreaterThan(1);
      });
    });

    describe('Error handling', () => {
      test('should throw error for invalid strategy', () => {
        expect(() => getComputerMove({ strategy: 'invalid' }))
          .toThrow('Unknown strategy: invalid');
      });

      test('should throw error for non-string strategy', () => {
        expect(() => getComputerMove({ strategy: 123 }))
          .toThrow('Strategy must be a string');
      });

      test('should throw error for non-array player history', () => {
        expect(() => getComputerMove({ playerHistory: 'not-array' }))
          .toThrow('Player history must be an array');
      });

      test('should throw error for invalid difficulty', () => {
        expect(() => getComputerMove({ difficulty: -1 }))
          .toThrow('Difficulty must be a number between 0 and 1');
        
        expect(() => getComputerMove({ difficulty: 2 }))
          .toThrow('Difficulty must be a number between 0 and 1');
        
        expect(() => getComputerMove({ difficulty: 'not-number' }))
          .toThrow('Difficulty must be a number between 0 and 1');
      });
    });

    describe('Strategy case sensitivity', () => {
      test('should handle case-insensitive strategy names', () => {
        const move1 = getComputerMove({ strategy: 'RANDOM' });
        const move2 = getComputerMove({ strategy: 'Random' });
        const move3 = getComputerMove({ strategy: 'STRATEGIC' });
        const move4 = getComputerMove({ strategy: 'Strategic' });
        
        expect(CHOICES).toContain(move1);
        expect(CHOICES).toContain(move2);
        expect(CHOICES).toContain(move3);
        expect(CHOICES).toContain(move4);
      });
    });
  });

  describe('getAvailableStrategies', () => {
    test('should return array of available strategies', () => {
      const strategies = getAvailableStrategies();
      expect(Array.isArray(strategies)).toBe(true);
      expect(strategies).toContain('random');
      expect(strategies).toContain('strategic');
    });

    test('should return exactly 2 strategies', () => {
      const strategies = getAvailableStrategies();
      expect(strategies).toHaveLength(2);
    });
  });

  describe('getComputerStats', () => {
    test('should return empty stats for empty history', () => {
      const stats = getComputerStats([]);
      expect(stats).toEqual({
        totalMoves: 0,
        distribution: { rock: 0, paper: 0, scissors: 0 },
        percentages: { rock: 0, paper: 0, scissors: 0 }
      });
    });

    test('should return empty stats for undefined history', () => {
      const stats = getComputerStats();
      expect(stats).toEqual({
        totalMoves: 0,
        distribution: { rock: 0, paper: 0, scissors: 0 },
        percentages: { rock: 0, paper: 0, scissors: 0 }
      });
    });

    test('should calculate correct stats for valid history', () => {
      const history = ['rock', 'rock', 'paper', 'scissors'];
      const stats = getComputerStats(history);
      
      expect(stats.totalMoves).toBe(4);
      expect(stats.distribution).toEqual({ rock: 2, paper: 1, scissors: 1 });
      expect(stats.percentages).toEqual({ rock: 50, paper: 25, scissors: 25 });
    });

    test('should handle mixed case moves', () => {
      const history = ['ROCK', 'Rock', 'PAPER'];
      const stats = getComputerStats(history);
      
      expect(stats.totalMoves).toBe(3);
      expect(stats.distribution).toEqual({ rock: 2, paper: 1, scissors: 0 });
      expect(stats.percentages).toEqual({ rock: 67, paper: 33, scissors: 0 });
    });

    test('should filter out invalid moves', () => {
      const history = ['rock', 'invalid', 'paper', 'bad_move', 'scissors'];
      const stats = getComputerStats(history);
      
      expect(stats.totalMoves).toBe(3);
      expect(stats.distribution).toEqual({ rock: 1, paper: 1, scissors: 1 });
      expect(stats.percentages).toEqual({ rock: 33, paper: 33, scissors: 33 });
    });

    test('should round percentages correctly', () => {
      const history = ['rock', 'rock', 'paper']; // 66.67% rock, 33.33% paper
      const stats = getComputerStats(history);
      
      expect(stats.percentages.rock).toBe(67);
      expect(stats.percentages.paper).toBe(33);
      expect(stats.percentages.scissors).toBe(0);
    });

    test('should throw error for non-array input', () => {
      expect(() => getComputerStats('not-array'))
        .toThrow('Move history must be an array');
      
      expect(() => getComputerStats(123))
        .toThrow('Move history must be an array');
    });
  });

  describe('Integration tests', () => {
    test('should work with real game scenarios', () => {
      // Simulate a game session
      const playerMoves = [];
      const computerMoves = [];
      
      for (let round = 0; round < 10; round++) {
        // Player makes a move (simulated)
        const playerMove = CHOICES[Math.floor(Math.random() * CHOICES.length)];
        playerMoves.push(playerMove);
        
        // Computer responds strategically
        const computerMove = getComputerMove({
          strategy: 'strategic',
          playerHistory: playerMoves,
          difficulty: 0.8
        });
        computerMoves.push(computerMove);
        
        expect(CHOICES).toContain(computerMove);
      }
      
      // Verify computer stats
      const stats = getComputerStats(computerMoves);
      expect(stats.totalMoves).toBe(10);
      expect(stats.distribution.rock + stats.distribution.paper + stats.distribution.scissors).toBe(10);
    });

    test('should maintain consistency with gameLogic choices', () => {
      for (let i = 0; i < 20; i++) {
        const randomMove = generateRandomMove();
        const strategicMove = generateStrategicMove(['rock']);
        const computerMove = getComputerMove();
        
        expect(CHOICES).toContain(randomMove);
        expect(CHOICES).toContain(strategicMove);
        expect(CHOICES).toContain(computerMove);
      }
    });
  });
});