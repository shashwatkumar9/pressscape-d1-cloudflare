#!/usr/bin/env python3
"""
Final fix for edge runtime exports - handles 'use client' correctly.
"""

import os
import re
from pathlib import Path

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
EDGE_RUNTIME_EXPORT = 'export const runtime = "edge";'


def should_process_file(filepath):
    """Check if file should be processed."""
    path = Path(filepath)
    if path.suffix not in EXTENSIONS:
        return False
    if path.name in ["layout.tsx", "layout.ts"]:
        return False
    return True


def fix_file(filepath):
    """Fix edge runtime export placement in a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')
        
        # Remove any existing edge runtime exports
        lines = [line for line in lines if EDGE_RUNTIME_EXPORT not in line]
        
        # Find if there's a 'use client' directive
        use_client_index = -1
        for i, line in enumerate(lines):
            if line.strip() in ["'use client';", '"use client";']:
                use_client_index = i
                break
        
        # Remove 'use client' if it exists (we'll add it back at the top)
        if use_client_index != -1:
            use_client_line = lines.pop(use_client_index)
            # Remove empty lines after use client
            while use_client_index < len(lines) and not lines[use_client_index].strip():
                lines.pop(use_client_index)
        else:
            use_client_line = None
        
        # Find where imports end
        import_end = 0
        in_import = False
        for i, line in enumerate(lines):
            stripped = line.strip()
            
            # Skip empty lines and comments at the beginning
            if not stripped or stripped.startswith('//'):
                continue
            
            # Start of import
            if stripped.startswith('import '):
                in_import = True
                if ';' in stripped:
                    in_import = False
                    import_end = i + 1
            # End of multi-line import
            elif in_import:
                if ';' in stripped or stripped.endswith("';") or stripped.endswith('";'):
                    in_import = False
                    import_end = i + 1
            # First non-import line
            elif not in_import:
                break
        
        # Build the new file
        new_lines = []
        
        # Add 'use client' at the very top if it exists
        if use_client_line:
            new_lines.append(use_client_line)
            new_lines.append('')
        
        # Add edge runtime export
        new_lines.append(EDGE_RUNTIME_EXPORT)
        new_lines.append('')
        
        # Add the rest of the file
        new_lines.extend(lines)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        
        return "fixed"
    
    except Exception as e:
        return f"error: {e}"


def main():
    """Process all target files."""
    base_dir = Path(__file__).parent
    
    stats = {"fixed": 0, "errors": 0}
    
    for target in TARGETS:
        target_path = base_dir / target
        
        if not target_path.exists():
            continue
        
        for filepath in target_path.rglob("*"):
            if not filepath.is_file():
                continue
            
            if not should_process_file(filepath):
                continue
            
            result = fix_file(filepath)
            
            if result == "fixed":
                stats["fixed"] += 1
                rel_path = filepath.relative_to(base_dir)
                print(f"✓ {rel_path}")
            else:
                stats["errors"] += 1
                rel_path = filepath.relative_to(base_dir)
                print(f"✗ {rel_path}: {result}")
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Fixed: {stats['fixed']}")
    print(f"  Errors: {stats['errors']}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
