import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Game } from '../Game';

// Mock Math.random to make tests deterministic
const mockMath = Object.create(global.Math);
mockMath.random = jest.fn();
global.Math = mockMath;

describe('Game', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders game title and instructions', () => {
    render(<Game />);
    
    expect(screen.getByText('Rock Paper Scissors')).toBeInTheDocument();
    expect(screen.getByText(/Choose your weapon!/)).toBeInTheDocument();
  });

  it('renders initial game state', () => {
    render(<Game />);
    
    expect(screen.getByTestId('player-score')).toHaveTextContent('0');
    expect(screen.getByTestId('computer-score')).toHaveTextContent('0');
    expect(screen.getByTestId('player-choice')).toHaveTextContent('❓');
    expect(screen.getByTestId('computer-choice')).toHaveTextContent('❓');
  });

  it('plays a round when player makes a choice', async () => {
    // Mock computer to choose 'scissors' (index 2)
    (Math.random as jest.Mock).mockReturnValue(0.9);
    
    render(<Game />);
    
    // Player chooses rock (should win against scissors)
    fireEvent.click(screen.getByTestId('choice-rock'));
    
    await waitFor(() => {
      expect(screen.getByTestId('player-choice')).toHaveTextContent('🪨');
      expect(screen.getByTestId('computer-choice')).toHaveTextContent('✂️');
      expect(screen.getByTestId('game-result')).toHaveTextContent('You Win!');
      expect(screen.getByTestId('player-score')).toHaveTextContent('1');
      expect(screen.getByTestId('computer-score')).toHaveTextContent('0');
    });
  });

  it('handles a losing round correctly', async () => {
    // Mock computer to choose 'paper' (index 1)
    (Math.random as jest.Mock).mockReturnValue(0.5);
    
    render(<Game />);
    
    // Player chooses rock (should lose against paper)
    fireEvent.click(screen.getByTestId('choice-rock'));
    
    await waitFor(() => {
      expect(screen.getByTestId('player-choice')).toHaveTextContent('🪨');
      expect(screen.getByTestId('computer-choice')).toHaveTextContent('📄');
      expect(screen.getByTestId('game-result')).toHaveTextContent('You Lose!');
      expect(screen.getByTestId('player-score')).toHaveTextContent('0');
      expect(screen.getByTestId('computer-score')).toHaveTextContent('1');
    });
  });

  it('handles a tie round correctly', async () => {
    // Mock computer to choose 'rock' (index 0)
    (Math.random as jest.Mock).mockReturnValue(0.1);
    
    render(<Game />);
    
    // Player chooses rock (should tie)
    fireEvent.click(screen.getByTestId('choice-rock'));
    
    await waitFor(() => {
      expect(screen.getByTestId('player-choice')).toHaveTextContent('🪨');
      expect(screen.getByTestId('computer-choice')).toHaveTextContent('🪨');
      expect(screen.getByTestId('game-result')).toHaveTextContent("It's a Tie!");
      expect(screen.getByTestId('player-score')).toHaveTextContent('0');
      expect(screen.getByTestId('computer-score')).toHaveTextContent('0');
    });
  });

  it('resets game when reset button is clicked', async () => {
    // Mock computer choice
    (Math.random as jest.Mock).mockReturnValue(0.9);
    
    render(<Game />);
    
    // Play a round first
    fireEvent.click(screen.getByTestId('choice-rock'));
    
    await waitFor(() => {
      expect(screen.getByTestId('player-score')).toHaveTextContent('1');
    });
    
    // Reset the game
    fireEvent.click(screen.getByTestId('reset-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('player-score')).toHaveTextContent('0');
      expect(screen.getByTestId('computer-score')).toHaveTextContent('0');
      expect(screen.getByTestId('player-choice')).toHaveTextContent('❓');
      expect(screen.getByTestId('computer-choice')).toHaveTextContent('❓');
      expect(screen.queryByTestId('game-result')).not.toBeInTheDocument();
    });
  });

  it('accumulates scores over multiple rounds', async () => {
    render(<Game />);
    
    // Player wins first round
    (Math.random as jest.Mock).mockReturnValue(0.9); // computer picks scissors
    fireEvent.click(screen.getByTestId('choice-rock'));
    
    await waitFor(() => {
      expect(screen.getByTestId('player-score')).toHaveTextContent('1');
    });
    
    // Player loses second round
    (Math.random as jest.Mock).mockReturnValue(0.5); // computer picks paper
    fireEvent.click(screen.getByTestId('choice-rock'));
    
    await waitFor(() => {
      expect(screen.getByTestId('player-score')).toHaveTextContent('1');
      expect(screen.getByTestId('computer-score')).toHaveTextContent('1');
    });
  });
});