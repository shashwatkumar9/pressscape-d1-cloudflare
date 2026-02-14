#!/bin/bash

# List of all route files that need edge runtime
routes=(
  "app/affiliate/commissions/page.tsx"
  "app/affiliate/dashboard/page.tsx"
  "app/affiliate/referrals/page.tsx"
  "app/api/admin/auth/login/route.ts"
  "app/api/admin/auth/reset-password/route.ts"
  "app/api/admin/create-test-buyer/route.ts"
  "app/api/admin/migrate/seed-users/route.ts"
  "app/api/admin/setup/route.ts"
  "app/api/auth/login/route.ts"
  "app/api/auth/reset-password/route.ts"
  "app/api/auth/signup/route.ts"
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

# Add edge runtime to each file
for file in "${routes[@]}"; do
  if [ -f "$file" ]; then
    # Check if edge runtime already exists
    if ! grep -q "export const runtime = 'edge'" "$file"; then
      # Add after imports (before first export default or export async function)
      sed -i '' '1,/^export \(default\|async\)/ s/^export \(default\|async\)/export const runtime = '\''edge'\'';\n\nexport \1/' "$file"
    fi
    echo "✓ $file"
  else
    echo "✗ $file (not found)"
  fi
done

echo ""
echo "Edge runtime configuration added to all files!"
