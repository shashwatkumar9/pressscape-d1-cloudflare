#!/bin/bash

# Add edge runtime to all API routes
find app/api -name "route.ts" | while read file; do
    if ! grep -q "export const runtime" "$file"; then
        # Add after imports, before first export function
        if grep -q "^export async function" "$file"; then
            sed -i '' '/^export async function/i\
export const runtime = '\''edge'\'\';\
' "$file" 2>/dev/null || sed -i '/^export async function/i export const runtime = '\''edge'\'';\n' "$file"
            echo "✓ $file"
        fi
    fi
done

# Add edge runtime to all dynamic pages
for dir in "admin/(protected)" "buyer" "publisher" "affiliate" "blog" "marketplace" "messages"; do
    find "app/$dir" -name "page.tsx" -o -name "page.ts" 2>/dev/null | while read file; do
        if ! grep -q "export const runtime" "$file"; then
            # Add at the top after imports
            if grep -q "^export default" "$file"; then
                sed -i '' '/^export default/i\
export const runtime = '\''edge'\'\';\
' "$file" 2>/dev/null || sed -i '/^export default/i export const runtime = '\''edge'\'';\n' "$file"
                echo "✓ $file"
            fi
        fi
    done
done

echo "Done adding edge runtime exports!"
