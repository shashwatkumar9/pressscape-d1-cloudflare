#!/bin/bash

# All page files that need edge runtime
find app -name "page.tsx" -path "*/affiliate/*" -o \
     -name "page.tsx" -path "*/buyer/*" -o \
     -name "page.tsx" -path "*/publisher/*" -o \
     -name "page.tsx" -path "*/messages/*" | while read file; do
  
  if ! grep -q "export const runtime = 'edge'" "$file"; then
    # Add at top, respecting 'use client' if present
    if grep -q "^'use client'" "$file" 2>/dev/null; then
      perl -i -pe 's/^('\''use client'\''.*\n)/\1\nexport const runtime = '\''edge'\'';\n/' "$file"
    else
      perl -i -pe 'print "export const runtime = '\''edge'\'';\n\n" if $. == 1' "$file"
    fi
    echo "✓ $file"
  fi
done

# Remaining API routes
api_routes=(
  "app/api/buyer/api-keys/route.ts"
  "app/api/payments/paypal/capture/route.ts"
  "app/api/payments/paypal/create-order/route.ts"
  "app/api/payments/razorpay/create-order/route.ts"
  "app/api/payments/razorpay/verify/route.ts"
  "app/api/publisher/websites/verify/dns/check/route.ts"
  "app/api/publisher/websites/verify/dns/route.ts"
  "app/api/upload/image/route.ts"
  "app/api/v1/orders/[id]/route.ts"
  "app/api/v1/orders/route.ts"
  "app/api/v1/websites/[id]/route.ts"
  "app/api/v1/websites/route.ts"
  "app/api/wallet/recharge/route.ts"
  "app/api/wallet/verify-payment/route.ts"
)

for file in "${api_routes[@]}"; do
  if [ -f "$file" ]; then
    if ! grep -q "export const runtime = 'edge'" "$file"; then
      perl -i -pe 'print "export const runtime = '\''edge'\'';\n\n" if $. == 1' "$file"
      echo "✓ $file"
    fi
  fi
done

echo ""
echo "Done! All routes now have edge runtime configured."
