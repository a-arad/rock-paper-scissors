const request = require('supertest');
const app = require('../server');

describe('Server', () => {
  describe('Health Check', () => {
    test('GET /api/health should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'rock-paper-scissors-backend');
    });
  });

  describe('Game Routes', () => {
    test('GET /api/game/choices should return available choices', async () => {
      const response = await request(app)
        .get('/api/game/choices')
        .expect(200);
      
      expect(response.body).toHaveProperty('choices');
      expect(response.body.choices).toEqual(['rock', 'paper', 'scissors']);
    });

    test('POST /api/game/play with valid choice should return game result', async () => {
      const response = await request(app)
        .post('/api/game/play')
        .send({ choice: 'rock' })
        .expect(200);
      
      expect(response.body).toHaveProperty('playerChoice', 'rock');
      expect(response.body).toHaveProperty('computerChoice');
      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('timestamp');
      expect(['rock', 'paper', 'scissors']).toContain(response.body.computerChoice);
      expect(['win', 'lose', 'tie']).toContain(response.body.result);
    });

    test('POST /api/game/play with invalid choice should return error', async () => {
      const response = await request(app)
        .post('/api/game/play')
        .send({ choice: 'invalid' })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid choice');
    });

    test('POST /api/game/play without choice should return error', async () => {
      const response = await request(app)
        .post('/api/game/play')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid choice');
    });

    test('Game logic should work correctly', async () => {
      const rockResponse = await request(app)
        .post('/api/game/play')
        .send({ choice: 'rock' });

      expect(rockResponse.body.playerChoice).toBe('rock');
      
      if (rockResponse.body.computerChoice === 'rock') {
        expect(rockResponse.body.result).toBe('tie');
      } else if (rockResponse.body.computerChoice === 'scissors') {
        expect(rockResponse.body.result).toBe('win');
      } else if (rockResponse.body.computerChoice === 'paper') {
        expect(rockResponse.body.result).toBe('lose');
      }
    });
  });

  describe('Error Handling', () => {
    test('GET /api/nonexistent should return 404', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });

  describe('CORS Headers', () => {
    test('Should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});