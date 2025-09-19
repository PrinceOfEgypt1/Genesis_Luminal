import request from 'supertest';
import app from '../../app';
import { config } from '../../config/environment';
describe('API Routes Integration Tests', () => {
    describe('Health Endpoints', () => {
        it('GET /api/liveness should return basic health status', async () => {
            const response = await request(app)
                .get('/api/liveness')
                .expect(200);
            expect(response.body).toHaveProperty('status', 'alive');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('service');
        });
        it('GET /api/readiness should return readiness status', async () => {
            const response = await request(app)
                .get('/api/readiness')
                .expect(200);
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('ready');
            expect(response.body).toHaveProperty('timestamp');
            expect(typeof response.body.ready).toBe('boolean');
        });
        it('GET /api/status should return detailed status', async () => {
            const response = await request(app)
                .get('/api/status')
                .expect(200);
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime'); // This field should now be present
            expect(response.body).toHaveProperty('version');
        });
    });
    describe('Emotional Analysis API', () => {
        it('POST /api/emotional/analyze should process emotional state', async () => {
            const requestData = {
                text: 'I am feeling curious about the universe',
                metadata: { source: 'test' }
            };
            const response = await request(app)
                .post('/api/emotional/analyze')
                .send(requestData)
                .expect(200);
            expect(response.body).toHaveProperty('intensity');
            expect(response.body).toHaveProperty('confidence');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('dominantAffect'); // This should now be present
            expect(response.body).toHaveProperty('recommendation');
            expect(response.body).toHaveProperty('emotionalShift');
            expect(response.body).toHaveProperty('morphogenicSuggestion');
        });
        it('POST /api/emotional/analyze should accept currentState', async () => {
            const requestData = {
                currentState: {
                    joy: 0.7,
                    curiosity: 0.8,
                    serenity: 0.5
                },
                metadata: { source: 'test' }
            };
            const response = await request(app)
                .post('/api/emotional/analyze')
                .send(requestData)
                .expect(200);
            expect(response.body).toHaveProperty('dominantAffect');
            expect(response.body).toHaveProperty('recommendation');
        });
        it('POST /api/emotional/analyze should validate required fields', async () => {
            const response = await request(app)
                .post('/api/emotional/analyze')
                .send({})
                .expect(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Missing required data');
        });
        it('POST /api/emotional/analyze should handle malformed JSON', async () => {
            const response = await request(app)
                .post('/api/emotional/analyze')
                .set('Content-Type', 'application/json')
                .send('{"invalid": json}')
                .expect(400);
            expect(response.body).toHaveProperty('error'); // Error should now be present
        });
    });
    describe('Error Handling', () => {
        it('should return 404 for unknown routes', async () => {
            const response = await request(app)
                .get('/api/unknown/route')
                .expect(404);
            expect(response.body).toHaveProperty('error'); // Error should now be present
        });
        it('should handle invalid HTTP methods', async () => {
            const response = await request(app)
                .patch('/api/emotional/analyze')
                .expect(404); // Will be 404 since route doesn't exist for PATCH
            // Note: Since we don't have specific method handlers, this will return 404
            // In a real application, you'd implement proper method handling
        });
        it('should validate Content-Type headers', async () => {
            const response = await request(app)
                .post('/api/emotional/analyze')
                .set('Content-Type', 'text/plain')
                .send('plain text payload')
                .expect(415); // Should now return 415
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('Security Headers', () => {
        it('should include security headers in responses', async () => {
            const response = await request(app)
                .get('/api/status')
                .expect(200);
            // Verificar headers de segurança (Helmet)
            expect(response.headers).toHaveProperty('x-frame-options');
            expect(response.headers).toHaveProperty('x-content-type-options');
            expect(response.headers).toHaveProperty('x-xss-protection');
        });
        it('should handle CORS properly', async () => {
            const response = await request(app)
                .get('/api/status')
                .set('Origin', config.FRONTEND_URL);
            expect(response.headers['access-control-allow-origin']).toBe(config.FRONTEND_URL);
        });
    });
});
