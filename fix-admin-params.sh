#!/bin/bash
# Fix Next.js 15 params type issues in admin pages

cd "/sessions/busy-blissful-mccarthy/mnt/Desktop/PressScape D1"

echo "Fixing params types in admin pages..."

# For client components, params is still a regular object in Next.js 15
# The TypeScript error is due to stricter typing
# We need to update the type definition

find app/admin -name "*.tsx" -type f | while read file; do
    # Check if file has params type issue
    if grep -q "params: { id: string }" "$file"; then
        # Replace with Promise type for server components
        # Or use 'any' for client components as a quick fix
        if grep -q "'use client'" "$file"; then
            # Client component - use looser typing
            sed -i '' "s/params: { id: string }/params: { id: string } | Promise<{ id: string }>/g" "$file" 2>/dev/null || \
            sed -i "s/params: { id: string }/params: { id: string } | Promise<{ id: string }>/g" "$file"
            echo "✓ Fixed client component: $file"
        else
            # Server component - use Promise type
            sed -i '' "s/params: { id: string }/params: Promise<{ id: string }>/g" "$file" 2>/dev/null || \
            sed -i "s/params: { id: string }/params: Promise<{ id: string }>/g" "$file"
            echo "✓ Fixed server component: $file"
        fi
    fi
done

echo "Done!"
