import { gameApi, GameApiError } from '../gameApi';

global.fetch = jest.fn();

const mockFetch = (response, status = 200, ok = true) => {
  fetch.mockResolvedValueOnce({
    ok,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: jest.fn().mockResolvedValue(response),
  });
};

const mockFetchError = (error = new Error('Network error')) => {
  fetch.mockRejectedValueOnce(error);
};

describe('gameApi', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('playGame', () => {
    it('should make successful API call with valid choice', async () => {
      const mockResponse = {
        playerChoice: 'rock',
        computerChoice: 'scissors',
        result: 'win',
        timestamp: '2024-01-01T00:00:00.000Z'
      };
      
      mockFetch(mockResponse);
      
      const result = await gameApi.playGame('rock');
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/game/play',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choice: 'rock' })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should normalize choice to lowercase', async () => {
      const mockResponse = { playerChoice: 'rock', computerChoice: 'scissors', result: 'win' };
      mockFetch(mockResponse);
      
      await gameApi.playGame('ROCK');
      
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ choice: 'rock' })
        })
      );
    });

    it('should throw GameApiError for invalid choice (client-side validation)', async () => {
      await expect(gameApi.playGame('')).rejects.toThrow(GameApiError);
      await expect(gameApi.playGame(null)).rejects.toThrow(GameApiError);
      await expect(gameApi.playGame(123)).rejects.toThrow(GameApiError);
      
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle 400 error response', async () => {
      const errorResponse = { error: 'Invalid choice. Must be rock, paper, or scissors.' };
      mockFetch(errorResponse, 400, false);
      
      const error = await gameApi.playGame('invalid').catch(e => e);
      expect(error).toBeInstanceOf(GameApiError);
      expect(error.message).toBe('Invalid choice. Must be rock, paper, or scissors.');
    });

    it('should handle 500 error response', async () => {
      const errorResponse = { error: 'Internal server error' };
      mockFetch(errorResponse, 500, false);
      
      const error = await gameApi.playGame('rock').catch(e => e);
      expect(error).toBeInstanceOf(GameApiError);
      expect(error.status).toBe(500);
    });

    it('should handle network errors', async () => {
      mockFetchError();
      
      const error = await gameApi.playGame('rock').catch(e => e);
      expect(error).toBeInstanceOf(GameApiError);
      expect(error.message).toContain('unexpected error occurred');
    });

    it('should handle fetch failures with specific network error message', async () => {
      mockFetchError(new TypeError('Failed to fetch'));
      
      const error = await gameApi.playGame('rock').catch(e => e);
      expect(error).toBeInstanceOf(GameApiError);
      expect(error.message).toContain('Unable to connect to the game server');
    });
  });

  describe('getValidChoices', () => {
    it('should fetch valid choices successfully', async () => {
      const mockResponse = { choices: ['rock', 'paper', 'scissors'] };
      mockFetch(mockResponse);
      
      const result = await gameApi.getValidChoices();
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/game/choices',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle error response', async () => {
      mockFetch({ error: 'Service unavailable' }, 503, false);
      
      const error = await gameApi.getValidChoices().catch(e => e);
      expect(error).toBeInstanceOf(GameApiError);
      expect(error.message).toBe('Service unavailable');
    });
  });

  describe('checkHealth', () => {
    it('should check health endpoint successfully', async () => {
      const mockResponse = { status: 'healthy', timestamp: '2024-01-01T00:00:00.000Z' };
      mockFetch(mockResponse);
      
      const result = await gameApi.checkHealth();
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/health',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should create GameApiError with proper properties', () => {
      const error = new GameApiError('Test error', 400, { field: 'value' });
      
      expect(error.name).toBe('GameApiError');
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.data).toEqual({ field: 'value' });
      expect(error).toBeInstanceOf(Error);
    });

    it('should handle API responses without JSON body', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockRejectedValue(new Error('No JSON'))
      });
      
      const error = await gameApi.playGame('rock').catch(e => e);
      expect(error).toBeInstanceOf(GameApiError);
      expect(error.message).toBe('HTTP 500: Internal Server Error');
    });
  });

  describe('API configuration', () => {
    it('should use environment variable for API URL when available', () => {
      const originalEnv = process.env.REACT_APP_API_URL;
      process.env.REACT_APP_API_URL = 'https://api.example.com/api';
      
      jest.resetModules();
      const { gameApi: configuredApi } = require('../gameApi');
      
      mockFetch({ choices: ['rock'] });
      configuredApi.getValidChoices();
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/game/choices',
        expect.any(Object)
      );
      
      process.env.REACT_APP_API_URL = originalEnv;
    });
  });
});