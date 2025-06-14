const request = require('supertest');
const app = require('../server');

describe('Game API', () => {
  describe('GET /api/game/choices', () => {
    test('should return available game choices', async () => {
      const response = await request(app)
        .get('/api/game/choices')
        .expect(200);
      
      expect(response.body).toHaveProperty('choices');
      expect(response.body.choices).toEqual(['rock', 'paper', 'scissors']);
      expect(response.body).toHaveProperty('rules');
      expect(response.body.rules).toHaveProperty('rock', 'crushes scissors');
      expect(response.body.rules).toHaveProperty('paper', 'covers rock');
      expect(response.body.rules).toHaveProperty('scissors', 'cuts paper');
    });
  });

  describe('POST /api/game/play', () => {
    test('should play a game with valid choice', async () => {
      const response = await request(app)
        .post('/api/game/play')
        .send({ choice: 'rock' })
        .expect(200);
      
      expect(response.body).toHaveProperty('playerChoice', 'rock');
      expect(response.body).toHaveProperty('computerChoice');
      expect(['rock', 'paper', 'scissors']).toContain(response.body.computerChoice);
      expect(response.body).toHaveProperty('result');
      expect(['win', 'lose', 'tie']).toContain(response.body.result);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('roundId');
    });

    test('should handle case insensitive choices', async () => {
      const response = await request(app)
        .post('/api/game/play')
        .send({ choice: 'ROCK' })
        .expect(200);
      
      expect(response.body.playerChoice).toBe('rock');
    });

    test('should return error for invalid choice', async () => {
      const response = await request(app)
        .post('/api/game/play')
        .send({ choice: 'invalid' })
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Invalid choice');
      expect(response.body).toHaveProperty('validChoices');
      expect(response.body).toHaveProperty('received', 'invalid');
    });

    test('should return error for missing choice', async () => {
      const response = await request(app)
        .post('/api/game/play')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Choice is required');
      expect(response.body).toHaveProperty('validChoices');
    });

    describe('Game Logic', () => {
      test('rock should beat scissors', async () => {
        // We need to test game logic deterministically
        // This is a bit tricky with random computer choice, so we'll test multiple times
        const results = [];
        for (let i = 0; i < 20; i++) {
          const response = await request(app)
            .post('/api/game/play')
            .send({ choice: 'rock' });
          
          if (response.body.computerChoice === 'scissors') {
            results.push(response.body.result);
          }
        }
        
        // If we found any rock vs scissors games, they should all be wins
        if (results.length > 0) {
          expect(results.every(result => result === 'win')).toBe(true);
        }
      });

      test('should result in tie when choices are equal', async () => {
        // Test multiple times to increase chance of getting a tie
        const results = [];
        for (let i = 0; i < 30; i++) {
          const response = await request(app)
            .post('/api/game/play')
            .send({ choice: 'rock' });
          
          if (response.body.computerChoice === 'rock') {
            results.push(response.body.result);
          }
        }
        
        // If we found any matching choices, they should all be ties
        if (results.length > 0) {
          expect(results.every(result => result === 'tie')).toBe(true);
        }
      });
    });
  });

  describe('GET /api/game/stats', () => {
    test('should return stats placeholder', async () => {
      const response = await request(app)
        .get('/api/game/stats')
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('totalGames', 0);
      expect(response.body).toHaveProperty('wins', 0);
      expect(response.body).toHaveProperty('losses', 0);
      expect(response.body).toHaveProperty('ties', 0);
    });
  });
});