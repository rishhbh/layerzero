import request from 'supertest';
import app from '../src/app.js';

describe("Health Check", () => {
    test('GET /api/health should return 200', async () => {
      const response = await request(app).get('/api/health');

      expect(response.statusCode).toBe(200);
    });
    
});