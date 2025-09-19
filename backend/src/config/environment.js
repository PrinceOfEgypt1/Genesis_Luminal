/**
 * GENESIS LUMINAL - ENVIRONMENT CONFIGURATION
 * Versão CORRIGIDA - Inicialização segura + REDIS_URL
 * PRESERVA TODAS AS FUNCIONALIDADES EXISTENTES
 */
import { getSecretManager } from './secretManager';
class ConfigService {
    static instance;
    configCache = {};
    isLoaded = false;
    constructor() { }
    static getInstance() {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }
    async getSecret(key, fallbackEnvKey) {
        try {
            console.log(`🔍 Looking up secret: ${key}`);
            // Primeiro tentar do Secret Manager
            const secretManager = getSecretManager();
            const secretValue = await secretManager.getSecret(key);
            if (secretValue) {
                console.log(`✅ Secret loaded from Secret Manager: ${key}`);
                return secretValue;
            }
            // Fallback para variável de ambiente
            const envKey = fallbackEnvKey || key;
            const envValue = process.env[envKey];
            if (envValue) {
                console.warn(`⚠️ Secret loaded from environment (fallback): ${envKey}`);
                return envValue;
            }
            throw new Error(`Secret not found: ${key} (also tried ${envKey})`);
        }
        catch (error) {
            console.error(`❌ Failed to load secret: ${key}`, error);
            // Último fallback desesperado
            const envValue = process.env[fallbackEnvKey || key];
            if (envValue) {
                console.warn(`🆘 Using emergency environment fallback for: ${key}`);
                return envValue;
            }
            throw error;
        }
    }
    getEnvVar(key, defaultValue) {
        const value = process.env[key] || defaultValue;
        if (!value) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
        return value;
    }
    getEnvVarAsNumber(key, defaultValue) {
        const value = process.env[key];
        if (!value) {
            if (defaultValue !== undefined)
                return defaultValue;
            throw new Error(`Missing required environment variable: ${key}`);
        }
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            throw new Error(`Invalid number for environment variable: ${key}`);
        }
        return parsed;
    }
    async loadConfig() {
        if (this.isLoaded) {
            return this.configCache;
        }
        try {
            console.log('🔧 Loading configuration with Secret Manager...');
            // Configurações públicas (não são secrets)
            const publicConfig = {
                NODE_ENV: this.getEnvVar('NODE_ENV', 'development'),
                PORT: this.getEnvVarAsNumber('PORT', 3001),
                FRONTEND_URL: this.getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
                REQUEST_TIMEOUT_MS: this.getEnvVarAsNumber('REQUEST_TIMEOUT_MS', 15000),
                REDIS_URL: this.getEnvVar('REDIS_URL', 'redis://localhost:6379') // ADICIONADO
            };
            // Secrets sensíveis
            const claudeApiKey = await this.getSecret('CLAUDE_API_KEY', 'ANTHROPIC_API_KEY');
            const config = {
                ...publicConfig,
                CLAUDE_API_KEY: claudeApiKey
            };
            this.configCache = config;
            this.isLoaded = true;
            console.log('✅ Configuration loaded successfully with Secret Manager');
            return config;
        }
        catch (error) {
            console.error('❌ Failed to load configuration', error);
            throw error;
        }
    }
    getConfig() {
        if (!this.isLoaded) {
            // Fallback síncrono para manter compatibilidade
            return {
                NODE_ENV: process.env.NODE_ENV || 'development',
                PORT: parseInt(process.env.PORT || '3001', 10),
                FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
                CLAUDE_API_KEY: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '',
                REQUEST_TIMEOUT_MS: parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10),
                REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379' // ADICIONADO
            };
        }
        return this.configCache;
    }
}
// Singleton
const configService = ConfigService.getInstance();
// Promise para carregar config
let configPromise = null;
export async function loadConfig() {
    if (!configPromise) {
        configPromise = configService.loadConfig();
    }
    return configPromise;
}
export function getConfig() {
    return configService.getConfig();
}
// Compatibilidade total com código existente - getters síncronos
export const config = {
    get NODE_ENV() { return getConfig().NODE_ENV; },
    get PORT() { return getConfig().PORT; },
    get FRONTEND_URL() { return getConfig().FRONTEND_URL; },
    get CLAUDE_API_KEY() { return getConfig().CLAUDE_API_KEY; },
    get REQUEST_TIMEOUT_MS() { return getConfig().REQUEST_TIMEOUT_MS; },
    get REDIS_URL() { return getConfig().REDIS_URL; } // ADICIONADO
};
// Inicialização assíncrona em background (não bloqueia)
loadConfig().catch(error => {
    console.warn('Configuration async load failed, using fallback:', error.message);
});
