#!/bin/bash

# Get Cloudflare account ID and API token from wrangler config
ACCOUNT_ID="9e79ed6651ebcaffe98a867f16204ba6"
PROJECT_NAME="pressscape-d1-cloudflare"
DATABASE_ID="4d6322eb-4926-482b-a01b-11fc45784c3f"

echo "To bind D1 database to Cloudflare Pages:"
echo ""
echo "1. Go to: https://dash.cloudflare.com/$ACCOUNT_ID/pages/view/$PROJECT_NAME"
echo "2. Click 'Settings' tab"
echo "3. Scroll to 'Functions' section"
echo "4. Click 'D1 database bindings' -> 'Add binding'"
echo "5. Variable name: DB"
echo "6. Select database: pressscape-db"
echo "7. Click 'Save'"
echo ""
echo "Or use wrangler CLI:"
echo "  npx wrangler pages project bind-d1 DB --database-name=pressscape-db"
