import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders rock paper scissors game', () => {
  render(<App />);
  const titleElement = screen.getByText(/rock paper scissors/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders all game components', () => {
  render(<App />);
  
  // Check for game instructions
  expect(screen.getByText(/choose your weapon/i)).toBeInTheDocument();
  
  // Check for choice buttons
  expect(screen.getByTestId('choice-rock')).toBeInTheDocument();
  expect(screen.getByTestId('choice-paper')).toBeInTheDocument();
  expect(screen.getByTestId('choice-scissors')).toBeInTheDocument();
  
  // Check for scoreboard
  expect(screen.getByTestId('player-score')).toBeInTheDocument();
  expect(screen.getByTestId('computer-score')).toBeInTheDocument();
  
  // Check for reset button
  expect(screen.getByTestId('reset-button')).toBeInTheDocument();
});
