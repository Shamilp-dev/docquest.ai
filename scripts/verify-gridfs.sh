#!/bin/bash

echo "════════════════════════════════════════════════════════════"
echo "  🔍 GridFS Implementation Verification"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

passed=0
failed=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "  ${GREEN}✅${NC} $1"
        ((passed++))
        return 0
    else
        echo -e "  ${RED}❌${NC} $1 - MISSING!"
        ((failed++))
        return 1
    fi
}

# Function to check file contains text
check_contains() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "     ${GREEN}✅${NC} Contains: $2"
        return 0
    else
        echo -e "     ${RED}❌${NC} Missing: $2"
        ((failed++))
        return 1
    fi
}

echo -e "${BLUE}1. Checking Core Files${NC}"
echo "────────────────────────────────────────────────────────────"

check_file "lib/gridfs.ts"
check_file "app/api/upload/route.ts"
check_file "app/api/documents/[id]/download/route.ts"
check_file "app/api/documents/[id]/route.ts"

echo ""
echo -e "${BLUE}2. Checking GridFS Integration${NC}"
echo "────────────────────────────────────────────────────────────"

if [ -f "app/api/upload/route.ts" ]; then
    check_contains "app/api/upload/route.ts" "getGridFS"
    check_contains "app/api/upload/route.ts" "bucket.openUploadStream"
    check_contains "app/api/upload/route.ts" "gridfsId"
fi

echo ""
echo -e "${BLUE}3. Checking Download Route${NC}"
echo "────────────────────────────────────────────────────────────"

if [ -f "app/api/documents/[id]/download/route.ts" ]; then
    check_contains "app/api/documents/[id]/download/route.ts" "getGridFS"
    check_contains "app/api/documents/[id]/download/route.ts" "bucket.openDownloadStream"
    check_contains "app/api/documents/[id]/download/route.ts" "if (!clientPromise)"
fi

echo ""
echo -e "${BLUE}4. Checking Environment${NC}"
echo "────────────────────────────────────────────────────────────"

if [ -f ".env.local" ]; then
    echo -e "  ${GREEN}✅${NC} .env.local exists"
    
    if grep -q "MONGODB_URI" .env.local; then
        echo -e "     ${GREEN}✅${NC} MONGODB_URI is set"
    else
        echo -e "     ${YELLOW}⚠️${NC}  MONGODB_URI not found"
    fi
    
    if grep -q "OPENAI_API_KEY" .env.local; then
        echo -e "     ${GREEN}✅${NC} OPENAI_API_KEY is set"
    else
        echo -e "     ${YELLOW}⚠️${NC}  OPENAI_API_KEY not found"
    fi
else
    echo -e "  ${YELLOW}⚠️${NC}  .env.local not found (OK for Vercel)"
fi

echo ""
echo -e "${BLUE}5. Git Status${NC}"
echo "────────────────────────────────────────────────────────────"

# Check if there are uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
    echo -e "  ${GREEN}✅${NC} No uncommitted changes"
    echo -e "  ${GREEN}✅${NC} All changes are committed!"
else
    echo -e "  ${YELLOW}⚠️${NC}  Uncommitted changes detected:"
    git status --short | head -10
    
    total=$(git status --short | wc -l | xargs)
    if [ "$total" -gt "10" ]; then
        echo -e "     ... and $((total - 10)) more files"
    fi
fi

echo ""
echo -e "${BLUE}6. Build Test${NC}"
echo "────────────────────────────────────────────────────────────"

echo "  Testing TypeScript compilation..."
npx tsc --noEmit 2>&1 | head -5

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "  ${GREEN}✅${NC} TypeScript compilation passed"
else
    echo -e "  ${RED}❌${NC} TypeScript compilation failed"
    ((failed++))
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${BLUE}  SUMMARY${NC}"
echo "════════════════════════════════════════════════════════════"

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo -e "${GREEN}Your GridFS implementation is ready to deploy!${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Build test:"
    echo -e "   ${BLUE}npm run build${NC}"
    echo ""
    echo "2. Commit (if needed):"
    echo -e "   ${BLUE}git add .${NC}"
    echo -e "   ${BLUE}git commit -m 'feat: implement GridFS for Vercel'${NC}"
    echo ""
    echo "3. Deploy:"
    echo -e "   ${BLUE}git push${NC}"
    echo ""
else
    echo -e "${RED}❌ $failed CHECK(S) FAILED${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
fi

echo "════════════════════════════════════════════════════════════"
