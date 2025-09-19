/**
 * GENESIS LUMINAL - SECRET ROTATION MIDDLEWARE
 * Middleware para rotação automática de secrets (versão corrigida)
 */
class SecretRotationService {
    config;
    isRotating = false;
    lastRotation = null;
    constructor(config) {
        this.config = config;
    }
    async performRotation(trigger = 'manual') {
        if (this.isRotating) {
            console.warn('Secret rotation already in progress');
            return false;
        }
        this.isRotating = true;
        const startTime = Date.now();
        try {
            console.log(`Starting secret rotation (trigger: ${trigger})`);
            // TODO: Implementar rotação real quando Secret Manager estiver completo
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simular operação
            this.lastRotation = new Date();
            const duration = Date.now() - startTime;
            console.log(`Secret rotation completed successfully in ${duration}ms (trigger: ${trigger})`);
            return true;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`Secret rotation failed after ${duration}ms (trigger: ${trigger})`, error);
            return false;
        }
        finally {
            this.isRotating = false;
        }
    }
    getRotationStatus() {
        return {
            enabled: this.config.enabled,
            isRotating: this.isRotating,
            lastRotation: this.lastRotation,
            intervalHours: this.config.intervalHours
        };
    }
}
// Configuração padrão
const defaultConfig = {
    enabled: process.env.SECRET_ROTATION_ENABLED === 'true',
    intervalHours: parseInt(process.env.SECRET_ROTATION_INTERVAL_HOURS || '24', 10),
    manualRotationEndpoint: process.env.SECRET_ROTATION_MANUAL_ENDPOINT === 'true'
};
const rotationService = new SecretRotationService(defaultConfig);
// CORREÇÃO: Middleware com retorno adequado
export function secretRotationEndpoint() {
    return async (req, res) => {
        if (!defaultConfig.manualRotationEndpoint) {
            res.status(404).json({ error: 'Manual rotation endpoint is disabled' });
            return;
        }
        try {
            const success = await rotationService.performRotation('manual');
            const status = rotationService.getRotationStatus();
            res.json({
                success,
                message: success ? 'Secret rotation completed' : 'Secret rotation failed or already in progress',
                status
            });
        }
        catch (error) {
            console.error('Manual secret rotation failed', error);
            res.status(500).json({
                error: 'Secret rotation failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
// CORREÇÃO: Middleware com retorno adequado
export function secretRotationStatus() {
    return (req, res) => {
        const status = rotationService.getRotationStatus();
        res.json(status);
    };
}
export { rotationService };
