import { Router } from 'express';
const router = Router();
// Root endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'Genesis Luminal Claude API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});
export default router;
