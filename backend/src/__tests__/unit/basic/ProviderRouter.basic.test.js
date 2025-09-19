import { ProviderRouter } from '../../../providers/ProviderRouter';
describe('ProviderRouter - Basic Tests', () => {
    let router;
    beforeEach(() => {
        router = new ProviderRouter();
    });
    it('should create router instance', () => {
        expect(router).toBeInstanceOf(ProviderRouter);
    });
    it('should have analyze method', () => {
        expect(typeof router.analyze).toBe('function');
    });
    it('should handle basic analyze call', async () => {
        const mockRequest = {
            currentState: {
                joy: 0.6,
                nostalgia: 0.3,
                curiosity: 0.8,
                serenity: 0.2,
                ecstasy: 0.1,
                mystery: 0.4,
                power: 0.7
            },
            mousePosition: { x: 200, y: 150 },
            sessionDuration: 2000
        };
        const result = await router.analyze(mockRequest);
        // Só testa que retorna algo válido
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
    });
});
