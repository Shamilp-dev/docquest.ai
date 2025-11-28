#!/bin/bash

# 🚀 DocQuest Quick Deployment Script
# This script helps you deploy DocQuest to Vercel quickly

echo "🚀 DocQuest Deployment Helper"
echo "=============================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - Ready for deployment"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo ""
    echo "❌ Vercel CLI not found"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI already installed"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Make sure you have:"
echo "   - MongoDB Atlas connection string"
echo "   - OpenAI API key"
echo "   - JWT secret (generate with: openssl rand -base64 32)"
echo ""
echo "2. Run: vercel"
echo "   This will deploy your app to Vercel"
echo ""
echo "3. Set environment variables in Vercel dashboard:"
echo "   - MONGODB_URI"
echo "   - OPENAI_API_KEY"
echo "   - JWT_SECRET"
echo "   - NEXT_PUBLIC_URL"
echo ""
echo "4. Setup UptimeRobot:"
echo "   - Visit: https://uptimerobot.com"
echo "   - Monitor: https://your-app.vercel.app/api/keepalive"
echo "   - Interval: 5 minutes"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT.md"
echo ""
echo "Ready to deploy? Run: vercel"
