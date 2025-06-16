import React, { createContext, useReducer, useEffect } from 'react';
import { useScores } from '../hooks/useScores';

const GAME_CHOICES = {
  ROCK: 'rock',
  PAPER: 'paper',
  SCISSORS: 'scissors'
};

const GAME_RESULTS = {
  WIN: 'win',
  LOSE: 'lose',
  TIE: 'tie'
};

const GAME_ACTIONS = {
  MAKE_MOVE: 'MAKE_MOVE',
  RESET_GAME: 'RESET_GAME',
  RESET_SCORES: 'RESET_SCORES',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

const getInitialState = (persistedScores = null) => ({
  playerChoice: null,
  computerChoice: null,
  gameResult: null,
  playerScore: persistedScores?.playerScore || 0,
  computerScore: persistedScores?.computerScore || 0,
  gamesPlayed: persistedScores?.gamesPlayed || 0,
  isLoading: false,
  error: null,
  gameHistory: []
});

const gameReducer = (state, action) => {
  switch (action.type) {
    case GAME_ACTIONS.MAKE_MOVE:
      const { playerChoice, computerChoice, result } = action.payload;
      const newGamesPlayed = state.gamesPlayed + 1;
      const newPlayerScore = result === GAME_RESULTS.WIN ? state.playerScore + 1 : state.playerScore;
      const newComputerScore = result === GAME_RESULTS.LOSE ? state.computerScore + 1 : state.computerScore;
      
      const gameRecord = {
        id: Date.now(),
        playerChoice,
        computerChoice,
        result,
        timestamp: new Date().toISOString()
      };

      return {
        ...state,
        playerChoice,
        computerChoice,
        gameResult: result,
        playerScore: newPlayerScore,
        computerScore: newComputerScore,
        gamesPlayed: newGamesPlayed,
        gameHistory: [gameRecord, ...state.gameHistory].slice(0, 10),
        isLoading: false,
        error: null
      };

    case GAME_ACTIONS.RESET_GAME:
      return {
        ...state,
        playerChoice: null,
        computerChoice: null,
        gameResult: null,
        isLoading: false,
        error: null
      };

    case GAME_ACTIONS.RESET_SCORES:
      return getInitialState();

    case GAME_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null
      };

    case GAME_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    default:
      return state;
  }
};

const determineWinner = (playerChoice, computerChoice) => {
  if (playerChoice === computerChoice) {
    return GAME_RESULTS.TIE;
  }

  const winConditions = {
    [GAME_CHOICES.ROCK]: GAME_CHOICES.SCISSORS,
    [GAME_CHOICES.PAPER]: GAME_CHOICES.ROCK,
    [GAME_CHOICES.SCISSORS]: GAME_CHOICES.PAPER
  };

  return winConditions[playerChoice] === computerChoice 
    ? GAME_RESULTS.WIN 
    : GAME_RESULTS.LOSE;
};

const generateComputerChoice = () => {
  const choices = Object.values(GAME_CHOICES);
  return choices[Math.floor(Math.random() * choices.length)];
};

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const scoreHook = useScores();
  const [state, dispatch] = useReducer(gameReducer, getInitialState(scoreHook.scores));

  const makeMove = async (playerChoice) => {
    try {
      dispatch({ type: GAME_ACTIONS.SET_LOADING, payload: true });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const computerChoice = generateComputerChoice();
      const result = determineWinner(playerChoice, computerChoice);

      dispatch({
        type: GAME_ACTIONS.MAKE_MOVE,
        payload: {
          playerChoice,
          computerChoice,
          result
        }
      });

      scoreHook.addGameResult(result, playerChoice, computerChoice);
    } catch (error) {
      dispatch({
        type: GAME_ACTIONS.SET_ERROR,
        payload: 'Failed to make move. Please try again.'
      });
    }
  };

  const resetGame = () => {
    dispatch({ type: GAME_ACTIONS.RESET_GAME });
  };

  const resetScores = () => {
    dispatch({ type: GAME_ACTIONS.RESET_SCORES });
    scoreHook.resetAll();
  };

  const getWinRate = () => {
    if (state.gamesPlayed === 0) return 0;
    return Math.round((state.playerScore / state.gamesPlayed) * 100);
  };

  useEffect(() => {
    if (scoreHook.scores && (
      state.playerScore !== scoreHook.scores.playerScore ||
      state.computerScore !== scoreHook.scores.computerScore ||
      state.gamesPlayed !== scoreHook.scores.gamesPlayed
    )) {
      scoreHook.updateScores({
        playerScore: state.playerScore,
        computerScore: state.computerScore,
        gamesPlayed: state.gamesPlayed
      });
    }
  }, [state.playerScore, state.computerScore, state.gamesPlayed]);

  const contextValue = {
    ...state,
    makeMove,
    resetGame,
    resetScores,
    getWinRate,
    GAME_CHOICES,
    GAME_RESULTS,
    persistedScores: scoreHook.scores,
    gameHistory: scoreHook.gameHistory,
    gameStats: scoreHook.stats,
    isStorageLoading: scoreHook.isLoading,
    storageError: scoreHook.error
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export { GAME_CHOICES, GAME_RESULTS, GAME_ACTIONS };