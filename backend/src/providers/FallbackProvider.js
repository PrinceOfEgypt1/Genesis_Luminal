export class FallbackProvider {
    name = 'fallback';
    async analyze(_input) {
        const now = new Date().toISOString();
        return {
            intensity: 0.5,
            timestamp: now,
            confidence: 0.5,
            recommendation: 'continue',
            emotionalShift: 'stable',
            morphogenicSuggestion: 'fibonacci',
        };
    }
}
