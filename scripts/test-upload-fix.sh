#!/bin/bash

echo "🔧 Fixed UploadSidebar - setShowUploadPanel is now optional"
echo ""
echo "Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "Now deploy:"
    echo "  git add ."
    echo "  git commit -m 'fix: make setShowUploadPanel optional in UploadSidebar'"
    echo "  git push"
else
    echo ""
    echo "❌ Build failed"
    exit 1
fi
