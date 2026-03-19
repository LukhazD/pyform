/**
 * Sanitizes user-provided CSS to prevent XSS and data exfiltration.
 * Blocks dangerous patterns: url(), @import, expression(), javascript:, etc.
 */
export function sanitizeCSS(css: string): string {
    if (!css) return "";

    const dangerousPatterns: [RegExp, string][] = [
        [/url\s*\(/gi, "/* url blocked */"],
        [/@import\b/gi, "/* import blocked */"],
        [/expression\s*\(/gi, "/* expression blocked */"],
        [/javascript\s*:/gi, "/* blocked */"],
        [/-moz-binding\s*:/gi, "/* blocked */"],
        [/behavior\s*:/gi, "/* blocked */"],
        [/<\/?script/gi, "/* blocked */"],
        [/\\0/gi, ""], // Unicode null escapes
        [/\/\*[\s\S]*?\*\//g, ""], // Strip existing comments to prevent nesting attacks
    ];

    let sanitized = css;
    for (const [pattern, replacement] of dangerousPatterns) {
        sanitized = sanitized.replace(pattern, replacement);
    }

    return sanitized;
}
