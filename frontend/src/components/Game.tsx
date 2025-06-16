import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { GameBoard } from './GameBoard';
import { GameControls } from './GameControls';
import { ScoreBoard } from './ScoreBoard';
import { Choice, GameResult, GameState } from '../types/game';
import { Card, Title } from '../styles/GlobalStyles';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  width: 100%;
  max-width: 800px;
`;

const GameCard = styled(Card)`
  width: 100%;
  text-align: center;
`;

const GameInstructions = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const initialGameState: GameState = {
  playerChoice: null,
  computerChoice: null,
  result: null,
  playerScore: 0,
  computerScore: 0,
  isPlaying: false
};

const getComputerChoice = (): Choice => {
  const choices: Choice[] = ['rock', 'paper', 'scissors'];
  return choices[Math.floor(Math.random() * choices.length)];
};

const determineWinner = (playerChoice: Choice, computerChoice: Choice): GameResult => {
  if (playerChoice === computerChoice) {
    return 'tie';
  }
  
  const winConditions: Record<Choice, Choice> = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };
  
  return winConditions[playerChoice] === computerChoice ? 'win' : 'lose';
};

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const handleChoiceSelect = useCallback((playerChoice: Choice) => {
    const computerChoice = getComputerChoice();
    const result = determineWinner(playerChoice, computerChoice);
    
    setGameState(prevState => ({
      ...prevState,
      playerChoice,
      computerChoice,
      result,
      playerScore: result === 'win' ? prevState.playerScore + 1 : prevState.playerScore,
      computerScore: result === 'lose' ? prevState.computerScore + 1 : prevState.computerScore,
      isPlaying: true
    }));
  }, []);

  const handleReset = useCallback(() => {
    setGameState(initialGameState);
  }, []);

  return (
    <GameContainer>
      <Title>Rock Paper Scissors</Title>
      
      <GameCard>
        <GameInstructions>
          Choose your weapon! Rock crushes scissors, scissors cuts paper, and paper covers rock.
        </GameInstructions>
        
        <ScoreBoard 
          playerScore={gameState.playerScore} 
          computerScore={gameState.computerScore} 
        />
        
        <GameBoard
          playerChoice={gameState.playerChoice}
          computerChoice={gameState.computerChoice}
          result={gameState.result}
        />
        
        <GameControls
          onChoiceSelect={handleChoiceSelect}
          onReset={handleReset}
          selectedChoice={gameState.playerChoice}
        />
      </GameCard>
    </GameContainer>
  );
};