import crypto from 'crypto';

/**
 * Generate a unique verification token
 */
export function generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify HTML file exists on website
 */
export async function verifyHtmlFile(domain: string, token: string): Promise<boolean> {
    try {
        // Ensure domain has protocol
        const url = domain.startsWith('http') ? domain : `https://${domain}`;
        const verificationUrl = `${url}/pressscape-verify-${token}.html`;

        const response = await fetch(verificationUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'PressScape-Verification/1.0',
            },
        });

        if (!response.ok) {
            return false;
        }

        const content = await response.text();

        // Check if file contains the verification token
        return content.includes(token) && content.includes('pressscape-verification');
    } catch (error) {
        console.error('HTML file verification error:', error);
        return false;
    }
}

/**
 * Generate HTML file content for verification
 */
export function generateVerificationHtml(token: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PressScape Verification</title>
</head>
<body>
    <h1>PressScape Website Verification</h1>
    <p>This file verifies ownership of this website for PressScape.</p>
    <meta name="pressscape-verification" content="${token}" />
    <p>Verification Token: ${token}</p>
    <p>Do not delete this file.</p>
</body>
</html>`;
}
