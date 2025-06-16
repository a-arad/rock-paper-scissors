import { renderHook, act } from '@testing-library/react';
import { useScores } from '../useScores';
import { scoreStorage, historyStorage, statsStorage } from '../../utils/storage';

jest.mock('../../utils/storage', () => ({
  scoreStorage: {
    getScores: jest.fn(),
    saveScores: jest.fn(),
    resetScores: jest.fn()
  },
  historyStorage: {
    getHistory: jest.fn(),
    saveHistory: jest.fn(),
    clearHistory: jest.fn()
  },
  statsStorage: {
    getStats: jest.fn(),
    updateStats: jest.fn(),
    resetStats: jest.fn()
  }
}));

const mockDefaultScores = {
  playerScore: 0,
  computerScore: 0,
  gamesPlayed: 0,
  winRate: 0,
  lastUpdated: '2023-01-01T00:00:00.000Z'
};

const mockDefaultStats = {
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
};

describe('useScores hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    scoreStorage.getScores.mockReturnValue(mockDefaultScores);
    historyStorage.getHistory.mockReturnValue([]);
    statsStorage.getStats.mockReturnValue(mockDefaultStats);
    scoreStorage.saveScores.mockReturnValue(true);
    historyStorage.saveHistory.mockReturnValue(true);
    statsStorage.updateStats.mockReturnValue(mockDefaultStats);
  });

  test('should initialize with default data from storage', () => {
    const { result } = renderHook(() => useScores());

    expect(result.current.scores).toEqual(mockDefaultScores);
    expect(result.current.gameHistory).toEqual([]);
    expect(result.current.stats).toEqual(mockDefaultStats);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should update scores correctly', async () => {
    const { result } = renderHook(() => useScores());
    
    const newScores = { playerScore: 5, computerScore: 2, gamesPlayed: 7 };
    
    await act(async () => {
      result.current.updateScores(newScores);
    });

    expect(scoreStorage.saveScores).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockDefaultScores,
        ...newScores,
        winRate: Math.round((5 / 7) * 100)
      })
    );
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should calculate win rate correctly', async () => {
    const { result } = renderHook(() => useScores());
    
    const newScores = { playerScore: 3, computerScore: 2, gamesPlayed: 5 };
    
    await act(async () => {
      result.current.updateScores(newScores);
    });

    expect(result.current.getWinPercentage()).toBe(60);
  });

  test('should handle win rate calculation when no games played', () => {
    const { result } = renderHook(() => useScores());
    
    expect(result.current.getWinPercentage()).toBe(0);
  });

  test('should add game result and update all related data', async () => {
    const mockUpdatedStats = {
      ...mockDefaultStats,
      totalGames: 1,
      wins: 1,
      winStreak: 1
    };
    statsStorage.updateStats.mockReturnValue(mockUpdatedStats);
    
    const { result } = renderHook(() => useScores());
    
    await act(async () => {
      result.current.addGameResult('win', 'rock', 'scissors');
    });

    expect(scoreStorage.saveScores).toHaveBeenCalled();
    expect(historyStorage.saveHistory).toHaveBeenCalled();
    expect(statsStorage.updateStats).toHaveBeenCalledWith('win', 'rock', 'scissors');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should reset scores', async () => {
    const { result } = renderHook(() => useScores());
    
    await act(async () => {
      result.current.resetScores();
    });

    expect(scoreStorage.resetScores).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should reset history', async () => {
    const { result } = renderHook(() => useScores());
    
    await act(async () => {
      result.current.resetHistory();
    });

    expect(historyStorage.clearHistory).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should reset stats', async () => {
    const { result } = renderHook(() => useScores());
    
    await act(async () => {
      result.current.resetStats();
    });

    expect(statsStorage.resetStats).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should reset all data', async () => {
    const { result } = renderHook(() => useScores());
    
    scoreStorage.resetScores.mockResolvedValue(true);
    historyStorage.clearHistory.mockResolvedValue(true);
    statsStorage.resetStats.mockResolvedValue(true);
    
    await act(async () => {
      result.current.resetAll();
    });

    expect(scoreStorage.resetScores).toHaveBeenCalled();
    expect(historyStorage.clearHistory).toHaveBeenCalled();
    expect(statsStorage.resetStats).toHaveBeenCalled();
  });

  test('should get current streak from game history', () => {
    const mockHistory = [
      { result: 'win' },
      { result: 'win' },
      { result: 'lose' }
    ];
    historyStorage.getHistory.mockReturnValue(mockHistory);
    
    const { result } = renderHook(() => useScores());
    
    const streak = result.current.getCurrentStreak();
    expect(streak).toEqual({ type: 'win', count: 2 });
  });

  test('should return no streak when history is empty', () => {
    const { result } = renderHook(() => useScores());
    
    const streak = result.current.getCurrentStreak();
    expect(streak).toEqual({ type: 'none', count: 0 });
  });

  test('should get recent games with limit', () => {
    const mockHistory = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    historyStorage.getHistory.mockReturnValue(mockHistory);
    
    const { result } = renderHook(() => useScores());
    
    const recentGames = result.current.getRecentGames(5);
    expect(recentGames).toHaveLength(5);
    expect(recentGames[0].id).toBe(0);
  });

  test('should handle errors when updating scores', async () => {
    scoreStorage.saveScores.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const { result } = renderHook(() => useScores());
    
    await act(async () => {
      result.current.updateScores({ playerScore: 1 });
    });

    expect(result.current.error).toBe('Failed to update scores');
    expect(result.current.isLoading).toBe(false);
  });

  test('should handle errors when adding game result', async () => {
    scoreStorage.saveScores.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const { result } = renderHook(() => useScores());
    
    await act(async () => {
      result.current.addGameResult('win', 'rock', 'scissors');
    });

    expect(result.current.error).toBe('Failed to save game result');
    expect(result.current.isLoading).toBe(false);
  });

  test('should handle errors when resetting scores', async () => {
    scoreStorage.resetScores.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const { result } = renderHook(() => useScores());
    
    await act(async () => {
      result.current.resetScores();
    });

    expect(result.current.error).toBe('Failed to reset scores');
    expect(result.current.isLoading).toBe(false);
  });

  test('should limit history to 50 games when adding results', async () => {
    const longHistory = Array.from({ length: 50 }, (_, i) => ({ id: i }));
    historyStorage.getHistory.mockReturnValue(longHistory);
    
    const { result } = renderHook(() => useScores());
    
    await act(async () => {
      result.current.addGameResult('win', 'rock', 'scissors');
    });

    expect(historyStorage.saveHistory).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ playerChoice: 'rock' }),
        ...longHistory.slice(0, 49)
      ])
    );
  });
});