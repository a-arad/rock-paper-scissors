const request = require('supertest');
const app = require('../server');

describe('Rock Paper Scissors API', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        message: 'Server is running'
      });
    });
  });

  describe('GET /api/', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Rock Paper Scissors API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /api/game/choices', () => {
    it('should return available choices and rules', async () => {
      const response = await request(app)
        .get('/api/game/choices')
        .expect(200);

      expect(response.body).toHaveProperty('choices');
      expect(response.body.choices).toEqual(['rock', 'paper', 'scissors']);
      expect(response.body).toHaveProperty('rules');
    });
  });

  describe('POST /api/game/play', () => {
    it('should play a game with valid choice', async () => {
      const response = await request(app)
        .post('/api/game/play')
        .send({ playerChoice: 'rock' })
        .expect(200);

      expect(response.body).toHaveProperty('playerChoice', 'rock');
      expect(response.body).toHaveProperty('computerChoice');
      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('message');
      expect(['rock', 'paper', 'scissors']).toContain(response.body.computerChoice);
      expect(['win', 'lose', 'tie']).toContain(response.body.result);
    });

    it('should accept case-insensitive choices', async () => {
      const response = await request(app)
        .post('/api/game/play')
        .send({ playerChoice: 'ROCK' })
        .expect(200);

      expect(response.body.playerChoice).toBe('rock');
    });

    it('should return error for invalid choice', async () => {
      const response = await request(app)
        .post('/api/game/play')
        .send({ playerChoice: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid choice');
    });

    it('should return error for missing choice', async () => {
      const response = await request(app)
        .post('/api/game/play')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid choice');
    });

    it('should determine correct winner for rock vs scissors', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.8); // This will select 'scissors'
      
      const response = await request(app)
        .post('/api/game/play')
        .send({ playerChoice: 'rock' })
        .expect(200);

      expect(response.body.playerChoice).toBe('rock');
      expect(response.body.computerChoice).toBe('scissors');
      expect(response.body.result).toBe('win');
      
      Math.random.mockRestore();
    });

    it('should determine correct winner for paper vs rock', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // This will select 'rock'
      
      const response = await request(app)
        .post('/api/game/play')
        .send({ playerChoice: 'paper' })
        .expect(200);

      expect(response.body.playerChoice).toBe('paper');
      expect(response.body.computerChoice).toBe('rock');
      expect(response.body.result).toBe('win');
      
      Math.random.mockRestore();
    });

    it('should determine tie when choices are same', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // This will select 'rock'
      
      const response = await request(app)
        .post('/api/game/play')
        .send({ playerChoice: 'rock' })
        .expect(200);

      expect(response.body.playerChoice).toBe('rock');
      expect(response.body.computerChoice).toBe('rock');
      expect(response.body.result).toBe('tie');
      
      Math.random.mockRestore();
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});