import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { GameProvider, GameContext, GAME_CHOICES, GAME_RESULTS } from '../GameContext';
import { useContext } from 'react';

jest.mock('../../hooks/useScores', () => ({
  useScores: () => ({
    scores: {
      playerScore: 0,
      computerScore: 0,
      gamesPlayed: 0,
      winRate: 0,
      lastUpdated: '2023-01-01T00:00:00.000Z'
    },
    gameHistory: [],
    stats: {
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
    },
    isLoading: false,
    error: null,
    updateScores: jest.fn(),
    addGameResult: jest.fn(),
    resetScores: jest.fn(),
    resetHistory: jest.fn(),
    resetStats: jest.fn(),
    resetAll: jest.fn(),
    getWinPercentage: jest.fn(() => 0),
    getCurrentStreak: jest.fn(() => ({ type: 'none', count: 0 })),
    getRecentGames: jest.fn(() => [])
  })
}));

const TestComponent = () => {
  const context = useContext(GameContext);
  
  return (
    <div>
      <div data-testid="player-choice">{context.playerChoice || 'none'}</div>
      <div data-testid="computer-choice">{context.computerChoice || 'none'}</div>
      <div data-testid="game-result">{context.gameResult || 'none'}</div>
      <div data-testid="player-score">{context.playerScore}</div>
      <div data-testid="computer-score">{context.computerScore}</div>
      <div data-testid="games-played">{context.gamesPlayed}</div>
      <div data-testid="loading">{context.isLoading.toString()}</div>
      <div data-testid="error">{context.error || 'none'}</div>
      <div data-testid="win-rate">{context.getWinRate()}</div>
      <button onClick={() => context.makeMove(GAME_CHOICES.ROCK)}>
        Make Rock Move
      </button>
      <button onClick={context.resetGame}>Reset Game</button>
      <button onClick={context.resetScores}>Reset Scores</button>
    </div>
  );
};

const renderWithProvider = (component) => {
  return render(
    <GameProvider>
      {component}
    </GameProvider>
  );
};

// Mock Math.random to make tests deterministic
const mockMath = Object.create(global.Math);
mockMath.random = jest.fn();
global.Math = mockMath;

