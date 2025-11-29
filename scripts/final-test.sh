#!/bin/bash

echo "🧪 Testing build with all fixes..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "Creating a temporary one for build test..."
    echo "MONGODB_URI=mongodb://localhost:27017" > .env.local.temp
    echo "OPENAI_API_KEY=sk-test" >> .env.local.temp
    echo "NEXTAUTH_SECRET=test-secret" >> .env.local.temp
    USE_TEMP=true
fi

npm run build

BUILD_STATUS=$?

# Clean up temp file if we created one
if [ "$USE_TEMP" = true ]; then
    rm .env.local.temp
fi

echo ""
if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set environment variables in Vercel Dashboard"
    echo "2. Commit: git add . && git commit -m 'fix: complete GridFS implementation'"
    echo "3. Deploy: git push"
else
    echo "❌ Build failed. See errors above."
    exit 1
fi
