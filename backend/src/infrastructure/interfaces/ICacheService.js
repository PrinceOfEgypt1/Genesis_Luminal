/**
 * Interface para Cache Service - Infraestrutura Crosscutting
 * TRILHO B - Ação 6: Separar Infraestrutura Crosscutting
 *
 * Define contrato limpo para operações de cache, seguindo
 * Dependency Inversion Principle (DIP) do SOLID
 */
/**
 * Tipos de cache disponíveis
 */
export var CacheType;
(function (CacheType) {
    CacheType["REDIS"] = "redis";
    CacheType["MEMORY"] = "memory";
    CacheType["HYBRID"] = "hybrid";
})(CacheType || (CacheType = {}));
