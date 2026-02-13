#!/usr/bin/env python3
"""Add D1 initialization to route handlers"""

import re
import os

routes = [
    "app/api/buyer/notifications/route.ts",
    "app/api/buyer/notifications/mark-all-read/route.ts",
    "app/api/buyer/notifications/[id]/read/route.ts",
    "app/api/buyer/projects/route.ts",
    "app/api/buyer/projects/[id]/route.ts",
    "app/api/buyer/campaigns/route.ts",
    "app/api/buyer/campaigns/[id]/route.ts",
    "app/api/buyer/api-keys/route.ts",
    "app/api/buyer/blacklist/route.ts",
    "app/api/buyer/favorites/[id]/route.ts"
]

base_dir = "/sessions/busy-blissful-mccarthy/mnt/Desktop/PressScape D1"

for route_path in routes:
    full_path = os.path.join(base_dir, route_path)

    if not os.path.exists(full_path):
        print(f"✗ Not found: {route_path}")
        continue

    with open(full_path, 'r') as f:
        content = f.read()

    # Check if already has D1 init in handlers
    if 'await initializeDatabaseFromContext()' in content:
        print(f"⊘ Already migrated: {route_path}")
        continue

    # Pattern to find handler functions
    # Match: export async function GET/POST/PUT/DELETE/PATCH(...) {
    pattern = r'(export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*\{\s*)(try\s*\{)'

    # Add D1 init right after the try {
    replacement = r'\1\3\n        // Initialize D1 database\n        await initializeDatabaseFromContext();\n'

    new_content = re.sub(pattern, replacement, content)

    if new_content != content:
        with open(full_path, 'w') as f:
            f.write(new_content)
        print(f"✓ Added D1 init: {route_path}")
    else:
        print(f"⊙ No handlers found: {route_path}")

print("\nD1 initialization complete!")
