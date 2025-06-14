const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'Rock Paper Scissors API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      game: '/api/game',
      status: '/api/'
    }
  });
});

router.post('/game/play', (req, res) => {
  const { playerChoice } = req.body;
  
  if (!playerChoice || !['rock', 'paper', 'scissors'].includes(playerChoice.toLowerCase())) {
    return res.status(400).json({ 
      error: 'Invalid choice. Please choose rock, paper, or scissors.' 
    });
  }

  const choices = ['rock', 'paper', 'scissors'];
  const computerChoice = choices[Math.floor(Math.random() * choices.length)];
  
  let result;
  const player = playerChoice.toLowerCase();
  
  if (player === computerChoice) {
    result = 'tie';
  } else if (
    (player === 'rock' && computerChoice === 'scissors') ||
    (player === 'paper' && computerChoice === 'rock') ||
    (player === 'scissors' && computerChoice === 'paper')
  ) {
    result = 'win';
  } else {
    result = 'lose';
  }

  res.json({
    playerChoice: player,
    computerChoice,
    result,
    message: `You ${result === 'tie' ? 'tied' : result}!`
  });
});

router.get('/game/choices', (req, res) => {
  res.json({
    choices: ['rock', 'paper', 'scissors'],
    rules: {
      rock: 'beats scissors',
      paper: 'beats rock',
      scissors: 'beats paper'
    }
  });
});

module.exports = router;