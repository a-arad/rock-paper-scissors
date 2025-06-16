const express = require('express');
const router = express.Router();

const CHOICES = ['rock', 'paper', 'scissors'];

function determineWinner(playerChoice, computerChoice) {
  if (playerChoice === computerChoice) {
    return 'tie';
  }
  
  const winConditions = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };
  
  return winConditions[playerChoice] === computerChoice ? 'win' : 'lose';
}

function getComputerChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

router.post('/play', (req, res) => {
  try {
    const { choice } = req.body;
    
    if (!choice || !CHOICES.includes(choice.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Invalid choice. Must be rock, paper, or scissors.' 
      });
    }
    
    const playerChoice = choice.toLowerCase();
    const computerChoice = getComputerChoice();
    const result = determineWinner(playerChoice, computerChoice);
    
    res.json({
      playerChoice,
      computerChoice,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /play route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/choices', (req, res) => {
  res.json({ choices: CHOICES });
});

module.exports = router;