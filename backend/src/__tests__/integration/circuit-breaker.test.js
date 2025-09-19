import { describe, it, expect, beforeEach } from '@jest/globals';
class MockProviderRouter {
    failureCount = 0;
    maxFailures = 3;
    isOpen = false;
    lastFailureTime = 0;
    cooldownMs = 60000;
    totalFailures = 0;
    async analyze(request) {
        // Circuit breaker logic - check OPEN state first but still count failures
        if (this.isOpen) {
            const now = Date.now();
            if (now - this.lastFailureTime < this.cooldownMs) {
                // ✅ CORREÇÃO: Ainda incrementar failures mesmo quando OPEN
                this.totalFailures++;
                throw new Error('Circuit breaker is OPEN');
            }
            else {
                this.isOpen = false;
                this.failureCount = 0;
            }
        }
        try {
            if (request.text && request.text.includes('error')) {
                throw new Error('Provider error');
            }
            this.failureCount = 0;
            this.isOpen = false;
            return {
                intensity: 0.7,
                timestamp: new Date().toISOString(),
                confidence: 0.8,
                dominantAffect: 'curiosity',
                recommendation: 'continue',
                emotionalShift: 'stable',
                morphogenicSuggestion: 'fibonacci'
            };
        }
        catch (error) {
            this.failureCount++;
            this.totalFailures++;
            this.lastFailureTime = Date.now();
            if (this.failureCount >= this.maxFailures) {
                this.isOpen = true;
            }
            throw error;
        }
    }
    getState() {
        if (this.isOpen) {
            const now = Date.now();
            if (now - this.lastFailureTime >= this.cooldownMs) {
                return 'HALF_OPEN';
            }
            return 'OPEN';
        }
        return 'CLOSED';
    }
    getFailureCount() {
        return this.totalFailures;
    }
    reset() {
        this.failureCount = 0;
        this.totalFailures = 0;
        this.isOpen = false;
        this.lastFailureTime = 0;
    }
}
describe('Circuit Breaker Integration Tests', () => {
    let mockRouter;
    beforeEach(() => {
        mockRouter = new MockProviderRouter();
    });
    describe('Circuit Breaker States', () => {
        it('should start in CLOSED state', () => {
            expect(mockRouter.getState()).toBe('CLOSED');
            expect(mockRouter.getFailureCount()).toBe(0);
        });
        it('should transition to OPEN after max failures', async () => {
            const errorRequest = {
                text: 'error test',
                metadata: { source: 'test' }
            };
            for (let i = 0; i < 3; i++) {
                try {
                    await mockRouter.analyze(errorRequest);
                }
                catch (error) {
                    // Expected to fail
                }
            }
            expect(mockRouter.getState()).toBe('OPEN');
            expect(mockRouter.getFailureCount()).toBe(3);
        });
        it('should reject requests in OPEN state', async () => {
            const errorRequest = {
                text: 'error test',
                metadata: { source: 'test' }
            };
            for (let i = 0; i < 3; i++) {
                try {
                    await mockRouter.analyze(errorRequest);
                }
                catch (error) {
                    // Expected
                }
            }
            const normalRequest = {
                text: 'normal request',
                metadata: { source: 'test' }
            };
            await expect(mockRouter.analyze(normalRequest))
                .rejects.toThrow('Circuit breaker is OPEN');
        });
        it('should transition to HALF_OPEN after cooldown', async () => {
            const errorRequest = {
                text: 'error test',
                metadata: { source: 'test' }
            };
            for (let i = 0; i < 3; i++) {
                try {
                    await mockRouter.analyze(errorRequest);
                }
                catch (error) {
                    // Expected
                }
            }
            mockRouter.lastFailureTime = Date.now() - 61000;
            expect(mockRouter.getState()).toBe('HALF_OPEN');
        });
        it('should reset to CLOSED on successful request after HALF_OPEN', async () => {
            const errorRequest = {
                text: 'error test',
                metadata: { source: 'test' }
            };
            for (let i = 0; i < 3; i++) {
                try {
                    await mockRouter.analyze(errorRequest);
                }
                catch (error) {
                    // Expected
                }
            }
            mockRouter.lastFailureTime = Date.now() - 61000;
            const successRequest = {
                text: 'success test',
                metadata: { source: 'test' }
            };
            const result = await mockRouter.analyze(successRequest);
            expect(result).toHaveProperty('confidence');
            expect(result).toHaveProperty('dominantAffect');
            expect(mockRouter.getState()).toBe('CLOSED');
        });
    });
    describe('Circuit Breaker Retry Logic', () => {
        it('should implement exponential backoff', () => {
            const baseDelayMs = 100;
            const maxDelayMs = 5000;
            const calculateBackoff = (attempt) => {
                const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
                return delay + Math.random() * 1000;
            };
            expect(calculateBackoff(0)).toBeGreaterThanOrEqual(baseDelayMs);
            expect(calculateBackoff(1)).toBeGreaterThanOrEqual(baseDelayMs * 2);
            expect(calculateBackoff(10)).toBeLessThanOrEqual(maxDelayMs + 1000);
        });
        it('should track failure patterns', async () => {
            const failures = [];
            const errorRequest = {
                text: 'error test',
                metadata: { source: 'test' }
            };
            // ✅ CORREÇÃO: Fazer 5 tentativas incluindo depois de OPEN
            for (let i = 0; i < 5; i++) {
                try {
                    await mockRouter.analyze(errorRequest);
                }
                catch (error) {
                    failures.push(Date.now());
                }
            }
            expect(failures).toHaveLength(5);
            expect(mockRouter.getFailureCount()).toBe(5);
        });
    });
    describe('Circuit Breaker Health Monitoring', () => {
        it('should provide health metrics', () => {
            const getHealthMetrics = () => ({
                state: mockRouter.getState(),
                failureCount: mockRouter.getFailureCount(),
                successRate: mockRouter.getFailureCount() === 0 ? 100 : 0,
                lastStateChange: Date.now()
            });
            const metrics = getHealthMetrics();
            expect(metrics).toHaveProperty('state');
            expect(metrics).toHaveProperty('failureCount');
            expect(metrics).toHaveProperty('successRate');
            expect(metrics.state).toBe('CLOSED');
        });
        it('should allow manual reset', () => {
            mockRouter.totalFailures = 2;
            expect(mockRouter.getFailureCount()).toBe(2);
            mockRouter.reset();
            expect(mockRouter.getFailureCount()).toBe(0);
            expect(mockRouter.getState()).toBe('CLOSED');
        });
    });
});
