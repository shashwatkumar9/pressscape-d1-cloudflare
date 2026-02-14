#!/bin/bash

# List of page files that need edge runtime
pages=(
  "app/affiliate/commissions/page.tsx"
  "app/affiliate/dashboard/page.tsx"
  "app/affiliate/referrals/page.tsx"
  "app/buyer/add-funds/success/page.tsx"
  "app/buyer/add-funds/page.tsx"
  "app/buyer/campaigns/[id]/page.tsx"
  "app/buyer/campaigns/new/page.tsx"
  "app/buyer/campaigns/page.tsx"
  "app/buyer/dashboard/page.tsx"
  "app/buyer/messages/[id]/page.tsx"
  "app/buyer/messages/page.tsx"
  "app/buyer/orders/[orderId]/page.tsx"
  "app/buyer/orders/page.tsx"
  "app/buyer/projects/new/page.tsx"
  "app/buyer/saved/page.tsx"
  "app/messages/[id]/page.tsx"
  "app/messages/page.tsx"
  "app/publisher/dashboard/page.tsx"
  "app/publisher/earnings/page.tsx"
  "app/publisher/messages/[id]/page.tsx"
  "app/publisher/messages/page.tsx"
  "app/publisher/orders/[orderId]/page.tsx"
  "app/publisher/orders/page.tsx"
  "app/publisher/payout/page.tsx"
  "app/publisher/websites/[id]/contributors/page.tsx"
  "app/publisher/websites/new/page.tsx"
  "app/publisher/websites/page.tsx"
)

for file in "${pages[@]}"; do
  if [ -f "$file" ]; then
    # Check if it already has edge runtime
    if ! grep -q "export const runtime = 'edge'" "$file"; then
      # Add at the top of the file, after any 'use client' directive
      if grep -q "^'use client'" "$file"; then
        sed -i '' "/^'use client'/a\\
\\
export const runtime = 'edge';
" "$file"
      else
        sed -i '' "1i\\
export const runtime = 'edge';\\

" "$file"
      fi
      echo "✓ Added to $file"
    else
      echo "- Already has edge runtime: $file"
    fi
  else
    echo "✗ Not found: $file"
  fi
done
