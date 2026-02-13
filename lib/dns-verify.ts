import { promises as dns } from 'dns';

/**
 * Verify DNS TXT record exists with verification token
 */
export async function verifyDnsTxt(domain: string, token: string): Promise<boolean> {
    try {
        // Remove protocol if present
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

        // Look for TXT records
        const records = await dns.resolveTxt(cleanDomain);

        // Flatten TXT records (they come as arrays of arrays)
        const flatRecords = records.map(record => record.join(''));

        // Check if any record contains our verification token
        const verificationString = `pressscape-verify=${token}`;
        return flatRecords.some(record => record.includes(verificationString));
    } catch (error) {
        console.error('DNS TXT verification error:', error);
        return false;
    }
}

/**
 * Generate DNS TXT record instruction
 */
export function generateDnsTxtInstruction(token: string): string {
    return `pressscape-verify=${token}`;
}
