#!/usr/bin/env python3
"""
Fix edge runtime exports - handles multi-line imports correctly.
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

EXTENSIONS = [".ts", ".tsx"]
EDGE_RUNTIME_EXPORT = 'export const runtime = "edge";\n'


def should_process_file(filepath):
    """Check if file should be processed."""
    path = Path(filepath)
    if path.suffix not in EXTENSIONS:
        return False
    if path.name in ["layout.tsx", "layout.ts"]:
        return False
    return True


def file_has_export(content):
    """Check if file already has edge runtime export."""
    return bool(re.search(r'export\s+const\s+runtime\s*=\s*["\']edge["\']', content))


def find_import_end(lines):
    """Find the line number after all imports (including multi-line imports)."""
    in_import = False
    last_import_end = 0

    for i, line in enumerate(lines):
        stripped = line.strip()

        # Start of import
        if stripped.startswith('import '):
            in_import = True
            # Check if it's a single-line import
            if ';' in stripped:
                in_import = False
                last_import_end = i + 1
        # End of multi-line import
        elif in_import:
            if ';' in stripped or stripped.endswith("';") or stripped.endswith('";'):
                in_import = False
                last_import_end = i + 1
        # First non-import, non-empty line (and not in an import)
        elif stripped and not in_import and not stripped.startswith('//'):
            break

    return last_import_end


def remove_existing_edge_exports(lines):
    """Remove any existing edge runtime exports that were added incorrectly."""
    return [line for line in lines if 'export const runtime = "edge"' not in line and 'export const runtime = \'edge\'' not in line]


def add_edge_runtime(filepath):
    """Add edge runtime export to a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')

        # Remove any existing incorrect exports
        lines = remove_existing_edge_exports(lines)

        # Find where to insert
        insert_index = find_import_end(lines)

        if insert_index == 0:
            # No imports, add at top
            lines.insert(0, EDGE_RUNTIME_EXPORT.rstrip())
            lines.insert(1, '')
        else:
            # Add after imports
            lines.insert(insert_index, '')
            lines.insert(insert_index + 1, EDGE_RUNTIME_EXPORT.rstrip())

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))

        return "fixed"

    except Exception as e:
        return f"error: {e}"


def main():
    """Process all target files."""
    base_dir = Path(__file__).parent

    stats = {"fixed": 0, "skipped": 0, "errors": 0}

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

            if result == "fixed":
                stats["fixed"] += 1
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
    print(f"  Fixed: {stats['fixed']}")
    print(f"  Skipped: {stats['skipped']}")
    print(f"  Errors: {stats['errors']}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
