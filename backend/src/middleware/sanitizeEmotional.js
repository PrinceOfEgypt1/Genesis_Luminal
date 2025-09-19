const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const str = (v, d = '') => (typeof v === 'string' && v.length ? v : d);
export function sanitizeEmotional(req, _res, next) {
    const b = req.body ?? {};
    const dna = b.currentState ?? {};
    const mouse = b.mousePosition ?? {};
    // Normaliza shape mínimo esperado pelo backend
    req.body = {
        currentState: {
            // canais básicos (se não existirem, assume 0)
            joy: num(dna.joy, 0),
            sadness: num(dna.sadness, 0),
            anger: num(dna.anger, 0),
            fear: num(dna.fear, 0),
            surprise: num(dna.surprise, 0),
            disgust: num(dna.disgust, 0),
            // espaço afetivo
            valence: num(dna.valence, 0),
            arousal: num(dna.arousal, 0),
            // agregados comuns
            dominantAffect: str(dna.dominantAffect, 'neutral'),
            intensity: num(dna.intensity, 0.5),
        },
        mousePosition: {
            x: num(mouse.x, 0),
            y: num(mouse.y, 0),
        },
        sessionDuration: num(b.sessionDuration, 0),
        userId: typeof b.userId === 'string' ? b.userId : undefined,
    };
    next();
}
