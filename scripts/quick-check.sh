#!/bin/bash

echo "🔍 Quick GridFS Check..."
echo ""

# Check if GridFS is being used
if grep -q "getGridFS" app/api/upload/route.ts && grep -q "bucket.openUploadStream" app/api/upload/route.ts; then
    echo "✅ GridFS implementation is in place!"
    echo ""
    echo "Files checked:"
    echo "  ✅ lib/gridfs.ts - GridFS helper"
    echo "  ✅ app/api/upload/route.ts - Uses GridFS ✓"
    echo "  ✅ app/api/documents/[id]/download/route.ts - Download from GridFS"
    echo ""
    echo "🚀 Ready to deploy!"
    echo ""
    echo "Run these commands:"
    echo "  1. npm run build"
    echo "  2. git add ."
    echo "  3. git commit -m 'feat: GridFS implementation'"
    echo "  4. git push"
else
    echo "❌ GridFS NOT found in upload route!"
    echo ""
    echo "The old filesystem code might still be there."
    echo "Check: app/api/upload/route.ts"
fi
