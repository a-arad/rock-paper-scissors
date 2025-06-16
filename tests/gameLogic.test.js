const {
  CHOICES,
  WIN_CONDITIONS,
  isValidChoice,
  normalizeChoice,
  determineWinner,
  getComputerChoice,
  getValidChoices,
  playGame
} = require('../src/gameLogic');

describe('Game Logic', () => {
  describe('Constants', () => {
    test('CHOICES should contain rock, paper, scissors', () => {
      expect(CHOICES).toEqual(['rock', 'paper', 'scissors']);
    });

    test('WIN_CONDITIONS should define correct win conditions', () => {
      expect(WIN_CONDITIONS).toEqual({
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
      });
    });
  });

  describe('isValidChoice', () => {
    test('should return true for valid choices', () => {
      expect(isValidChoice('rock')).toBe(true);
      expect(isValidChoice('paper')).toBe(true);
      expect(isValidChoice('scissors')).toBe(true);
      expect(isValidChoice('ROCK')).toBe(true);
      expect(isValidChoice('Paper')).toBe(true);
      expect(isValidChoice('SCISSORS')).toBe(true);
    });

    test('should return false for invalid choices', () => {
      expect(isValidChoice('invalid')).toBe(false);
      expect(isValidChoice('lizard')).toBe(false);
      expect(isValidChoice('spock')).toBe(false);
      expect(isValidChoice('')).toBe(false);
      expect(isValidChoice(null)).toBe(false);
      expect(isValidChoice(undefined)).toBe(false);
      expect(isValidChoice(123)).toBe(false);
      expect(isValidChoice({})).toBe(false);
      expect(isValidChoice([])).toBe(false);
    });
  });

  describe('normalizeChoice', () => {
    test('should convert choice to lowercase', () => {
      expect(normalizeChoice('ROCK')).toBe('rock');
      expect(normalizeChoice('Paper')).toBe('paper');
      expect(normalizeChoice('SCISSORS')).toBe('scissors');
      expect(normalizeChoice('rock')).toBe('rock');
    });

    test('should throw error for invalid inputs', () => {
      expect(() => normalizeChoice(null)).toThrow('Choice must be a non-empty string');
      expect(() => normalizeChoice(undefined)).toThrow('Choice must be a non-empty string');
      expect(() => normalizeChoice('')).toThrow('Choice must be a non-empty string');
      expect(() => normalizeChoice(123)).toThrow('Choice must be a non-empty string');
    });
  });

  describe('determineWinner', () => {
    describe('Tie conditions', () => {
      test('should return tie for same choices', () => {
        expect(determineWinner('rock', 'rock')).toBe('tie');
        expect(determineWinner('paper', 'paper')).toBe('tie');
        expect(determineWinner('scissors', 'scissors')).toBe('tie');
      });

      test('should return tie for same choices with different cases', () => {
        expect(determineWinner('ROCK', 'rock')).toBe('tie');
        expect(determineWinner('Paper', 'PAPER')).toBe('tie');
        expect(determineWinner('scissors', 'SCISSORS')).toBe('tie');
      });
    });

    describe('Win conditions', () => {
      test('rock should beat scissors', () => {
        expect(determineWinner('rock', 'scissors')).toBe('win');
        expect(determineWinner('ROCK', 'scissors')).toBe('win');
      });

      test('paper should beat rock', () => {
        expect(determineWinner('paper', 'rock')).toBe('win');
        expect(determineWinner('PAPER', 'rock')).toBe('win');
      });

      test('scissors should beat paper', () => {
        expect(determineWinner('scissors', 'paper')).toBe('win');
        expect(determineWinner('SCISSORS', 'paper')).toBe('win');
      });
    });

    describe('Lose conditions', () => {
      test('rock should lose to paper', () => {
        expect(determineWinner('rock', 'paper')).toBe('lose');
        expect(determineWinner('ROCK', 'paper')).toBe('lose');
      });

      test('paper should lose to scissors', () => {
        expect(determineWinner('paper', 'scissors')).toBe('lose');
        expect(determineWinner('PAPER', 'scissors')).toBe('lose');
      });

      test('scissors should lose to rock', () => {
        expect(determineWinner('scissors', 'rock')).toBe('lose');
        expect(determineWinner('SCISSORS', 'rock')).toBe('lose');
      });
    });

    describe('Error handling', () => {
      test('should throw error for invalid player choice', () => {
        expect(() => determineWinner('invalid', 'rock')).toThrow('Invalid player choice: invalid');
        expect(() => determineWinner('', 'rock')).toThrow('Invalid player choice: ');
        expect(() => determineWinner(null, 'rock')).toThrow('Invalid player choice: null');
      });

      test('should throw error for invalid computer choice', () => {
        expect(() => determineWinner('rock', 'invalid')).toThrow('Invalid computer choice: invalid');
        expect(() => determineWinner('rock', '')).toThrow('Invalid computer choice: ');
        expect(() => determineWinner('rock', null)).toThrow('Invalid computer choice: null');
      });
    });
  });

  describe('getComputerChoice', () => {
    test('should return a valid choice', () => {
      const choice = getComputerChoice();
      expect(CHOICES).toContain(choice);
    });

    test('should return different choices over multiple calls', () => {
      const choices = new Set();
      for (let i = 0; i < 100; i++) {
        choices.add(getComputerChoice());
      }
      expect(choices.size).toBeGreaterThan(1);
    });

    test('should only return valid choices', () => {
      for (let i = 0; i < 50; i++) {
        const choice = getComputerChoice();
        expect(['rock', 'paper', 'scissors']).toContain(choice);
      }
    });
  });

  describe('getValidChoices', () => {
    test('should return array of valid choices', () => {
      const choices = getValidChoices();
      expect(choices).toEqual(['rock', 'paper', 'scissors']);
    });

    test('should return a copy of CHOICES array', () => {
      const choices = getValidChoices();
      choices.push('invalid');
      expect(CHOICES).toEqual(['rock', 'paper', 'scissors']);
    });
  });

  describe('playGame', () => {
    test('should return complete game result for valid choice', () => {
      const result = playGame('rock');
      
      expect(result).toHaveProperty('playerChoice', 'rock');
      expect(result).toHaveProperty('computerChoice');
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('timestamp');
      
      expect(['rock', 'paper', 'scissors']).toContain(result.computerChoice);
      expect(['win', 'lose', 'tie']).toContain(result.result);
      expect(typeof result.timestamp).toBe('string');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    test('should handle case-insensitive input', () => {
      const result = playGame('ROCK');
      expect(result.playerChoice).toBe('rock');
    });

    test('should throw error for invalid choice', () => {
      expect(() => playGame('invalid')).toThrow('Invalid choice: invalid');
      expect(() => playGame('')).toThrow('Invalid choice: ');
      expect(() => playGame(null)).toThrow('Invalid choice: null');
    });

    test('should return consistent results for same inputs when computer choice is mocked', () => {
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0); // Always return first choice (rock)
      
      const result = playGame('rock');
      expect(result.playerChoice).toBe('rock');
      expect(result.computerChoice).toBe('rock');
      expect(result.result).toBe('tie');
      
      Math.random = originalRandom;
    });

    describe('Game logic validation through playGame', () => {
      beforeEach(() => {
        jest.spyOn(Math, 'random');
      });

      afterEach(() => {
        Math.random.mockRestore();
      });

      test('rock vs scissors should win', () => {
        Math.random.mockReturnValue(2 / 3); // Return scissors
        const result = playGame('rock');
        expect(result.result).toBe('win');
        expect(result.computerChoice).toBe('scissors');
      });

      test('rock vs paper should lose', () => {
        Math.random.mockReturnValue(1 / 3); // Return paper
        const result = playGame('rock');
        expect(result.result).toBe('lose');
        expect(result.computerChoice).toBe('paper');
      });

      test('paper vs rock should win', () => {
        Math.random.mockReturnValue(0); // Return rock
        const result = playGame('paper');
        expect(result.result).toBe('win');
        expect(result.computerChoice).toBe('rock');
      });

      test('paper vs scissors should lose', () => {
        Math.random.mockReturnValue(2 / 3); // Return scissors
        const result = playGame('paper');
        expect(result.result).toBe('lose');
        expect(result.computerChoice).toBe('scissors');
      });

      test('scissors vs paper should win', () => {
        Math.random.mockReturnValue(1 / 3); // Return paper
        const result = playGame('scissors');
        expect(result.result).toBe('win');
        expect(result.computerChoice).toBe('paper');
      });

      test('scissors vs rock should lose', () => {
        Math.random.mockReturnValue(0); // Return rock
        const result = playGame('scissors');
        expect(result.result).toBe('lose');
        expect(result.computerChoice).toBe('rock');
      });
    });
  });

  describe('Integration with existing game routes', () => {
    test('game logic should be compatible with existing API expectations', () => {
      const result = playGame('rock');
      
      // Should match the expected structure from routes/game.js
      expect(result).toMatchObject({
        playerChoice: expect.stringMatching(/^(rock|paper|scissors)$/),
        computerChoice: expect.stringMatching(/^(rock|paper|scissors)$/),
        result: expect.stringMatching(/^(win|lose|tie)$/),
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      });
    });
  });
});