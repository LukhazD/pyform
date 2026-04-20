/**
 * Sanitizes user-provided CSS to prevent XSS and data exfiltration.
 *
 * Strategy: First normalize escape sequences that attackers use to bypass
 * pattern matching (e.g., `ur\l(...)`, `\75rl(`, `\u0072l(`), then block
 * dangerous patterns on the normalized string.
 */
export function sanitizeCSS(css: string): string {
    if (!css) return "";

    // Step 1: Normalize CSS escape sequences to their literal characters.
    // This defeats obfuscation like `\75 rl(` → `url(` or `\6a avascript` → `javascript`
    let normalized = css
        // CSS hex escapes: \HH or \HHHHHH followed by optional space
        .replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) => {
            const code = parseInt(hex, 16);
            return code > 0 && code < 0x110000 ? String.fromCodePoint(code) : "";
        })
        // Backslash-escaped ASCII (e.g., `\u`, `\r`, `\l`)
        .replace(/\\([^\n0-9a-fA-F])/g, "$1");

    // Step 2: Remove null bytes and zero-width chars that can split tokens
    normalized = normalized.replace(/[\x00\u200B\u200C\u200D\uFEFF]/g, "");

    // Step 3: Strip all comments (prevents nesting attacks)
    normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, "");

    // Step 4: Block dangerous patterns on the normalized string
    const dangerousPatterns: [RegExp, string][] = [
        [/url\s*\(/gi, "/* url blocked */"],
        [/@import\b/gi, "/* import blocked */"],
        [/@charset\b/gi, "/* charset blocked */"],
        [/expression\s*\(/gi, "/* expression blocked */"],
        [/javascript\s*:/gi, "/* blocked */"],
        [/-moz-binding\s*:/gi, "/* blocked */"],
        [/behavior\s*:/gi, "/* blocked */"],
        [/<\/?script/gi, "/* blocked */"],
        [/var\s*\(\s*--[^)]*url/gi, "/* blocked */"], // var() containing url references
    ];

    let sanitized = normalized;
    for (const [pattern, replacement] of dangerousPatterns) {
        sanitized = sanitized.replace(pattern, replacement);
    }

    // Step 5: Limit total length to prevent DoS via massive CSS payloads
    const MAX_CSS_LENGTH = 10_000;
    if (sanitized.length > MAX_CSS_LENGTH) {
        sanitized = sanitized.slice(0, MAX_CSS_LENGTH);
    }

    return sanitized;
}
