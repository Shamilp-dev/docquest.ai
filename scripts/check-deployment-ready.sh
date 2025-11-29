#!/bin/bash

echo "🔍 Checking if GridFS implementation is ready to deploy..."
echo ""

# Check if key files exist
echo "✅ Checking key files:"
echo ""

if [ -f "lib/gridfs.ts" ]; then
    echo "  ✅ lib/gridfs.ts exists"
else
    echo "  ❌ lib/gridfs.ts MISSING!"
    exit 1
fi

if [ -f "app/api/upload/route.ts" ]; then
    echo "  ✅ app/api/upload/route.ts exists"
    # Check if it uses GridFS
    if grep -q "getGridFS" app/api/upload/route.ts; then
        echo "     ✅ Uses GridFS (good!)"
    else
        echo "     ❌ Does NOT use GridFS (bad!)"
        exit 1
    fi
else
    echo "  ❌ app/api/upload/route.ts MISSING!"
    exit 1
fi

if [ -f "app/api/documents/[id]/download/route.ts" ]; then
    echo "  ✅ app/api/documents/[id]/download/route.ts exists"
else
    echo "  ❌ download route MISSING!"
    exit 1
fi

echo ""
echo "✅ All files are in place!"
echo ""

# Check git status
echo "📋 Git status:"
git status --short

echo ""
echo "🔍 Files that need to be committed:"
git status --short | wc -l | xargs echo "   " files

echo ""
echo "📦 Next steps:"
echo ""
echo "1. Test build:"
echo "   npm run build"
echo ""
echo "2. Commit changes:"
echo "   git add ."
echo "   git commit -m 'feat: implement GridFS for Vercel compatibility'"
echo ""
echo "3. Push to deploy:"
echo "   git push"
echo ""
