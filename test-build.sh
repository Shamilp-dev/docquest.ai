#!/bin/bash

echo "Building the project..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  echo ""
  echo "Now you can:"
  echo "1. Commit and push the changes:"
  echo "   git add ."
  echo "   git commit -m 'fix: add dynamic rendering to all API routes for Vercel deployment'"
  echo "   git push"
  echo ""
  echo "2. Deploy to Vercel again"
else
  echo "❌ Build failed. Check the errors above."
fi
