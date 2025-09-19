import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { recordHttpRequest } from '../observability/metrics.js';

interface MonitoredRequest extends Request {
  startTime: number;
  correlationId: string;
}

export function monitoringMiddleware(req: MonitoredRequest, res: Response, next: NextFunction) {
  req.startTime = Date.now();
  req.correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  
  res.setHeader('x-correlation-id', req.correlationId);
  
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const route = req.route?.path || req.path;
    recordHttpRequest(req.method, route, res.statusCode, duration);
  });
  
  next();
}
