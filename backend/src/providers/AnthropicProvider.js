import { apiKey } from '../config/env';
function extractText(input) {
    const i = input;
    const raw = i?.text ?? i?.message ?? i?.prompt ?? '';
    return (typeof raw === 'string' ? raw : String(raw ?? '')).trim();
}
export class AnthropicProvider {
    name = 'anthropic';
    async analyze(input) {
        const key = apiKey();
        if (!key) {
            const err = new Error('MISSING_API_KEY');
            err.code = 'MISSING_API_KEY';
            throw err;
        }
        const text = extractText(input);
        const body = {
            model: 'claude-3-5-sonnet-latest',
            max_tokens: 256,
            messages: [{ role: 'user', content: `Analise o estado emocional do texto: "${text}"` }],
        };
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': key,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            const err = new Error(`${res.status} ${res.statusText}`);
            err.code = (data?.error?.type) || `HTTP_${res.status}`;
            err.details = data;
            throw err;
        }
        // TODO: mapear a resposta real do Claude -> EmotionalAnalysisResponse
        // Por ora, resposta canônica mínima (campos opcionais omitidos quando incompatíveis).
        const now = new Date().toISOString();
        return {
            intensity: 0.5,
            timestamp: now,
            confidence: 0.6,
            recommendation: 'continue',
            emotionalShift: 'stable',
            morphogenicSuggestion: 'fibonacci',
        };
    }
}
