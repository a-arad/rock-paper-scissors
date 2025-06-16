import { renderHook, act } from '@testing-library/react';
import useGameApi from '../useGameApi';
import { gameApi } from '../../api';

jest.mock('../../api');

const mockGameApi = gameApi;

describe('useGameApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGameApi.checkHealth.mockResolvedValue({ status: 'healthy' });
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useGameApi());
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.isConnected).toBe(null);
    });

    it('should check connection on mount', async () => {
      renderHook(() => useGameApi());
      
      expect(mockGameApi.checkHealth).toHaveBeenCalledTimes(1);
    });
  });

  describe('playGame', () => {
    it('should successfully play game', async () => {
      const mockResult = {
        playerChoice: 'rock',
        computerChoice: 'scissors',
        result: 'win',
        timestamp: '2024-01-01T00:00:00.000Z'
      };
      
      mockGameApi.playGame.mockResolvedValueOnce(mockResult);
      
      const { result } = renderHook(() => useGameApi());
      
      let gameResult;
      await act(async () => {
        gameResult = await result.current.playGame('rock');
      });
      
      expect(mockGameApi.playGame).toHaveBeenCalledWith('rock');
      expect(gameResult).toEqual(mockResult);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.isConnected).toBe(true);
    });

    it('should handle loading state correctly', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockGameApi.playGame.mockReturnValueOnce(promise);
      
      const { result } = renderHook(() => useGameApi());
      
      act(() => {
        result.current.playGame('rock');
      });
      
      expect(result.current.isLoading).toBe(true);
      
      await act(async () => {
        resolvePromise({ playerChoice: 'rock', computerChoice: 'paper', result: 'lose' });
        await promise;
      });
      
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle API errors', async () => {
      const apiError = new Error('Network error');
      mockGameApi.playGame.mockRejectedValueOnce(apiError);
      
      const { result } = renderHook(() => useGameApi());
      
      await act(async () => {
        try {
          await result.current.playGame('rock');
        } catch (error) {
          expect(error).toBe(apiError);
        }
      });
      
      expect(result.current.error).toBe('Failed to play game. Please try again.');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isConnected).toBe(false);
    });

    it('should handle request cancellation', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockGameApi.playGame.mockReturnValueOnce(promise);
      
      const { result } = renderHook(() => useGameApi());
      
      act(() => {
        result.current.playGame('rock');
      });
      
      expect(result.current.isLoading).toBe(true);
      
      act(() => {
        result.current.cancelRequest();
      });
      
      expect(result.current.isLoading).toBe(false);
      
      await act(async () => {
        resolvePromise({ result: 'win' });
        await promise;
      });
    });

    it('should cancel previous request when making new one', async () => {
      const firstPromise = new Promise(() => {}); // Never resolves
      const secondPromise = Promise.resolve({ 
        playerChoice: 'paper', 
        computerChoice: 'rock', 
        result: 'win' 
      });
      
      mockGameApi.playGame
        .mockReturnValueOnce(firstPromise)
        .mockReturnValueOnce(secondPromise);
      
      const { result } = renderHook(() => useGameApi());
      
      act(() => {
        result.current.playGame('rock');
      });
      
      expect(result.current.isLoading).toBe(true);
      
      let secondResult;
      await act(async () => {
        secondResult = await result.current.playGame('paper');
      });
      
      expect(secondResult).toEqual({ 
        playerChoice: 'paper', 
        computerChoice: 'rock', 
        result: 'win' 
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('getValidChoices', () => {
    it('should successfully get valid choices', async () => {
      const mockChoices = { choices: ['rock', 'paper', 'scissors'] };
      mockGameApi.getValidChoices.mockResolvedValueOnce(mockChoices);
      
      const { result } = renderHook(() => useGameApi());
      
      let choices;
      await act(async () => {
        choices = await result.current.getValidChoices();
      });
      
      expect(mockGameApi.getValidChoices).toHaveBeenCalledTimes(1);
      expect(choices).toEqual(mockChoices);
      expect(result.current.error).toBe(null);
      expect(result.current.isConnected).toBe(true);
    });

    it('should handle errors when getting valid choices', async () => {
      const apiError = new Error('Service unavailable');
      mockGameApi.getValidChoices.mockRejectedValueOnce(apiError);
      
      const { result } = renderHook(() => useGameApi());
      
      await act(async () => {
        try {
          await result.current.getValidChoices();
        } catch (error) {
          expect(error).toBe(apiError);
        }
      });
      
      expect(result.current.error).toBe('Failed to fetch valid choices.');
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('checkConnection', () => {
    it('should successfully check connection', async () => {
      mockGameApi.checkHealth.mockResolvedValueOnce({ status: 'healthy' });
      
      const { result } = renderHook(() => useGameApi());
      
      let isConnected;
      await act(async () => {
        isConnected = await result.current.checkConnection();
      });
      
      expect(isConnected).toBe(true);
      expect(result.current.isConnected).toBe(true);
    });

    it('should handle connection check failure', async () => {
      mockGameApi.checkHealth.mockReset();
      mockGameApi.checkHealth.mockRejectedValue(new Error('Connection failed'));
      
      const { result } = renderHook(() => useGameApi());
      
      let isConnected;
      await act(async () => {
        isConnected = await result.current.checkConnection();
      });
      
      expect(isConnected).toBe(false);
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const apiError = new Error('Test error');
      mockGameApi.playGame.mockRejectedValueOnce(apiError);
      
      const { result } = renderHook(() => useGameApi());
      
      await act(async () => {
        try {
          await result.current.playGame('rock');
        } catch {}
      });
      
      expect(result.current.error).toBeTruthy();
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('cleanup', () => {
    it('should cancel requests on unmount', () => {
      const { unmount } = renderHook(() => useGameApi());
      
      // This test mainly ensures no errors occur during cleanup
      expect(() => unmount()).not.toThrow();
    });
  });
});