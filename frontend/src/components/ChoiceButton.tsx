import React from 'react';
import styled from 'styled-components';
import { Choice } from '../types/game';

const ChoiceButtonStyled = styled.button<{ selected?: boolean }>`
  background: ${props => props.selected ? 'linear-gradient(45deg, #4ecdc4, #44a08d)' : 'white'};
  color: ${props => props.selected ? 'white' : '#333'};
  border: 3px solid ${props => props.selected ? '#44a08d' : '#ddd'};
  border-radius: 16px;
  padding: 1.5rem;
  font-size: 3rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-color: #4ecdc4;
  }

  &:active {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ChoiceLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
`;

const choiceEmojis: Record<Choice, string> = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️'
};

interface ChoiceButtonProps {
  choice: Choice;
  onClick: (choice: Choice) => void;
  selected?: boolean;
  disabled?: boolean;
}

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({ 
  choice, 
  onClick, 
  selected = false, 
  disabled = false 
}) => {
  return (
    <ChoiceButtonStyled
      onClick={() => onClick(choice)}
      selected={selected}
      disabled={disabled}
      data-testid={`choice-${choice}`}
    >
      <span>{choiceEmojis[choice]}</span>
      <ChoiceLabel>{choice}</ChoiceLabel>
    </ChoiceButtonStyled>
  );
};