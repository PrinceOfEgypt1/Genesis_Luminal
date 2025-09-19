import { CacheService } from '../../services/CacheService';
const mockRedisClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    setEx: jest.fn(),
    disconnect: jest.fn()
};
jest.mock('redis', () => ({
    createClient: jest.fn(() => mockRedisClient)
}));
describe('Cache Integration Tests Fixed', () => {
    let cacheService;
    beforeEach(() => {
        jest.clearAllMocks();
        cacheService = new CacheService();
        cacheService.connected = true;
        cacheService.client = mockRedisClient;
    });
    it('should store and retrieve data from cache', async () => {
        const testData = { test: 'data' };
        mockRedisClient.setEx.mockResolvedValue('OK');
        mockRedisClient.get.mockResolvedValue(JSON.stringify(testData));
        await cacheService.set('test:key', testData, 300);
        const result = await cacheService.get('test:key');
        expect(mockRedisClient.setEx).toHaveBeenCalled();
        expect(result).toEqual(testData);
    });
    it('should handle cache miss', async () => {
        mockRedisClient.get.mockResolvedValue(null);
        const result = await cacheService.get('missing:key');
        expect(result).toBeNull();
    });
});
