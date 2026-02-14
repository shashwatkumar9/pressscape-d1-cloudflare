/**
 * Web Crypto API-based password hashing for Edge Runtime compatibility
 * Replaces bcrypt for Cloudflare Pages deployment
 */

const SALT_LENGTH = 16;
const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const ALGORITHM = 'PBKDF2';

/**
 * Hash a password using PBKDF2 with Web Crypto API
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  // Convert password to ArrayBuffer
  const passwordBuffer = new TextEncoder().encode(password);

  // Import password as key
  const key = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: ALGORITHM },
    false,
    ['deriveBits']
  );

  // Derive key using PBKDF2
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    key,
    KEY_LENGTH * 8
  );

  // Combine salt and hash
  const hashArray = new Uint8Array(hashBuffer);
  const combined = new Uint8Array(SALT_LENGTH + KEY_LENGTH);
  combined.set(salt, 0);
  combined.set(hashArray, SALT_LENGTH);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Decode base64
    const combined = Uint8Array.from(atob(hash), c => c.charCodeAt(0));

    // Extract salt and stored hash
    const salt = combined.slice(0, SALT_LENGTH);
    const storedHash = combined.slice(SALT_LENGTH);

    // Convert password to ArrayBuffer
    const passwordBuffer = new TextEncoder().encode(password);

    // Import password as key
    const key = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: ALGORITHM },
      false,
      ['deriveBits']
    );

    // Derive key using same parameters
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: ALGORITHM,
        salt: salt,
        iterations: ITERATIONS,
        hash: 'SHA-256'
      },
      key,
      KEY_LENGTH * 8
    );

    const derivedHash = new Uint8Array(hashBuffer);

    // Compare hashes (constant-time comparison)
    if (derivedHash.length !== storedHash.length) {
      return false;
    }

    let mismatch = 0;
    for (let i = 0; i < derivedHash.length; i++) {
      mismatch |= derivedHash[i] ^ storedHash[i];
    }

    return mismatch === 0;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Backward compatibility: verify bcrypt hash or Web Crypto hash
 * For migration from bcrypt to Web Crypto
 */
export async function verifyPasswordCompat(password: string, hash: string): Promise<boolean> {
  // Check if it's a bcrypt hash (starts with $2b$, $2a$, or $2y$)
  if (hash.startsWith('$2')) {
    // This is a bcrypt hash - we can't verify it in Edge Runtime
    // Return false and require password reset
    console.warn('Bcrypt hash detected - password reset required for Edge Runtime');
    return false;
  }

  // It's a Web Crypto hash
  return verifyPassword(password, hash);
}
