#!/usr/bin/env python3
"""Migrate publisher routes to D1"""

import re
import os

routes = [
    "app/api/publisher/payout-settings/route.ts",
    "app/api/publisher/request-payout/route.ts",
    "app/api/publisher/websites/bulk/route.ts",
    "app/api/publisher/websites/verify/html-file/route.ts",
    "app/api/publisher/websites/verify/html-file/check/route.ts",
    "app/api/publisher/websites/verify/dns/route.ts",
    "app/api/publisher/websites/verify/dns/check/route.ts",
    "app/api/publisher/websites/route.ts",
    "app/api/publisher/websites/[id]/contributors/route.ts",
    "app/api/publisher/websites/[id]/contributors/[contributorId]/route.ts",
    "app/api/publisher/websites/apply-contributor/route.ts"
]

base_dir = "/sessions/busy-blissful-mccarthy/mnt/Desktop/PressScape D1"

for route_path in routes:
    full_path = os.path.join(base_dir, route_path)

    if not os.path.exists(full_path):
        print(f"✗ Not found: {route_path}")
        continue

    with open(full_path, 'r') as f:
        content = f.read()

    modified = False

    # 1. Add import if not present
    if "initializeDatabaseFromContext" not in content:
        # Find the db import line and add after it
        content = re.sub(
            r"(import\s+.*from\s+'@/lib/db';)",
            r"\1\nimport { initializeDatabaseFromContext } from '@/lib/cloudflare';",
            content
        )
        modified = True

    # 2. Add D1 init to handlers if not present
    if 'await initializeDatabaseFromContext()' not in content:
        pattern = r'(export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*\{\s*)(try\s*\{)'
        replacement = r'\1\3\n        // Initialize D1 database\n        await initializeDatabaseFromContext();\n'
        new_content = re.sub(pattern, replacement, content)
        if new_content != content:
            content = new_content
            modified = True

    # 3. Fix NOW() calls
    content = re.sub(r'expires_at\s+>\s+NOW\(\)', 'expires_at > ${now}', content)
    content = re.sub(r'=\s+NOW\(\)', '= ${now}', content)

    # 4. Fix boolean literals
    content = re.sub(r'\bis_active\s+=\s+TRUE\b', 'is_active = 1', content)
    content = re.sub(r'\bis_active\s+=\s+FALSE\b', 'is_active = 0', content)
    content = re.sub(r'\bis_approved\s+=\s+TRUE\b', 'is_approved = 1', content)
    content = re.sub(r'\bis_approved\s+=\s+FALSE\b', 'is_approved = 0', content)
    content = re.sub(r'\bis_verified\s+=\s+TRUE\b', 'is_verified = 1', content)
    content = re.sub(r'\bis_verified\s+=\s+FALSE\b', 'is_verified = 0', content)
    content = re.sub(r'\bAND\s+is_active\s*\b', 'AND is_active = 1', content)

    # Write back if modified
    if content != open(full_path, 'r').read():
        with open(full_path, 'w') as f:
            f.write(content)
        print(f"✓ Migrated: {route_path}")
    else:
        print(f"⊘ No changes: {route_path}")

print("\nPublisher routes migration complete!")
