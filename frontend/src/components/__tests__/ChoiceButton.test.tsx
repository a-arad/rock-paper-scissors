import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChoiceButton } from '../ChoiceButton';
import { Choice } from '../../types/game';

describe('ChoiceButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders choice button with correct emoji and label', () => {
    render(<ChoiceButton choice="rock" onClick={mockOnClick} />);
    
    expect(screen.getByText('🪨')).toBeInTheDocument();
    expect(screen.getByText('rock')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<ChoiceButton choice="paper" onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByTestId('choice-paper'));
    
    expect(mockOnClick).toHaveBeenCalledWith('paper');
  });

  it('renders selected state correctly', () => {
    render(<ChoiceButton choice="scissors" onClick={mockOnClick} selected={true} />);
    
    const button = screen.getByTestId('choice-scissors');
    expect(button).toHaveStyle({ color: 'white' });
  });

  it('does not call onClick when disabled', () => {
    render(<ChoiceButton choice="rock" onClick={mockOnClick} disabled={true} />);
    
    fireEvent.click(screen.getByTestId('choice-rock'));
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('renders all choice types correctly', () => {
    const choices: Choice[] = ['rock', 'paper', 'scissors'];
    const expectedEmojis = ['🪨', '📄', '✂️'];
    
    choices.forEach((choice, index) => {
      const { unmount } = render(<ChoiceButton choice={choice} onClick={mockOnClick} />);
      
      expect(screen.getByText(expectedEmojis[index])).toBeInTheDocument();
      expect(screen.getByText(choice)).toBeInTheDocument();
      
      unmount();
    });
  });
});