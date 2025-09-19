/**
 * GENESIS LUMINAL - SECRET VALIDATOR
 * Detector de secrets em código fonte
 */
export class SecretValidator {
    patterns = [
        {
            name: 'Anthropic API Key',
            pattern: /sk-ant-api03-[a-zA-Z0-9\-_]{95}/g,
            severity: 'high'
        },
        {
            name: 'OpenAI API Key',
            pattern: /sk-[a-zA-Z0-9]{48}/g,
            severity: 'high'
        },
        {
            name: 'AWS Access Key',
            pattern: /AKIA[0-9A-Z]{16}/g,
            severity: 'high'
        },
        {
            name: 'Generic API Key',
            pattern: /api[_-]?key['"\s]*[:=]\s*['"][a-zA-Z0-9_-]{16,}['"]/gi,
            severity: 'medium'
        }
    ];
    maskSecret(secret) {
        if (secret.length <= 8) {
            return '*'.repeat(secret.length);
        }
        const start = secret.substring(0, 4);
        const end = secret.substring(secret.length - 4);
        const middle = '*'.repeat(secret.length - 8);
        return `${start}${middle}${end}`;
    }
    validateContent(content, filename = 'unknown') {
        const results = [];
        const lines = content.split('\n');
        for (const pattern of this.patterns) {
            pattern.pattern.lastIndex = 0; // Reset regex
            let match;
            while ((match = pattern.pattern.exec(content)) !== null) {
                const matchText = match[0];
                // Skip test/example patterns
                if (/test|example|fake|placeholder|sample/i.test(matchText)) {
                    continue;
                }
                // Find line number
                const beforeMatch = content.substring(0, match.index);
                const lineNumber = beforeMatch.split('\n').length;
                results.push({
                    file: filename,
                    line: lineNumber,
                    match: matchText,
                    masked: this.maskSecret(matchText),
                    severity: pattern.severity
                });
            }
        }
        return results;
    }
    generateReport(results) {
        if (results.length === 0) {
            return '✅ No secrets detected in scanned content.';
        }
        let report = `🚨 SECRET DETECTION REPORT\n`;
        report += `Found ${results.length} potential secrets:\n\n`;
        results.forEach((result, index) => {
            report += `${index + 1}. ${result.file}:${result.line}\n`;
            report += `   Severity: ${result.severity.toUpperCase()}\n`;
            report += `   Match: ${result.masked}\n\n`;
        });
        return report;
    }
    async validateProject() {
        console.log('🔍 Starting secret validation...');
        // Por enquanto, apenas verificar alguns arquivos críticos
        const results = [];
        // Verificar .env se existir
        const fs = require('fs').promises;
        try {
            if (require('fs').existsSync('.env')) {
                const envContent = await fs.readFile('.env', 'utf-8');
                const envResults = this.validateContent(envContent, '.env');
                results.push(...envResults);
            }
        }
        catch (error) {
            console.warn('Could not read .env file:', error);
        }
        console.log(`✅ Secret validation completed. Found ${results.length} issues.`);
        return results;
    }
}
export default SecretValidator;
