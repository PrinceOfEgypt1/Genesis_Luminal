import { AnthropicProvider } from '../../../providers/AnthropicProvider';
// Mock fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch;
describe('AnthropicProvider - Basic Tests', () => {
    let provider;
    beforeEach(() => {
        provider = new AnthropicProvider();
        jest.clearAllMocks();
    });
    it('should create provider instance', () => {
        expect(provider).toBeInstanceOf(AnthropicProvider);
    });
    it('should have analyze method', () => {
        expect(typeof provider.analyze).toBe('function');
    });
    it('should handle basic analyze call with mocked fetch', async () => {
        // Mock fetch response
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                content: [{
                        text: JSON.stringify({
                            intensity: 0.7,
                            dominantAffect: 'joy',
                            confidence: 0.8,
                            recommendation: 'continue',
                            emotionalShift: 'positive',
                            morphogenicSuggestion: 'spiral'
                        })
                    }]
            })
        });
        const mockRequest = {
            currentState: {
                joy: 0.8,
                nostalgia: 0.2,
                curiosity: 0.7,
                serenity: 0.4,
                ecstasy: 0.1,
                mystery: 0.3,
                power: 0.5
            },
            mousePosition: { x: 100, y: 100 },
            sessionDuration: 1000
        };
        const result = await provider.analyze(mockRequest);
        // Verificar que retorna algo válido
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    it('should handle API errors gracefully', async () => {
        // Mock fetch error
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
        });
        const mockRequest = {
            currentState: {
                joy: 0.5,
                nostalgia: 0.5,
                curiosity: 0.5,
                serenity: 0.5,
                ecstasy: 0.5,
                mystery: 0.5,
                power: 0.5
            },
            mousePosition: { x: 100, y: 100 },
            sessionDuration: 1000
        };
        // Should throw error for API failure
        await expect(provider.analyze(mockRequest)).rejects.toThrow();
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    it('should handle network errors', async () => {
        // Mock network error
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        const mockRequest = {
            currentState: {
                joy: 0.3,
                nostalgia: 0.3,
                curiosity: 0.3,
                serenity: 0.3,
                ecstasy: 0.3,
                mystery: 0.3,
                power: 0.3
            },
            mousePosition: { x: 50, y: 50 },
            sessionDuration: 500
        };
        // Should throw error for network failure
        await expect(provider.analyze(mockRequest)).rejects.toThrow();
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });
});
