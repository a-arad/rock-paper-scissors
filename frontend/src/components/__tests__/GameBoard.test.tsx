import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameBoard } from '../GameBoard';
import { Choice, GameResult } from '../../types/game';

describe('GameBoard', () => {
  it('renders empty state correctly', () => {
    render(<GameBoard playerChoice={null} computerChoice={null} result={null} />);
    
    expect(screen.getByTestId('player-choice')).toHaveTextContent('❓');
    expect(screen.getByTestId('computer-choice')).toHaveTextContent('❓');
    expect(screen.queryByTestId('game-result')).not.toBeInTheDocument();
  });

  it('displays player and computer choices', () => {
    render(<GameBoard playerChoice="rock" computerChoice="paper" result="lose" />);
    
    expect(screen.getByTestId('player-choice')).toHaveTextContent('🪨');
    expect(screen.getByTestId('computer-choice')).toHaveTextContent('📄');
  });

  it('displays win result correctly', () => {
    render(<GameBoard playerChoice="rock" computerChoice="scissors" result="win" />);
    
    const result = screen.getByTestId('game-result');
    expect(result).toHaveTextContent('You Win!');
  });

  it('displays lose result correctly', () => {
    render(<GameBoard playerChoice="rock" computerChoice="paper" result="lose" />);
    
    const result = screen.getByTestId('game-result');
    expect(result).toHaveTextContent('You Lose!');
  });

  it('displays tie result correctly', () => {
    render(<GameBoard playerChoice="rock" computerChoice="rock" result="tie" />);
    
    const result = screen.getByTestId('game-result');
    expect(result).toHaveTextContent("It's a Tie!");
  });

  it('renders player and computer labels', () => {
    render(<GameBoard playerChoice={null} computerChoice={null} result={null} />);
    
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Computer')).toBeInTheDocument();
    expect(screen.getByText('VS')).toBeInTheDocument();
  });
});