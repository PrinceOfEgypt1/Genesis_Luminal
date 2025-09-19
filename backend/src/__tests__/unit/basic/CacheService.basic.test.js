import { CacheService } from '../../../services/CacheService';
// Mock Redis simples
jest.mock('redis', () => ({
    createClient: jest.fn(() => ({
        get: jest.fn(),
        setEx: jest.fn(),
        connect: jest.fn().mockResolvedValue(undefined)
    }))
}));
describe('CacheService - Basic Tests', () => {
    let cacheService;
    beforeEach(() => {
        cacheService = new CacheService();
    });
    it('should create cache service instance', () => {
        expect(cacheService).toBeInstanceOf(CacheService);
    });
    it('should have get method', () => {
        expect(typeof cacheService.get).toBe('function');
    });
    it('should have set method', () => {
        expect(typeof cacheService.set).toBe('function');
    });
    it('should handle get call without throwing', async () => {
        const result = await cacheService.get('test-key');
        // Pode retornar null ou qualquer coisa, só não deve dar erro
        expect(result).toBeDefined();
    });
    it('should handle set call with TTL', async () => {
        // Só testa que não dá erro
        await expect(cacheService.set('test', { data: 'test' }, 3600))
            .resolves.not.toThrow();
    });
});
