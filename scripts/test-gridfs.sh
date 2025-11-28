#!/bin/bash

# Test GridFS Upload System
# Make sure to set MONGODB_URI in .env.local before running

echo "🧪 Testing GridFS Upload System..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local not found${NC}"
    echo "Please create .env.local with MONGODB_URI"
    exit 1
fi

# Check if MONGODB_URI is set
if ! grep -q "MONGODB_URI" .env.local; then
    echo -e "${RED}❌ Error: MONGODB_URI not set in .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing dependencies...${NC}"
    npm install
fi

# Check required dependencies
echo ""
echo "📦 Checking dependencies..."

if grep -q '"mongodb"' package.json; then
    echo -e "${GREEN}✅ mongodb installed${NC}"
else
    echo -e "${RED}❌ mongodb not found - run: npm install mongodb${NC}"
    exit 1
fi

# Check if lib/gridfs.ts exists
if [ -f "lib/gridfs.ts" ]; then
    echo -e "${GREEN}✅ GridFS helper exists${NC}"
else
    echo -e "${RED}❌ lib/gridfs.ts not found${NC}"
    exit 1
fi

# Check if upload route exists
if [ -f "app/api/upload/route.ts" ]; then
    echo -e "${GREEN}✅ Upload route exists${NC}"
else
    echo -e "${RED}❌ app/api/upload/route.ts not found${NC}"
    exit 1
fi

# Check if download route exists
if [ -f "app/api/documents/[id]/download/route.ts" ]; then
    echo -e "${GREEN}✅ Download route exists${NC}"
else
    echo -e "${YELLOW}⚠️  app/api/documents/[id]/download/route.ts not found${NC}"
fi

echo ""
echo "🏗️  Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo ""
    echo "📋 Next steps:"
    echo "1. Test locally: npm run dev"
    echo "2. Upload a file through the UI"
    echo "3. Check MongoDB Atlas for 'uploads.files' and 'uploads.chunks' collections"
    echo "4. Deploy to Vercel: npm run deploy"
    echo ""
    echo -e "${GREEN}🎉 GridFS setup complete!${NC}"
else
    echo ""
    echo -e "${RED}❌ Build failed${NC}"
    echo "Please fix the errors above before deploying"
    exit 1
fi
