#!/usr/bin/env python3
"""
Automated D1 migration script for API routes
Adds necessary imports and D1 initialization to all route files
"""

import os
import re
from pathlib import Path

def migrate_route_file(file_path):
    """Migrate a single route file to D1"""
    with open(file_path, 'r') as f:
        content = f.content()

    # Skip if already migrated
    if 'initializeDatabaseFromContext' in content:
        print(f"✓ Already migrated: {file_path}")
        return False

    # Add D1 imports after existing db import
    if "from '@/lib/db'" in content and "initializeDatabaseFromContext" not in content:
        # Add cloudflare import
        content = content.replace(
            "from '@/lib/db';",
            "from '@/lib/db';\nimport { initializeDatabaseFromContext } from '@/lib/cloudflare';"
        )

    # Add D1 initialization at start of each handler function
    for method in ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']:
        pattern = f'export async function {method}\\(request: NextRequest\\) {{\\s*try {{'
        if re.search(pattern, content):
            replacement = f'''export async function {method}(request: NextRequest) {{
    // Initialize D1 database
    await initializeDatabaseFromContext();

    try {{'''
            content = re.sub(pattern, replacement, content)

        # Also handle functions without try-catch
        pattern2 = f'export async function {method}\\(request: NextRequest\\) {{'
        if re.search(pattern2, content) and 'initializeDatabaseFromContext' not in content:
            replacement2 = f'''export async function {method}(request: NextRequest) {{
    // Initialize D1 database
    await initializeDatabaseFromContext();
'''
            content = re.sub(pattern2, replacement2, content, count=1)

    # Write back
    with open(file_path, 'w') as f:
        f.write(content)

    print(f"✓ Migrated: {file_path}")
    return True

def main():
    """Migrate all route files"""
    base_dir = Path("/sessions/busy-blissful-mccarthy/mnt/Desktop/PressScape D1")
    api_dir = base_dir / "app" / "api"

    migrated = 0
    skipped = 0

    # Find all route.ts files
    for route_file in api_dir.rglob("route.ts"):
        if migrate_route_file(route_file):
            migrated += 1
        else:
            skipped += 1

    print(f"\n✅ Migration complete!")
    print(f"   Migrated: {migrated} files")
    print(f"   Skipped: {skipped} files (already migrated)")

if __name__ == "__main__":
    main()
