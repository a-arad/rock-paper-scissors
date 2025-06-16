import { render, screen } from '@testing-library/react';
import App from './App';

test('renders rock paper scissors title', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { name: /rock paper scissors/i });
  expect(titleElement).toBeInTheDocument();
});

test('renders welcome message', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/welcome to the rock paper scissors game!/i);
  expect(welcomeElement).toBeInTheDocument();
});
