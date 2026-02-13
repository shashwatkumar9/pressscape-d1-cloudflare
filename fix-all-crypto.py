#!/usr/bin/env python3

import os
import re
from pathlib import Path

# Web Crypto API helpers
WEB_CRYPTO_HELPERS = """
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

function generateRandomUUID(): string {
  return crypto.randomUUID();
}

async function generateMD5Hash(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8);
}
"""

def fix_file(filepath: str):
    """Fix crypto imports in a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        modified = False

        # Check if file uses crypto
        has_crypto_import = (
            "import crypto from 'crypto'" in content or
            'import crypto from "crypto"' in content or
            "import * as crypto from 'crypto'" in content or
            'import * as crypto from "crypto"' in content or
            "import { randomUUID } from 'crypto'" in content or
            'import { randomUUID } from "crypto"' in content
        )

        if not has_crypto_import:
            return False

        # Remove all crypto import variations
        content = re.sub(r"import crypto from ['\"]crypto['\"];?\n?", '', content)
        content = re.sub(r"import \* as crypto from ['\"]crypto['\"];?\n?", '', content)
        content = re.sub(r"import \{ randomUUID \} from ['\"]crypto['\"];?\n?", '', content)

        # Check if we need to add helpers (don't add if they're already there)
        if WEB_CRYPTO_HELPERS.strip() not in content:
            # Find where to insert helpers (after imports, before code)
            lines = content.split('\n')
            insert_index = 0

            # Find the last import or export const runtime line
            for i, line in enumerate(lines):
                if (line.startswith('import ') or
                    line.startswith('export ') or
                    line.strip().startswith('//')):
                    insert_index = i + 1

            # Insert helpers
            lines.insert(insert_index, WEB_CRYPTO_HELPERS)
            content = '\n'.join(lines)

        # Replace crypto.randomUUID() with generateRandomUUID()
        content = re.sub(r'\bcrypto\.randomUUID\(\)', 'generateRandomUUID()', content)

        # Replace randomUUID() with generateRandomUUID()
        content = re.sub(r'\brandomUUID\(\)', 'generateRandomUUID()', content)

        # Replace crypto.randomBytes().toString('hex') with generateRandomToken()
        content = re.sub(
            r"crypto\.randomBytes\((\d+)\)\.toString\(['\"]hex['\"]\)",
            r'generateRandomToken(\1)',
            content
        )

        # Replace crypto.randomInt() with generateRandomInt()
        content = re.sub(
            r'crypto\.randomInt\((\d+),\s*(\d+)\)',
            r'generateRandomInt(\1, \2)',
            content
        )

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ {filepath}")
            return True
        else:
            print(f"- {filepath} (no changes needed)")
            return False
    except Exception as e:
        print(f"✗ {filepath}: {e}")
        return False

# Find all .ts and .tsx files in app/ and lib/ directories
files_to_check = []
for pattern in ['app/**/*.ts', 'app/**/*.tsx', 'lib/**/*.ts']:
    files_to_check.extend(Path('.').glob(pattern))

fixed_count = 0
for file_path in files_to_check:
    if fix_file(str(file_path)):
        fixed_count += 1

print(f"\n{'='*60}")
print(f"Summary: Fixed {fixed_count} files")
print('='*60)
