import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameProvider } from '../../context/GameContext';
import { useGame } from '../useGame';

const TestComponent = () => {
  const gameContext = useGame();
  
  return (
    <div>
      <div data-testid="context-available">
        {gameContext ? 'available' : 'not available'}
      </div>
      <div data-testid="player-score">{gameContext.playerScore}</div>
      <div data-testid="make-move-function">
        {typeof gameContext.makeMove === 'function' ? 'function' : 'not function'}
      </div>
    </div>
  );
};

const TestComponentWithoutProvider = () => {
  try {
    useGame();
    return <div data-testid="no-error">No error thrown</div>;
  } catch (error) {
    return <div data-testid="error-thrown">{error.message}</div>;
  }
};

describe('useGame hook', () => {
  test('provides game context when used within GameProvider', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    expect(screen.getByTestId('context-available')).toHaveTextContent('available');
    expect(screen.getByTestId('player-score')).toHaveTextContent('0');
    expect(screen.getByTestId('make-move-function')).toHaveTextContent('function');
  });

  test('throws error when used outside GameProvider', () => {
    render(<TestComponentWithoutProvider />);

    expect(screen.getByTestId('error-thrown')).toHaveTextContent(
      'useGame must be used within a GameProvider'
    );
  });

  test('provides all expected context properties and methods', () => {
    const TestAllProperties = () => {
      const context = useGame();
      const expectedProperties = [
        'playerChoice',
        'computerChoice', 
        'gameResult',
        'playerScore',
        'computerScore',
        'gamesPlayed',
        'isLoading',
        'error',
        'gameHistory',
        'makeMove',
        'resetGame',
        'resetScores',
        'getWinRate',
        'GAME_CHOICES',
        'GAME_RESULTS'
      ];

      const missingProperties = expectedProperties.filter(prop => !(prop in context));
      
      return (
        <div data-testid="missing-properties">
          {missingProperties.length === 0 ? 'all present' : missingProperties.join(', ')}
        </div>
      );
    };

    render(
      <GameProvider>
        <TestAllProperties />
      </GameProvider>
    );

    expect(screen.getByTestId('missing-properties')).toHaveTextContent('all present');
  });
});