const CHOICES = ['rock', 'paper', 'scissors'];

const WIN_CONDITIONS = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper'
};

function isValidChoice(choice) {
  if (!choice || typeof choice !== 'string') {
    return false;
  }
  return CHOICES.includes(choice.toLowerCase());
}

function normalizeChoice(choice) {
  if (!choice || typeof choice !== 'string') {
    throw new Error('Choice must be a non-empty string');
  }
  return choice.toLowerCase();
}

function determineWinner(playerChoice, computerChoice) {
  if (!isValidChoice(playerChoice)) {
    throw new Error(`Invalid player choice: ${playerChoice}. Must be one of: ${CHOICES.join(', ')}`);
  }
  
  if (!isValidChoice(computerChoice)) {
    throw new Error(`Invalid computer choice: ${computerChoice}. Must be one of: ${CHOICES.join(', ')}`);
  }

  const normalizedPlayerChoice = normalizeChoice(playerChoice);
  const normalizedComputerChoice = normalizeChoice(computerChoice);

  if (normalizedPlayerChoice === normalizedComputerChoice) {
    return 'tie';
  }

  return WIN_CONDITIONS[normalizedPlayerChoice] === normalizedComputerChoice ? 'win' : 'lose';
}

function getComputerChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

function getValidChoices() {
  return [...CHOICES];
}

function playGame(playerChoice) {
  if (!isValidChoice(playerChoice)) {
    throw new Error(`Invalid choice: ${playerChoice}. Must be one of: ${CHOICES.join(', ')}`);
  }

  const normalizedPlayerChoice = normalizeChoice(playerChoice);
  const computerChoice = getComputerChoice();
  const result = determineWinner(normalizedPlayerChoice, computerChoice);

  return {
    playerChoice: normalizedPlayerChoice,
    computerChoice,
    result,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  CHOICES,
  WIN_CONDITIONS,
  isValidChoice,
  normalizeChoice,
  determineWinner,
  getComputerChoice,
  getValidChoices,
  playGame
};