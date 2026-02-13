#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

// Helper functions to add at the top of files that need crypto
const WEB_CRYPTO_HELPERS = `
// Web Crypto API helpers for Edge Runtime
function generateRandomToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function generateRandomInt(min: number, max: number): number {
  const range = max - min;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return min + (array[0] % range);
}

async function generateMD5Hash(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8);
}
`;

interface FixResult {
  file: string;
  success: boolean;
  error?: string;
}

const results: FixResult[] = [];

function fixFile(filePath: string): void {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Check if file imports crypto
    if (content.includes("import crypto from 'crypto'")) {
      // Remove the crypto import line
      content = content.replace(/import crypto from ['"]crypto['"];?\n/g, '');
      modified = true;

      // Add Web Crypto helpers after the edge runtime export and before other code
      const lines = content.split('\n');
      let insertIndex = -1;

      // Find where to insert (after edge runtime export and imports)
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('export const runtime') ||
            lines[i].includes('import ')) {
          insertIndex = i + 1;
        }
        // Stop at first non-import, non-export, non-empty line
        if (insertIndex > 0 &&
            !lines[i].startsWith('import ') &&
            !lines[i].startsWith('export ') &&
            !lines[i].startsWith('//') &&
            lines[i].trim() !== '') {
          break;
        }
      }

      if (insertIndex > 0) {
        lines.splice(insertIndex, 0, WEB_CRYPTO_HELPERS);
        content = lines.join('\n');
      }

      // Replace crypto.randomBytes(32).toString('hex') with generateRandomToken()
      content = content.replace(
        /crypto\.randomBytes\((\d+)\)\.toString\(['"]hex['"]\)/g,
        'generateRandomToken($1)'
      );

      // Replace crypto.randomInt(min, max) with generateRandomInt(min, max)
      content = content.replace(
        /crypto\.randomInt\((\d+),\s*(\d+)\)/g,
        'generateRandomInt($1, $2)'
      );

      // Replace crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8)
      // This needs to be async, so we need to handle it differently
      if (content.includes('crypto.createHash')) {
        console.warn(`⚠️  ${filePath}: Contains crypto.createHash which requires async refactoring`);
      }

      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✓ ${filePath}`);
      results.push({ file: filePath, success: true });
      modified = true;
    }

    if (!modified) {
      console.log(`- ${filePath} (no changes needed)`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`✗ ${filePath}: ${errorMsg}`);
    results.push({ file: filePath, success: false, error: errorMsg });
  }
}

// Files that need fixing based on build errors
const filesToFix = [
  'app/api/admin/auth/forgot-password/route.ts',
  'app/api/affiliate/enable/route.ts',
  'app/api/auth/forgot-password/route.ts',
  'app/api/upload/image/route.ts',
];

console.log('🔧 Fixing crypto imports for Edge Runtime...\n');

for (const file of filesToFix) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  } else {
    console.warn(`⚠️  ${file} not found`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('Summary:');
console.log(`  Fixed: ${results.filter(r => r.success).length}`);
console.log(`  Errors: ${results.filter(r => !r.success).length}`);
console.log('='.repeat(60));

if (results.some(r => !r.success)) {
  process.exit(1);
}
