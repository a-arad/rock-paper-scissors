import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScoreBoard } from '../ScoreBoard';

describe('ScoreBoard', () => {
  it('renders initial scores correctly', () => {
    render(<ScoreBoard playerScore={0} computerScore={0} />);
    
    expect(screen.getByTestId('player-score')).toHaveTextContent('0');
    expect(screen.getByTestId('computer-score')).toHaveTextContent('0');
  });

  it('displays updated scores', () => {
    render(<ScoreBoard playerScore={3} computerScore={2} />);
    
    expect(screen.getByTestId('player-score')).toHaveTextContent('3');
    expect(screen.getByTestId('computer-score')).toHaveTextContent('2');
  });

  it('renders score labels correctly', () => {
    render(<ScoreBoard playerScore={0} computerScore={0} />);
    
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Computer')).toBeInTheDocument();
  });

  it('handles large score numbers', () => {
    render(<ScoreBoard playerScore={99} computerScore={100} />);
    
    expect(screen.getByTestId('player-score')).toHaveTextContent('99');
    expect(screen.getByTestId('computer-score')).toHaveTextContent('100');
  });
});