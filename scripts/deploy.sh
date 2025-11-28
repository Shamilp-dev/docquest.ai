#!/bin/bash

# Quick deployment script
echo "🚀 Quick Deploy to Vercel with GridFS"
echo ""

# Check environment
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found"
    echo "Please create it with: MONGODB_URI, OPENAI_API_KEY, NEXTAUTH_SECRET"
    exit 1
fi

# Build test
echo "🏗️  Testing build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "📋 Deployment Checklist:"
echo "1. ✅ GridFS implemented"
echo "2. ✅ Build passes"
echo ""
echo "Before deploying to Vercel, make sure you've set these environment variables:"
echo "   - MONGODB_URI"
echo "   - OPENAI_API_KEY"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL (your production URL)"
echo ""
echo "Ready to deploy? Run:"
echo "  git add ."
echo "  git commit -m 'feat: implement GridFS for Vercel'"
echo "  git push"
echo ""
echo "Or use Vercel CLI:"
echo "  vercel --prod"
