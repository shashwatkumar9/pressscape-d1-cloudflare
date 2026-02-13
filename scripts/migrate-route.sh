#!/bin/bash
# Quick script to add D1 initialization to API routes

# Usage: ./migrate-route.sh path/to/route.ts

FILE=$1

if [ -z "$FILE" ]; then
    echo "Usage: $0 <route-file.ts>"
    exit 1
fi

# Check if file exists
if [ ! -f "$FILE" ]; then
    echo "File not found: $FILE"
    exit 1
fi

# Check if already migrated
if grep -q "initializeDatabaseFromContext" "$FILE"; then
    echo "Already migrated: $FILE"
    exit 0
fi

# Backup
cp "$FILE" "$FILE.backup"

# Add import if not present
if ! grep -q "initializeDatabaseFromContext" "$FILE"; then
    # Add import after existing imports
    sed -i '' '/^import.*from.*@\/lib\/db/a\
import { initializeDatabaseFromContext } from '"'"'@/lib/cloudflare'"'"';
' "$FILE"
fi

# Add D1 initialization at start of each exported function
# This is a simplified version - may need manual adjustment
sed -i '' '/export async function \(GET\|POST\|PUT\|DELETE\|PATCH\)(/ {
n
a\
    // Initialize D1 database\
    await initializeDatabaseFromContext();\

}' "$FILE"

echo "Migrated: $FILE"
echo "Backup saved: $FILE.backup"
echo "Please review the changes manually!"
