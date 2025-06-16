import React from 'react';
import styled from 'styled-components';

const ScoreBoardContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 1rem 0;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const ScoreItem = styled.div`
  text-align: center;
`;

const ScoreLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ScoreValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
`;

interface ScoreBoardProps {
  playerScore: number;
  computerScore: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ 
  playerScore, 
  computerScore 
}) => {
  return (
    <ScoreBoardContainer>
      <ScoreItem>
        <ScoreLabel>You</ScoreLabel>
        <ScoreValue data-testid="player-score">{playerScore}</ScoreValue>
      </ScoreItem>
      <ScoreItem>
        <ScoreLabel>Computer</ScoreLabel>
        <ScoreValue data-testid="computer-score">{computerScore}</ScoreValue>
      </ScoreItem>
    </ScoreBoardContainer>
  );
};