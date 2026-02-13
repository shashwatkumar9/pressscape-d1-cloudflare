#!/usr/bin/env python3
"""
Add 'export const runtime = "edge";' to all API routes and dynamic pages.
"""

import os
import re
from pathlib import Path

# Directories and patterns to process
TARGETS = [
    "app/api",
    "app/admin/(protected)",
    "app/affiliate",
    "app/buyer",
    "app/publisher",
    "app/blog",
    "app/marketplace",
    "app/messages",
]

# Files to process
EXTENSIONS = [".ts", ".tsx"]

# The export to add
EDGE_RUNTIME_EXPORT = 'export const runtime = "edge";\n'


def should_process_file(filepath):
    """Check if file should be processed."""
    path = Path(filepath)

    # Must have correct extension
    if path.suffix not in EXTENSIONS:
        return False

    # Skip layout files that are just wrappers
    if path.name == "layout.tsx" or path.name == "layout.ts":
        return False

    return True


def file_has_export(content):
    """Check if file already has edge runtime export."""
    patterns = [
        r'export\s+const\s+runtime\s*=\s*["\']edge["\']',
        r"export\s+const\s+runtime\s*=\s*'edge'",
    ]
    for pattern in patterns:
        if re.search(pattern, content):
            return True
    return False


def add_edge_runtime(filepath):
    """Add edge runtime export to a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip if already has export
        if file_has_export(content):
            return "skip"

        # Add export at the top, after imports
        lines = content.split('\n')

        # Find where to insert (after last import)
        insert_index = 0
        for i, line in enumerate(lines):
            if line.strip().startswith('import ') or line.strip().startswith('import{'):
                insert_index = i + 1
            elif line.strip() and not line.strip().startswith('import'):
                # Found first non-import line
                break

        # Insert blank line and edge runtime export
        if insert_index > 0:
            # Add after imports
            lines.insert(insert_index, '')
            lines.insert(insert_index + 1, EDGE_RUNTIME_EXPORT.rstrip())
        else:
            # No imports, add at top
            lines.insert(0, EDGE_RUNTIME_EXPORT.rstrip())
            lines.insert(1, '')

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))

        return "added"

    except Exception as e:
        return f"error: {e}"


def main():
    """Process all target files."""
    base_dir = Path(__file__).parent

    stats = {"added": 0, "skipped": 0, "errors": 0}

    for target in TARGETS:
        target_path = base_dir / target

        if not target_path.exists():
            continue

        # Find all files recursively
        for filepath in target_path.rglob("*"):
            if not filepath.is_file():
                continue

            if not should_process_file(filepath):
                continue

            result = add_edge_runtime(filepath)

            if result == "added":
                stats["added"] += 1
                rel_path = filepath.relative_to(base_dir)
                print(f"✓ {rel_path}")
            elif result == "skip":
                stats["skipped"] += 1
            else:
                stats["errors"] += 1
                rel_path = filepath.relative_to(base_dir)
                print(f"✗ {rel_path}: {result}")

    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Added: {stats['added']}")
    print(f"  Skipped (already present): {stats['skipped']}")
    print(f"  Errors: {stats['errors']}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
