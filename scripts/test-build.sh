#!/bin/bash

echo "🧪 Testing build after GridFS fix..."
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "Next steps:"
    echo "1. Commit changes: git add . && git commit -m 'fix: update params handling for Next.js 15'"
    echo "2. Push to deploy: git push"
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi
