import { Router } from 'express';
import claudeService from '../services/ClaudeService';
import { logger } from '../utils/logger';
const router = Router();
const sanitizeEmotionalInput = (req, res, next) => {
    try {
        const { text, currentState, metadata } = req.body;
        if (text && typeof text === 'string') {
            req.body.text = text.slice(0, 10000);
        }
        if (currentState && typeof currentState === 'object') {
            const allowedKeys = ['joy', 'curiosity', 'serenity', 'nostalgia', 'ecstasy', 'mystery', 'power'];
            const sanitized = {};
            for (const key of allowedKeys) {
                if (typeof currentState[key] === 'number' && !isNaN(currentState[key])) {
                    sanitized[key] = Math.max(0, Math.min(1, currentState[key]));
                }
            }
            req.body.currentState = Object.keys(sanitized).length > 0 ? sanitized : undefined;
        }
        next();
    }
    catch (error) {
        logger.error('Error sanitizing emotional input:', error);
        res.status(400).json({
            error: 'Invalid request format',
            message: 'Request body contains invalid data'
        });
    }
};
router.post('/analyze', sanitizeEmotionalInput, async (req, res) => {
    try {
        const request = req.body;
        if (!request.text && !request.currentState) {
            res.status(400).json({
                error: 'Missing required data',
                message: 'Request must contain either text or currentState'
            });
            return;
        }
        const result = await claudeService.analyzeEmotionalState(request);
        const validRecommendations = ['continue', 'pause', 'intensify', 'explore', 'transcend'];
        const safeRecommendation = result.recommendation && validRecommendations.includes(result.recommendation)
            ? result.recommendation
            : 'continue';
        const response = {
            ...result,
            dominantAffect: result.dominantAffect || 'curiosity',
            recommendation: safeRecommendation
        };
        res.json(response);
    }
    catch (error) {
        logger.error('Emotional analysis error:', error);
        res.status(500).json({
            error: 'Analysis failed',
            message: 'Unable to process emotional analysis request'
        });
    }
});
export default router;
