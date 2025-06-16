import { storage, scoreStorage, historyStorage, statsStorage, STORAGE_KEYS } from '../storage';

const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('storage utility', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  describe('basic storage operations', () => {
    test('should store and retrieve data', () => {
      const testData = { test: 'value', number: 123 };
      
      expect(storage.set('testKey', testData)).toBe(true);
      expect(storage.get('testKey')).toEqual(testData);
    });

    test('should return null for non-existent keys', () => {
      expect(storage.get('nonExistentKey')).toBeNull();
    });

    test('should remove data', () => {
      storage.set('testKey', 'testValue');
      expect(storage.remove('testKey')).toBe(true);
      expect(storage.get('testKey')).toBeNull();
    });

    test('should clear all game-related data', () => {
      storage.set(STORAGE_KEYS.SCORES, { playerScore: 5 });
      storage.set(STORAGE_KEYS.GAME_HISTORY, [{ id: 1 }]);
      storage.set(STORAGE_KEYS.STATS, { totalGames: 10 });
      
      expect(storage.clear()).toBe(true);
      
      expect(storage.get(STORAGE_KEYS.SCORES)).toBeNull();
      expect(storage.get(STORAGE_KEYS.GAME_HISTORY)).toBeNull();
      expect(storage.get(STORAGE_KEYS.STATS)).toBeNull();
    });

    test('should handle JSON parse errors gracefully', () => {
      window.localStorage.setItem('corruptedKey', 'invalid json {');
      expect(storage.get('corruptedKey')).toBeNull();
    });

    test('should handle localStorage errors gracefully', () => {
      const originalSetItem = window.localStorage.setItem;
      window.localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(storage.set('testKey', 'testValue')).toBe(false);
      
      window.localStorage.setItem = originalSetItem;
    });
  });

  describe('scoreStorage', () => {
    test('should return default scores when no data exists', () => {
      const scores = scoreStorage.getScores();
      
      expect(scores).toEqual({
        playerScore: 0,
        computerScore: 0,
        gamesPlayed: 0,
        winRate: 0,
        lastUpdated: expect.any(String)
      });
    });

    test('should save and retrieve scores with timestamp', () => {
      const testScores = {
        playerScore: 5,
        computerScore: 3,
        gamesPlayed: 8,
        winRate: 62.5
      };
      
      expect(scoreStorage.saveScores(testScores)).toBe(true);
      
      const retrievedScores = scoreStorage.getScores();
      expect(retrievedScores).toEqual({
        ...testScores,
        lastUpdated: expect.any(String)
      });
    });

    test('should reset scores', () => {
      scoreStorage.saveScores({ playerScore: 10, computerScore: 5 });
      expect(scoreStorage.resetScores()).toBe(true);
      
      const scores = scoreStorage.getScores();
      expect(scores.playerScore).toBe(0);
      expect(scores.computerScore).toBe(0);
    });
  });

  describe('historyStorage', () => {
    test('should return empty array when no history exists', () => {
      expect(historyStorage.getHistory()).toEqual([]);
    });

    test('should save and retrieve game history', () => {
      const testHistory = [
        { id: 1, playerChoice: 'rock', computerChoice: 'scissors', result: 'win' },
        { id: 2, playerChoice: 'paper', computerChoice: 'rock', result: 'win' }
      ];
      
      expect(historyStorage.saveHistory(testHistory)).toBe(true);
      expect(historyStorage.getHistory()).toEqual(testHistory);
    });

    test('should limit history to 50 games', () => {
      const longHistory = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        playerChoice: 'rock',
        computerChoice: 'scissors',
        result: 'win'
      }));
      
      historyStorage.saveHistory(longHistory);
      const retrievedHistory = historyStorage.getHistory();
      
      expect(retrievedHistory).toHaveLength(50);
      expect(retrievedHistory[0].id).toBe(0);
      expect(retrievedHistory[49].id).toBe(49);
    });

    test('should add single game to history', () => {
      const existingHistory = [
        { id: 1, playerChoice: 'rock', computerChoice: 'scissors', result: 'win' }
      ];
      historyStorage.saveHistory(existingHistory);
      
      const newGame = { id: 2, playerChoice: 'paper', computerChoice: 'rock', result: 'win' };
      historyStorage.addGameToHistory(newGame);
      
      const history = historyStorage.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0]).toEqual(newGame);
      expect(history[1]).toEqual(existingHistory[0]);
    });

    test('should clear history', () => {
      historyStorage.saveHistory([{ id: 1 }]);
      expect(historyStorage.clearHistory()).toBe(true);
      expect(historyStorage.getHistory()).toEqual([]);
    });
  });

  describe('statsStorage', () => {
    test('should return default stats when no data exists', () => {
      const stats = statsStorage.getStats();
      
      expect(stats).toEqual({
        totalGames: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        winStreak: 0,
        maxWinStreak: 0,
        lossStreak: 0,
        maxLossStreak: 0,
        favoriteChoice: null,
        choiceStats: {
          rock: { played: 0, won: 0 },
          paper: { played: 0, won: 0 },
          scissors: { played: 0, won: 0 }
        },
        lastPlayed: null
      });
    });

    test('should update stats for a win', () => {
      const updatedStats = statsStorage.updateStats('win', 'rock', 'scissors');
      
      expect(updatedStats.totalGames).toBe(1);
      expect(updatedStats.wins).toBe(1);
      expect(updatedStats.losses).toBe(0);
      expect(updatedStats.ties).toBe(0);
      expect(updatedStats.winStreak).toBe(1);
      expect(updatedStats.maxWinStreak).toBe(1);
      expect(updatedStats.lossStreak).toBe(0);
      expect(updatedStats.choiceStats.rock.played).toBe(1);
      expect(updatedStats.choiceStats.rock.won).toBe(1);
      expect(updatedStats.favoriteChoice).toBe('rock');
      expect(updatedStats.lastPlayed).toBeDefined();
    });

    test('should update stats for a loss', () => {
      const updatedStats = statsStorage.updateStats('lose', 'scissors', 'rock');
      
      expect(updatedStats.totalGames).toBe(1);
      expect(updatedStats.wins).toBe(0);
      expect(updatedStats.losses).toBe(1);
      expect(updatedStats.ties).toBe(0);
      expect(updatedStats.winStreak).toBe(0);
      expect(updatedStats.lossStreak).toBe(1);
      expect(updatedStats.maxLossStreak).toBe(1);
      expect(updatedStats.choiceStats.scissors.played).toBe(1);
      expect(updatedStats.choiceStats.scissors.won).toBe(0);
      expect(updatedStats.favoriteChoice).toBe('scissors');
    });

    test('should update stats for a tie', () => {
      const updatedStats = statsStorage.updateStats('tie', 'paper', 'paper');
      
      expect(updatedStats.totalGames).toBe(1);
      expect(updatedStats.wins).toBe(0);
      expect(updatedStats.losses).toBe(0);
      expect(updatedStats.ties).toBe(1);
      expect(updatedStats.winStreak).toBe(0);
      expect(updatedStats.lossStreak).toBe(0);
      expect(updatedStats.choiceStats.paper.played).toBe(1);
      expect(updatedStats.choiceStats.paper.won).toBe(0);
      expect(updatedStats.favoriteChoice).toBe('paper');
    });

    test('should track win and loss streaks correctly', () => {
      statsStorage.updateStats('win', 'rock', 'scissors');
      statsStorage.updateStats('win', 'paper', 'rock');
      let stats = statsStorage.updateStats('win', 'scissors', 'paper');
      
      expect(stats.winStreak).toBe(3);
      expect(stats.maxWinStreak).toBe(3);
      expect(stats.lossStreak).toBe(0);
      
      stats = statsStorage.updateStats('lose', 'rock', 'paper');
      expect(stats.winStreak).toBe(0);
      expect(stats.lossStreak).toBe(1);
      expect(stats.maxWinStreak).toBe(3);
      
      stats = statsStorage.updateStats('lose', 'scissors', 'rock');
      expect(stats.lossStreak).toBe(2);
      expect(stats.maxLossStreak).toBe(2);
    });

    test('should determine favorite choice correctly', () => {
      statsStorage.updateStats('win', 'rock', 'scissors');
      statsStorage.updateStats('lose', 'paper', 'scissors');
      let stats = statsStorage.updateStats('win', 'rock', 'scissors');
      
      expect(stats.favoriteChoice).toBe('rock');
      expect(stats.choiceStats.rock.played).toBe(2);
      expect(stats.choiceStats.paper.played).toBe(1);
    });

    test('should reset stats', () => {
      statsStorage.updateStats('win', 'rock', 'scissors');
      expect(statsStorage.resetStats()).toBe(true);
      
      const stats = statsStorage.getStats();
      expect(stats.totalGames).toBe(0);
      expect(stats.wins).toBe(0);
      expect(stats.favoriteChoice).toBeNull();
    });
  });
});