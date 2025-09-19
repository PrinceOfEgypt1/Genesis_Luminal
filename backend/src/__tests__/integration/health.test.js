/**
 * Testes de integração para health endpoints
 * Usa app.ts sem inicialização do servidor
 */
import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
describe('Health Endpoints Integration', () => {
    describe('GET /api/liveness', () => {
        it('should return 200 and alive status', async () => {
            const response = await request(app)
                .get('/api/liveness')
                .expect(200);
            expect(response.body).toHaveProperty('status', 'alive');
            expect(response.body).toHaveProperty('timestamp');
        });
    });
    describe('GET /api/readiness', () => {
        it('should return 200 and ready status', async () => {
            const response = await request(app)
                .get('/api/readiness')
                .expect(200);
            expect(response.body).toHaveProperty('status', 'ready');
            expect(response.body).toHaveProperty('timestamp');
        });
    });
    describe('GET /api/status', () => {
        it('should return 200 and detailed status', async () => {
            const response = await request(app)
                .get('/api/status')
                .expect(200);
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('service');
            expect(response.body).toHaveProperty('version');
            expect(response.body).toHaveProperty('environment');
            expect(response.body).toHaveProperty('uptime_seconds');
            expect(response.body).toHaveProperty('memory_mb');
            expect(response.body).toHaveProperty('claude_api_key');
        });
    });
    describe('Concurrent Health Checks', () => {
        it('should handle multiple concurrent requests', async () => {
            const promises = Array(5).fill(null).map(() => request(app).get('/api/liveness'));
            const responses = await Promise.all(promises);
            responses.forEach((response) => {
                expect(response.status).toBe(200);
                expect(response.body.status).toBe('alive');
            });
        });
    });
});
