const express = require('express');
const router = express.Router();

// Game choices
const CHOICES = ['rock', 'paper', 'scissors'];

// Game logic
const getGameResult = (playerChoice, computerChoice) => {
  if (playerChoice === computerChoice) {
    return 'tie';
  }
  
  const winConditions = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };
  
  return winConditions[playerChoice] === computerChoice ? 'win' : 'lose';
};

// Generate random computer choice
const getComputerChoice = () => {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
};

// Validation middleware
const validateGameChoice = (req, res, next) => {
  const { choice } = req.body;
  
  if (!choice) {
    return res.status(400).json({
      error: 'Choice is required',
      validChoices: CHOICES
    });
  }
  
  if (!CHOICES.includes(choice.toLowerCase())) {
    return res.status(400).json({
      error: 'Invalid choice',
      validChoices: CHOICES,
      received: choice
    });
  }
  
  req.body.choice = choice.toLowerCase();
  next();
};

// GET /api/game/choices - Get available game choices
router.get('/choices', (req, res) => {
  res.json({
    choices: CHOICES,
    rules: {
      rock: 'crushes scissors',
      paper: 'covers rock',
      scissors: 'cuts paper'
    }
  });
});

// POST /api/game/play - Play a round
router.post('/play', validateGameChoice, (req, res) => {
  try {
    const playerChoice = req.body.choice;
    const computerChoice = getComputerChoice();
    const result = getGameResult(playerChoice, computerChoice);
    
    const response = {
      playerChoice,
      computerChoice,
      result,
      timestamp: new Date().toISOString(),
      roundId: `round_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Game play error:', error);
    res.status(500).json({
      error: 'Failed to process game round'
    });
  }
});

// GET /api/game/stats - Get game statistics (placeholder)
router.get('/stats', (req, res) => {
  // In a real implementation, this would fetch from a database
  res.json({
    message: 'Statistics endpoint - to be implemented with database',
    totalGames: 0,
    wins: 0,
    losses: 0,
    ties: 0
  });
});

module.exports = router;