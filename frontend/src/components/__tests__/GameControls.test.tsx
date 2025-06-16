import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameControls } from '../GameControls';

describe('GameControls', () => {
  const mockOnChoiceSelect = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    mockOnChoiceSelect.mockClear();
    mockOnReset.mockClear();
  });

  it('renders all choice buttons', () => {
    render(
      <GameControls 
        onChoiceSelect={mockOnChoiceSelect} 
        onReset={mockOnReset} 
      />
    );
    
    expect(screen.getByTestId('choice-rock')).toBeInTheDocument();
    expect(screen.getByTestId('choice-paper')).toBeInTheDocument();
    expect(screen.getByTestId('choice-scissors')).toBeInTheDocument();
  });

  it('renders reset button', () => {
    render(
      <GameControls 
        onChoiceSelect={mockOnChoiceSelect} 
        onReset={mockOnReset} 
      />
    );
    
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    expect(screen.getByText('Reset Game')).toBeInTheDocument();
  });

  it('calls onChoiceSelect when choice button is clicked', () => {
    render(
      <GameControls 
        onChoiceSelect={mockOnChoiceSelect} 
        onReset={mockOnReset} 
      />
    );
    
    fireEvent.click(screen.getByTestId('choice-rock'));
    expect(mockOnChoiceSelect).toHaveBeenCalledWith('rock');
    
    fireEvent.click(screen.getByTestId('choice-paper'));
    expect(mockOnChoiceSelect).toHaveBeenCalledWith('paper');
    
    fireEvent.click(screen.getByTestId('choice-scissors'));
    expect(mockOnChoiceSelect).toHaveBeenCalledWith('scissors');
  });

  it('calls onReset when reset button is clicked', () => {
    render(
      <GameControls 
        onChoiceSelect={mockOnChoiceSelect} 
        onReset={mockOnReset} 
      />
    );
    
    fireEvent.click(screen.getByTestId('reset-button'));
    expect(mockOnReset).toHaveBeenCalled();
  });

  it('disables choice buttons when disabled prop is true', () => {
    render(
      <GameControls 
        onChoiceSelect={mockOnChoiceSelect} 
        onReset={mockOnReset} 
        disabled={true}
      />
    );
    
    fireEvent.click(screen.getByTestId('choice-rock'));
    expect(mockOnChoiceSelect).not.toHaveBeenCalled();
  });

  it('shows selected choice correctly', () => {
    render(
      <GameControls 
        onChoiceSelect={mockOnChoiceSelect} 
        onReset={mockOnReset} 
        selectedChoice="rock"
      />
    );
    
    const rockButton = screen.getByTestId('choice-rock');
    expect(rockButton).toHaveStyle({ color: 'white' });
  });
});