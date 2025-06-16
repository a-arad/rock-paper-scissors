import React from 'react';
import styled from 'styled-components';
import { Choice, GameResult } from '../types/game';

const GameBoardContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 2rem 0;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const PlayerSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const VSSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin: 0 2rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #666;
`;

const PlayerLabel = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const ChoiceDisplay = styled.div`
  font-size: 4rem;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  min-width: 120px;
  border: 2px solid #e9ecef;
`;

const ResultDisplay = styled.div<{ result: GameResult | null }>`
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: ${props => {
    switch(props.result) {
      case 'win': return '#28a745';
      case 'lose': return '#dc3545';
      case 'tie': return '#ffc107';
      default: return '#6c757d';
    }
  }};
  background: ${props => {
    switch(props.result) {
      case 'win': return 'rgba(40, 167, 69, 0.1)';
      case 'lose': return 'rgba(220, 53, 69, 0.1)';
      case 'tie': return 'rgba(255, 193, 7, 0.1)';
      default: return 'transparent';
    }
  }};
`;

const choiceEmojis: Record<Choice, string> = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️'
};

const resultMessages: Record<GameResult, string> = {
  win: 'You Win!',
  lose: 'You Lose!',
  tie: "It's a Tie!"
};

interface GameBoardProps {
  playerChoice: Choice | null;
  computerChoice: Choice | null;
  result: GameResult | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  playerChoice, 
  computerChoice, 
  result 
}) => {
  return (
    <GameBoardContainer>
      <PlayerSection>
        <PlayerLabel>You</PlayerLabel>
        <ChoiceDisplay data-testid="player-choice">
          {playerChoice ? choiceEmojis[playerChoice] : '❓'}
        </ChoiceDisplay>
      </PlayerSection>
      
      <VSSection>
        <span>VS</span>
        {result && (
          <ResultDisplay result={result} data-testid="game-result">
            {resultMessages[result]}
          </ResultDisplay>
        )}
      </VSSection>
      
      <PlayerSection>
        <PlayerLabel>Computer</PlayerLabel>
        <ChoiceDisplay data-testid="computer-choice">
          {computerChoice ? choiceEmojis[computerChoice] : '❓'}
        </ChoiceDisplay>
      </PlayerSection>
    </GameBoardContainer>
  );
};