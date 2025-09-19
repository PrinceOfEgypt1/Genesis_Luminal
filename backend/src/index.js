import express from 'express';
import { register, Counter, collectDefaultMetrics } from 'prom-client';
const app = express();
const PORT = 3001;
// Métricas básicas
collectDefaultMetrics();
const httpRequests = new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'path']
});
// Middleware básico
app.use(express.json());
app.use((req, res, next) => {
    httpRequests.inc({ method: req.method, path: req.path });
    next();
});
// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
});
app.get('/api/observability/status', (req, res) => {
    res.json({
        service: 'genesis-luminal',
        observability: true,
        timestamp: new Date().toISOString()
    });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log(`Metrics: http://localhost:${PORT}/metrics`);
});
