import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { GameProvider, GameContext } from '../GameContext';
import { gameApi } from '../../api';

jest.mock('../../api');

const mockGameApi = gameApi;

const TestComponent = () => {
  const { 
    makeMove, 
    isLoading, 
    error, 
    isConnected,
    playerChoice,
    computerChoice,
    gameResult,
    playerScore,
    computerScore,
    gamesPlayed
  } = React.useContext(GameContext);

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      <div data-testid="connected">{isConnected ? 'Connected' : 'Not Connected'}</div>
      <div data-testid="player-choice">{playerChoice || 'No Choice'}</div>
      <div data-testid="computer-choice">{computerChoice || 'No Choice'}</div>
      <div data-testid="game-result">{gameResult || 'No Result'}</div>
      <div data-testid="player-score">{playerScore}</div>
      <div data-testid="computer-score">{computerScore}</div>
      <div data-testid="games-played">{gamesPlayed}</div>
      <button 
        data-testid="make-move-button" 
        onClick={() => makeMove('rock')}
      >
        Make Move
      </button>
    </div>
  );
};

describe('GameContext Integration with API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGameApi.checkHealth.mockResolvedValue({ status: 'healthy' });
  });

  it('should integrate API calls with game state management', async () => {
    const mockGameResult = {
      playerChoice: 'rock',
      computerChoice: 'scissors',
      result: 'win',
      timestamp: '2024-01-01T00:00:00.000Z'
    };

    mockGameApi.playGame.mockResolvedValueOnce(mockGameResult);

    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');
    expect(screen.getByTestId('player-score')).toHaveTextContent('0');
    expect(screen.getByTestId('games-played')).toHaveTextContent('0');

    await act(async () => {
      screen.getByTestId('make-move-button').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    expect(mockGameApi.playGame).toHaveBeenCalledWith('rock');
    expect(screen.getByTestId('player-choice')).toHaveTextContent('rock');
    expect(screen.getByTestId('computer-choice')).toHaveTextContent('scissors');
    expect(screen.getByTestId('game-result')).toHaveTextContent('win');
    expect(screen.getByTestId('player-score')).toHaveTextContent('1');
    expect(screen.getByTestId('games-played')).toHaveTextContent('1');
    expect(screen.getByTestId('connected')).toHaveTextContent('Connected');
  });

  it('should handle API errors gracefully', async () => {
    const apiError = new Error('Network error');
    mockGameApi.playGame.mockRejectedValueOnce(apiError);

    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    await act(async () => {
      screen.getByTestId('make-move-button').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('connected')).toHaveTextContent('Not Connected');
    expect(screen.getByTestId('player-choice')).toHaveTextContent('No Choice');
    expect(screen.getByTestId('games-played')).toHaveTextContent('0');
  });

  it('should show loading state during API calls', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockGameApi.playGame.mockReturnValueOnce(promise);

    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    act(() => {
      screen.getByTestId('make-move-button').click();
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    await act(async () => {
      resolvePromise({
        playerChoice: 'rock',
        computerChoice: 'paper',
        result: 'lose'
      });
      await promise;
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
  });

  it('should handle consecutive API calls correctly', async () => {
    const firstResult = {
      playerChoice: 'rock',
      computerChoice: 'scissors',
      result: 'win'
    };

    const secondResult = {
      playerChoice: 'rock',
      computerChoice: 'paper',
      result: 'lose'
    };

    mockGameApi.playGame
      .mockResolvedValueOnce(firstResult)
      .mockResolvedValueOnce(secondResult);

    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // First game
    await act(async () => {
      screen.getByTestId('make-move-button').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('player-score')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('games-played')).toHaveTextContent('1');

    // Second game
    await act(async () => {
      screen.getByTestId('make-move-button').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('computer-score')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('games-played')).toHaveTextContent('2');
    expect(screen.getByTestId('game-result')).toHaveTextContent('lose');
  });

  it('should maintain connection status based on API responses', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Wait for initial connection check
    await waitFor(() => {
      expect(screen.getByTestId('connected')).toHaveTextContent('Connected');
    });

    // Simulate API failure
    mockGameApi.playGame.mockRejectedValueOnce(new Error('Connection failed'));

    await act(async () => {
      screen.getByTestId('make-move-button').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('connected')).toHaveTextContent('Not Connected');
    });

    // Simulate successful API call
    mockGameApi.playGame.mockResolvedValueOnce({
      playerChoice: 'rock',
      computerChoice: 'scissors',
      result: 'win'
    });

    await act(async () => {
      screen.getByTestId('make-move-button').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('connected')).toHaveTextContent('Connected');
    });
  });

  it('should handle tie games correctly', async () => {
    const tieResult = {
      playerChoice: 'rock',
      computerChoice: 'rock',
      result: 'tie'
    };

    mockGameApi.playGame.mockResolvedValueOnce(tieResult);

    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    await act(async () => {
      screen.getByTestId('make-move-button').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('game-result')).toHaveTextContent('tie');
    });

    expect(screen.getByTestId('player-score')).toHaveTextContent('0');
    expect(screen.getByTestId('computer-score')).toHaveTextContent('0');
    expect(screen.getByTestId('games-played')).toHaveTextContent('1');
  });
});