import { Router } from 'express';
import { config } from '../config/environment';
const router = Router();
router.get('/liveness', (req, res) => {
    res.json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        service: 'Genesis Luminal Claude' // ✅ Adicionado field service
    });
});
router.get('/readiness', (req, res) => {
    res.json({
        status: 'ready',
        ready: true,
        timestamp: new Date().toISOString()
    });
});
router.get('/status', (req, res) => {
    const memoryUsage = process.memoryUsage(); // ✅ Adicionado memoryUsage
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        uptime_seconds: Math.floor(process.uptime()),
        version: '1.0.0',
        service: 'Genesis Luminal Claude',
        environment: config.NODE_ENV,
        memory_mb: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
        },
        claude_api_key: config.CLAUDE_API_KEY ? 'configured' : 'missing'
    });
});
export default router;