describe('GameContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('provides initial state', () => {
    renderWithProvider(<TestComponent />);
    
    expect(screen.getByTestId('player-choice')).toHaveTextContent('none');
    expect(screen.getByTestId('computer-choice')).toHaveTextContent('none');
    expect(screen.getByTestId('game-result')).toHaveTextContent('none');
    expect(screen.getByTestId('player-score')).toHaveTextContent('0');
    expect(screen.getByTestId('computer-score')).toHaveTextContent('0');
    expect(screen.getByTestId('games-played')).toHaveTextContent('0');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
    expect(screen.getByTestId('win-rate')).toHaveTextContent('0');
  });

  test('handles making a move that results in a win', async () => {
    // Setup: Player chooses rock, computer chooses scissors (player wins)
    Math.random.mockReturnValue(0.9); // This will select scissors (index 2)
    
    renderWithProvider(<TestComponent />);
    
    const makeRockButton = screen.getByText('Make Rock Move');
    
    act(() => {
      makeRockButton.click();
    });

    // Check loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // Fast-forward the timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('player-choice')).toHaveTextContent('rock');
    expect(screen.getByTestId('computer-choice')).toHaveTextContent('scissors');
    expect(screen.getByTestId('game-result')).toHaveTextContent('win');
    expect(screen.getByTestId('player-score')).toHaveTextContent('1');
    expect(screen.getByTestId('computer-score')).toHaveTextContent('0');
    expect(screen.getByTestId('games-played')).toHaveTextContent('1');
    expect(screen.getByTestId('win-rate')).toHaveTextContent('100');
  });

  test('handles making a move that results in a loss', async () => {
    // Setup: Player chooses rock, computer chooses paper (player loses)
    Math.random.mockReturnValue(0.4); // This will select paper (index 1)
    
    renderWithProvider(<TestComponent />);
    
    const makeRockButton = screen.getByText('Make Rock Move');
    
    act(() => {
      makeRockButton.click();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('player-choice')).toHaveTextContent('rock');
    expect(screen.getByTestId('computer-choice')).toHaveTextContent('paper');
    expect(screen.getByTestId('game-result')).toHaveTextContent('lose');
    expect(screen.getByTestId('player-score')).toHaveTextContent('0');
    expect(screen.getByTestId('computer-score')).toHaveTextContent('1');
    expect(screen.getByTestId('games-played')).toHaveTextContent('1');
    expect(screen.getByTestId('win-rate')).toHaveTextContent('0');
  });

  test('handles making a move that results in a tie', async () => {
    // Setup: Player chooses rock, computer chooses rock (tie)
    Math.random.mockReturnValue(0.1); // This will select rock (index 0)
    
    renderWithProvider(<TestComponent />);
    
    const makeRockButton = screen.getByText('Make Rock Move');
    
    act(() => {
      makeRockButton.click();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('player-choice')).toHaveTextContent('rock');
    expect(screen.getByTestId('computer-choice')).toHaveTextContent('rock');
    expect(screen.getByTestId('game-result')).toHaveTextContent('tie');
    expect(screen.getByTestId('player-score')).toHaveTextContent('0');
    expect(screen.getByTestId('computer-score')).toHaveTextContent('0');
    expect(screen.getByTestId('games-played')).toHaveTextContent('1');
    expect(screen.getByTestId('win-rate')).toHaveTextContent('0');
  });

  test('resets game state', async () => {
    Math.random.mockReturnValue(0.1);
    
    renderWithProvider(<TestComponent />);
    
    // Make a move first
    act(() => {
      screen.getByText('Make Rock Move').click();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Reset the game
    act(() => {
      screen.getByText('Reset Game').click();
    });

    expect(screen.getByTestId('player-choice')).toHaveTextContent('none');
    expect(screen.getByTestId('computer-choice')).toHaveTextContent('none');
    expect(screen.getByTestId('game-result')).toHaveTextContent('none');
    // Scores should remain
    expect(screen.getByTestId('games-played')).toHaveTextContent('1');
  });

  test('resets all scores and game state', async () => {
    Math.random.mockReturnValue(0.1);
    
    renderWithProvider(<TestComponent />);
    
    // Make a move first
    act(() => {
      screen.getByText('Make Rock Move').click();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Reset all scores
    act(() => {
      screen.getByText('Reset Scores').click();
    });

    expect(screen.getByTestId('player-choice')).toHaveTextContent('none');
    expect(screen.getByTestId('computer-choice')).toHaveTextContent('none');
    expect(screen.getByTestId('game-result')).toHaveTextContent('none');
    expect(screen.getByTestId('player-score')).toHaveTextContent('0');
    expect(screen.getByTestId('computer-score')).toHaveTextContent('0');
    expect(screen.getByTestId('games-played')).toHaveTextContent('0');
    expect(screen.getByTestId('win-rate')).toHaveTextContent('0');
  });

  test('calculates win rate correctly', async () => {
    Math.random
      .mockReturnValueOnce(0.9) // scissors - player wins
      .mockReturnValueOnce(0.4) // paper - player loses
      .mockReturnValueOnce(0.9); // scissors - player wins
    
    renderWithProvider(<TestComponent />);
    
    // First game - win
    act(() => {
      screen.getByText('Make Rock Move').click();
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('win-rate')).toHaveTextContent('100');

    // Second game - lose
    act(() => {
      screen.getByText('Make Rock Move').click();
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('win-rate')).toHaveTextContent('50');

    // Third game - win
    act(() => {
      screen.getByText('Make Rock Move').click();
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('win-rate')).toHaveTextContent('67');
  });
});