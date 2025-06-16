const STORAGE_KEYS = {
  SCORES: 'rps_scores',
  GAME_HISTORY: 'rps_game_history',
  STATS: 'rps_stats'
};

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage for key "${key}":`, error);
      return false;
    }
  },

  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

export const scoreStorage = {
  getScores: () => {
    const defaultScores = {
      playerScore: 0,
      computerScore: 0,
      gamesPlayed: 0,
      winRate: 0,
      lastUpdated: new Date().toISOString()
    };
    
    return storage.get(STORAGE_KEYS.SCORES) || defaultScores;
  },

  saveScores: (scores) => {
    const scoresWithTimestamp = {
      ...scores,
      lastUpdated: new Date().toISOString()
    };
    
    return storage.set(STORAGE_KEYS.SCORES, scoresWithTimestamp);
  },

  resetScores: () => {
    return storage.remove(STORAGE_KEYS.SCORES);
  }
};

export const historyStorage = {
  getHistory: () => {
    return storage.get(STORAGE_KEYS.GAME_HISTORY) || [];
  },

  saveHistory: (history) => {
    const limitedHistory = Array.isArray(history) ? history.slice(0, 50) : [];
    return storage.set(STORAGE_KEYS.GAME_HISTORY, limitedHistory);
  },

  addGameToHistory: (gameRecord) => {
    const currentHistory = historyStorage.getHistory();
    const newHistory = [gameRecord, ...currentHistory].slice(0, 50);
    return historyStorage.saveHistory(newHistory);
  },

  clearHistory: () => {
    return storage.remove(STORAGE_KEYS.GAME_HISTORY);
  }
};

export const statsStorage = {
  getStats: () => {
    const defaultStats = {
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
    
    return storage.get(STORAGE_KEYS.STATS) || defaultStats;
  },

  saveStats: (stats) => {
    return storage.set(STORAGE_KEYS.STATS, stats);
  },

  updateStats: (gameResult, playerChoice, computerChoice) => {
    const currentStats = statsStorage.getStats();
    
    const newStats = {
      ...currentStats,
      totalGames: currentStats.totalGames + 1,
      lastPlayed: new Date().toISOString()
    };

    if (gameResult === 'win') {
      newStats.wins += 1;
      newStats.winStreak += 1;
      newStats.lossStreak = 0;
      newStats.maxWinStreak = Math.max(newStats.maxWinStreak, newStats.winStreak);
      newStats.choiceStats[playerChoice].won += 1;
    } else if (gameResult === 'lose') {
      newStats.losses += 1;
      newStats.lossStreak += 1;
      newStats.winStreak = 0;
      newStats.maxLossStreak = Math.max(newStats.maxLossStreak, newStats.lossStreak);
    } else {
      newStats.ties += 1;
      newStats.winStreak = 0;
      newStats.lossStreak = 0;
    }

    newStats.choiceStats[playerChoice].played += 1;

    const mostPlayedChoice = Object.entries(newStats.choiceStats)
      .reduce((a, b) => newStats.choiceStats[a[0]].played > newStats.choiceStats[b[0]].played ? a : b);
    newStats.favoriteChoice = mostPlayedChoice[0];

    statsStorage.saveStats(newStats);
    return newStats;
  },

  resetStats: () => {
    return storage.remove(STORAGE_KEYS.STATS);
  }
};

export { STORAGE_KEYS };