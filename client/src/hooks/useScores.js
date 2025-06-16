import { useState, useEffect, useCallback } from 'react';
import { scoreStorage, historyStorage, statsStorage } from '../utils/storage';

export const useScores = () => {
  const [scores, setScores] = useState(() => scoreStorage.getScores());
  const [gameHistory, setGameHistory] = useState(() => historyStorage.getHistory());
  const [stats, setStats] = useState(() => statsStorage.getStats());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateScores = useCallback((newScores) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedScores = {
        ...scores,
        ...newScores,
        winRate: newScores.gamesPlayed > 0 
          ? Math.round((newScores.playerScore / newScores.gamesPlayed) * 100)
          : 0
      };
      
      setScores(updatedScores);
      scoreStorage.saveScores(updatedScores);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to update scores');
      setIsLoading(false);
    }
  }, [scores]);

  const addGameResult = useCallback((gameResult, playerChoice, computerChoice) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const gameRecord = {
        id: Date.now(),
        playerChoice,
        computerChoice,
        result: gameResult,
        timestamp: new Date().toISOString()
      };

      const newScores = {
        playerScore: gameResult === 'win' ? scores.playerScore + 1 : scores.playerScore,
        computerScore: gameResult === 'lose' ? scores.computerScore + 1 : scores.computerScore,
        gamesPlayed: scores.gamesPlayed + 1
      };
      
      newScores.winRate = newScores.gamesPlayed > 0 
        ? Math.round((newScores.playerScore / newScores.gamesPlayed) * 100)
        : 0;

      setScores(prev => ({ ...prev, ...newScores }));
      scoreStorage.saveScores({ ...scores, ...newScores });

      const newHistory = [gameRecord, ...gameHistory].slice(0, 50);
      setGameHistory(newHistory);
      historyStorage.saveHistory(newHistory);

      const newStats = statsStorage.updateStats(gameResult, playerChoice, computerChoice);
      setStats(newStats);
      
      setIsLoading(false);
    } catch (err) {
      setError('Failed to save game result');
      setIsLoading(false);
    }
  }, [scores, gameHistory]);

  const resetScores = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const defaultScores = {
        playerScore: 0,
        computerScore: 0,
        gamesPlayed: 0,
        winRate: 0,
        lastUpdated: new Date().toISOString()
      };
      
      setScores(defaultScores);
      scoreStorage.resetScores();
      setIsLoading(false);
    } catch (err) {
      setError('Failed to reset scores');
      setIsLoading(false);
    }
  }, []);

  const resetHistory = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      setGameHistory([]);
      historyStorage.clearHistory();
      setIsLoading(false);
    } catch (err) {
      setError('Failed to reset history');
      setIsLoading(false);
    }
  }, []);

  const resetStats = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const defaultStats = statsStorage.getStats();
      setStats(defaultStats);
      statsStorage.resetStats();
      setIsLoading(false);
    } catch (err) {
      setError('Failed to reset stats');
      setIsLoading(false);
    }
  }, []);

  const resetAll = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      resetScores();
      resetHistory();
      resetStats();
      setIsLoading(false);
    } catch (err) {
      setError('Failed to reset all data');
      setIsLoading(false);
    }
  }, [resetScores, resetHistory, resetStats]);

  const getWinPercentage = useCallback(() => {
    return scores.gamesPlayed > 0 
      ? Math.round((scores.playerScore / scores.gamesPlayed) * 100)
      : 0;
  }, [scores]);

  const getCurrentStreak = useCallback(() => {
    if (gameHistory.length === 0) return { type: 'none', count: 0 };
    
    let streakCount = 0;
    const streakType = gameHistory[0].result;
    
    for (const game of gameHistory) {
      if (game.result === streakType) {
        streakCount++;
      } else {
        break;
      }
    }
    
    return { type: streakType, count: streakCount };
  }, [gameHistory]);

  const getRecentGames = useCallback((limit = 10) => {
    return gameHistory.slice(0, limit);
  }, [gameHistory]);

  useEffect(() => {
    const loadedScores = scoreStorage.getScores();
    const loadedHistory = historyStorage.getHistory();
    const loadedStats = statsStorage.getStats();
    
    setScores(loadedScores);
    setGameHistory(loadedHistory);
    setStats(loadedStats);
  }, []);

  return {
    scores,
    gameHistory,
    stats,
    isLoading,
    error,
    updateScores,
    addGameResult,
    resetScores,
    resetHistory,
    resetStats,
    resetAll,
    getWinPercentage,
    getCurrentStreak,
    getRecentGames
  };
};

export default useScores;