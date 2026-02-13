#!/usr/bin/env python3
"""Complete the D1 migration for all remaining routes"""

import os
import re
from pathlib import Path

base_dir = "/sessions/busy-blissful-mccarthy/mnt/Desktop/PressScape D1"
api_dir = os.path.join(base_dir, "app/api")

# Find all route.ts files
route_files = []
for root, dirs, files in os.walk(api_dir):
    for file in files:
        if file == "route.ts":
            route_files.append(os.path.join(root, file))

print(f"Found {len(route_files)} route files")

migrated_count = 0
already_migrated = 0
error_count = 0

for route_path in sorted(route_files):
    try:
        with open(route_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        modified = False

        # Check if already has D1 init call
        if 'await initializeDatabaseFromContext()' in content:
            already_migrated += 1
            continue

        # 1. Add import if not present
        if "initializeDatabaseFromContext" not in content:
            # Add after @/lib/db import
            content = re.sub(
                r"(import\s+.*from\s+['\"]@/lib/db['\"];?)",
                r"\1\nimport { initializeDatabaseFromContext } from '@/lib/cloudflare';",
                content,
                count=1
            )
            modified = True

        # 2. Add D1 init to all handler functions
        # Match: export async function GET/POST/etc(...) { try {
        pattern = r'(export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*\{\s*)(try\s*\{)'

        def add_init(match):
            return f'{match.group(1)}{match.group(3)}\n        // Initialize D1 database\n        await initializeDatabaseFromContext();\n'

        new_content = re.sub(pattern, add_init, content)
        if new_content != content:
            content = new_content
            modified = True

        # 3. Fix NOW() calls
        content = re.sub(r'expires_at\s+>\s+NOW\(\)', 'expires_at > ${now}', content)
        content = re.sub(r'created_at\s*=\s*NOW\(\)', 'created_at = ${now}', content)
        content = re.sub(r'updated_at\s*=\s*NOW\(\)', 'updated_at = ${now}', content)
        content = re.sub(r'=\s*NOW\(\)', '= ${now}', content)

        # 4. Fix boolean literals in SQL
        content = re.sub(r'\bTRUE\b', '1', content)
        content = re.sub(r'\bFALSE\b', '0', content)

        # 5. Add generateId import if needed (for RETURNING clauses)
        if 'gen_random_uuid()' in content and 'generateId' not in content:
            content = re.sub(
                r"(import\s+\{[^}]*)\}\s+from\s+['\"]@/lib/db['\"]",
                r"\1, generateId } from '@/lib/db'",
                content,
                count=1
            )

        # Write back if modified
        if content != original_content:
            with open(route_path, 'w', encoding='utf-8') as f:
                f.write(content)
            migrated_count += 1
            rel_path = os.path.relpath(route_path, base_dir)
            print(f"✓ Migrated: {rel_path}")

    except Exception as e:
        error_count += 1
        print(f"✗ Error in {route_path}: {e}")

print(f"\n{'='*60}")
print(f"Migration Complete!")
print(f"{'='*60}")
print(f"✓ Migrated: {migrated_count} routes")
print(f"⊘ Already done: {already_migrated} routes")
print(f"✗ Errors: {error_count} routes")
print(f"📊 Total: {len(route_files)} routes")
print(f"{'='*60}")
