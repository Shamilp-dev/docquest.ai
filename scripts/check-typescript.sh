#!/bin/bash

echo "🔍 Checking for potential TypeScript issues..."
echo ""

# Find all files that import clientPromise
echo "Files using clientPromise:"
grep -r "import.*clientPromise" app/api --include="*.ts" 2>/dev/null || echo "None found (or search failed)"

echo ""
echo "Files with client.db calls:"
grep -r "client\.db" app/api --include="*.ts" 2>/dev/null || echo "None found (all should have null checks now)"

echo ""
echo "Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful! All TypeScript issues resolved!"
    echo ""
    echo "Ready to deploy:"
    echo "  git add ."
    echo "  git commit -m 'fix: add null safety checks for MongoDB client'"
    echo "  git push"
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi
