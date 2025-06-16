import React from 'react';
import styled from 'styled-components';
import { ChoiceButton } from './ChoiceButton';
import { Choice } from '../types/game';
import { Button } from '../styles/GlobalStyles';

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  width: 100%;
`;

const ChoicesContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ResetButton = styled(Button)`
  background: linear-gradient(45deg, #6c757d, #495057);
  
  &:hover {
    box-shadow: 0 6px 16px rgba(73, 80, 87, 0.4);
  }
`;

const choices: Choice[] = ['rock', 'paper', 'scissors'];

interface GameControlsProps {
  onChoiceSelect: (choice: Choice) => void;
  onReset: () => void;
  disabled?: boolean;
  selectedChoice?: Choice | null;
}

export const GameControls: React.FC<GameControlsProps> = ({ 
  onChoiceSelect, 
  onReset, 
  disabled = false,
  selectedChoice = null
}) => {
  return (
    <ControlsContainer>
      <ChoicesContainer>
        {choices.map(choice => (
          <ChoiceButton
            key={choice}
            choice={choice}
            onClick={onChoiceSelect}
            selected={selectedChoice === choice}
            disabled={disabled}
          />
        ))}
      </ChoicesContainer>
      
      <ActionsContainer>
        <ResetButton onClick={onReset} data-testid="reset-button">
          Reset Game
        </ResetButton>
      </ActionsContainer>
    </ControlsContainer>
  );
};