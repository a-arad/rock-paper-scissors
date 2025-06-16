const express = require('express');
const { 
  getValidChoices, 
  isValidChoice, 
  playGame 
} = require('../src/gameLogic');

const router = express.Router();

router.post('/play', (req, res) => {
  try {
    const { choice } = req.body;
    
    if (!choice || !isValidChoice(choice)) {
      return res.status(400).json({ 
        error: 'Invalid choice. Must be rock, paper, or scissors.' 
      });
    }
    
    const gameResult = playGame(choice);
    res.json(gameResult);
  } catch (error) {
    console.error('Error in /play route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/choices', (req, res) => {
  res.json({ choices: getValidChoices() });
});

module.exports = router;