const { CHOICES, isValidChoice } = require('./gameLogic');

/**
 * Computer player strategies for Rock Paper Scissors game
 */

/**
 * Generates a random move for the computer player
 * @returns {string} A random choice from ['rock', 'paper', 'scissors']
 */
function generateRandomMove() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

/**
 * Generates a move based on player's move history (basic pattern detection)
 * @param {string[]} playerHistory - Array of player's previous moves
 * @returns {string} Computer's strategic choice
 */
function generateStrategicMove(playerHistory = []) {
  if (!Array.isArray(playerHistory) || playerHistory.length === 0) {
    return generateRandomMove();
  }

  // Validate all moves in history
  const validHistory = playerHistory.filter(move => isValidChoice(move));
  if (validHistory.length === 0) {
    return generateRandomMove();
  }

  // Simple counter-strategy: find the most common player move and counter it
  const moveCounts = validHistory.reduce((counts, move) => {
    const normalizedMove = move.toLowerCase();
    counts[normalizedMove] = (counts[normalizedMove] || 0) + 1;
    return counts;
  }, {});

  const mostFrequentMove = Object.keys(moveCounts).reduce((a, b) => 
    moveCounts[a] > moveCounts[b] ? a : b
  );

  // Counter the most frequent move
  const counterMoves = {
    rock: 'paper',
    paper: 'scissors', 
    scissors: 'rock'
  };

  return counterMoves[mostFrequentMove] || generateRandomMove();
}

/**
 * Main computer player interface
 * @param {Object} options - Configuration options
 * @param {string} options.strategy - Strategy to use ('random' or 'strategic')
 * @param {string[]} options.playerHistory - Player's move history for strategic play
 * @param {number} options.difficulty - Difficulty level (0-1, affects strategy randomness)
 * @returns {string} Computer's chosen move
 */
function getComputerMove(options = {}) {
  const {
    strategy = 'random',
    playerHistory = [],
    difficulty = 0.5
  } = options;

  // Validate inputs
  if (typeof strategy !== 'string') {
    throw new Error('Strategy must be a string');
  }

  if (!Array.isArray(playerHistory)) {
    throw new Error('Player history must be an array');
  }

  if (typeof difficulty !== 'number' || difficulty < 0 || difficulty > 1) {
    throw new Error('Difficulty must be a number between 0 and 1');
  }

  switch (strategy.toLowerCase()) {
    case 'random':
      return generateRandomMove();
    
    case 'strategic':
      // Mix strategic and random based on difficulty
      if (Math.random() < difficulty) {
        return generateStrategicMove(playerHistory);
      } else {
        return generateRandomMove();
      }
    
    default:
      throw new Error(`Unknown strategy: ${strategy}. Use 'random' or 'strategic'`);
  }
}

/**
 * Get available strategies
 * @returns {string[]} Array of available strategy names
 */
function getAvailableStrategies() {
  return ['random', 'strategic'];
}

/**
 * Get computer player statistics
 * @param {string[]} moveHistory - History of computer moves
 * @returns {Object} Statistics about computer player behavior
 */
function getComputerStats(moveHistory = []) {
  if (!Array.isArray(moveHistory)) {
    throw new Error('Move history must be an array');
  }

  const validMoves = moveHistory.filter(move => isValidChoice(move));
  const totalMoves = validMoves.length;

  if (totalMoves === 0) {
    return {
      totalMoves: 0,
      distribution: { rock: 0, paper: 0, scissors: 0 },
      percentages: { rock: 0, paper: 0, scissors: 0 }
    };
  }

  const distribution = validMoves.reduce((counts, move) => {
    const normalizedMove = move.toLowerCase();
    counts[normalizedMove] = (counts[normalizedMove] || 0) + 1;
    return counts;
  }, { rock: 0, paper: 0, scissors: 0 });

  const percentages = Object.keys(distribution).reduce((percentages, move) => {
    percentages[move] = Math.round((distribution[move] / totalMoves) * 100);
    return percentages;
  }, {});

  return {
    totalMoves,
    distribution,
    percentages
  };
}

module.exports = {
  generateRandomMove,
  generateStrategicMove,
  getComputerMove,
  getAvailableStrategies,
  getComputerStats
};