#!/bin/bash

# Script to add dynamic configuration to all API routes

echo "Adding dynamic configuration to API routes..."

# List of API route files (excluding auth routes which don't use cookies in the same way)
ROUTES=(
  "app/api/auth/activity/route.ts"
  "app/api/auth/logout/route.ts"
  "app/api/auth/me/route.ts"
  "app/api/chat/mark-seen/route.ts"
  "app/api/chat/seen/route.ts"
  "app/api/documents/[id]/download/route.ts"
  "app/api/documents/[id]/route.ts"
  "app/api/documents/[id]/view/route.ts"
  "app/api/documents/deleted/route.ts"
  "app/api/notifications/route.ts"
  "app/api/profile/clear-data/route.ts"
  "app/api/profile/password/route.ts"
  "app/api/qa/route.ts"
  "app/api/search/route.ts"
  "app/api/upload/route.ts"
)

for route in "${ROUTES[@]}"; do
  if [ -f "$route" ]; then
    # Check if already has dynamic export
    if ! grep -q "export const dynamic" "$route"; then
      echo "Processing $route..."
      # Add after the imports (before the first export function)
      sed -i '' '/^import/,/^$/{ 
        /^$/a\
\
// Force dynamic rendering\
export const dynamic = '\''force-dynamic'\'';\
export const runtime = '\''nodejs'\'';
      }' "$route"
    else
      echo "Skipping $route (already configured)"
    fi
  fi
done

echo "Done!"
