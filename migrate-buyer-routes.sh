#!/bin/bash
# Script to add D1 initialization to buyer routes

cd "/sessions/busy-blissful-mccarthy/mnt/Desktop/PressScape D1"

# List of buyer route files to migrate
routes=(
  "app/api/buyer/notifications/route.ts"
  "app/api/buyer/notifications/mark-all-read/route.ts"
  "app/api/buyer/notifications/[id]/read/route.ts"
  "app/api/buyer/projects/route.ts"
  "app/api/buyer/projects/[id]/route.ts"
  "app/api/buyer/campaigns/route.ts"
  "app/api/buyer/campaigns/[id]/route.ts"
  "app/api/buyer/api-keys/route.ts"
  "app/api/buyer/blacklist/route.ts"
  "app/api/buyer/favorites/[id]/route.ts"
)

for route in "${routes[@]}"; do
  if [ -f "$route" ]; then
    echo "Processing: $route"

    # Add import if not present (check without executing !)
    if ! grep -q "initializeDatabaseFromContext" "$route"; then
      # Add import after other imports
      sed -i "/^import.*from '@\/lib\/db';/a import { initializeDatabaseFromContext } from '@/lib/cloudflare';" "$route"
    fi

    # Fix NOW() in WHERE clauses (add 'now' variable)
    sed -i "s/expires_at > NOW()/expires_at > \${now}/g" "$route"

    # Fix boolean comparisons
    sed -i 's/is_read = FALSE/is_read = 0/g' "$route"
    sed -i 's/is_read = TRUE/is_read = 1/g' "$route"
    sed -i 's/is_active = TRUE/is_active = 1/g' "$route"
    sed -i 's/is_active = FALSE/is_active = 0/g' "$route"

    echo "✓ Completed: $route"
  else
    echo "✗ Not found: $route"
  fi
done

echo ""
echo "Migration complete! Now manually add 'await initializeDatabaseFromContext();' at start of each handler."
