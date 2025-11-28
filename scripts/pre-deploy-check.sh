#!/bin/bash

# 🚀 Pre-Deployment Check Script
# Runs automated checks before deployment

echo "🔍 Running Pre-Deployment Checks..."
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: Environment variables
echo "1️⃣  Checking .env.local file..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
    
    # Check for placeholder values
    if grep -q "YOUR_" .env.local; then
        echo -e "${RED}❌ Found placeholder values in .env.local${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ No placeholder values found${NC}"
    fi
    
    # Check for required variables
    required_vars=("MONGODB_URI" "OPENROUTER_API_KEY" "JWT_SECRET" "NEXT_PUBLIC_URL")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env.local; then
            echo -e "${GREEN}✅ $var is set${NC}"
        else
            echo -e "${RED}❌ $var is missing${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    done
else
    echo -e "${RED}❌ .env.local not found${NC}"
    echo -e "${YELLOW}💡 Run: cp .env.local.example .env.local${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 2: .gitignore
echo "2️⃣  Checking .gitignore..."
if [ -f ".gitignore" ]; then
    if grep -q ".env.local" .gitignore; then
        echo -e "${GREEN}✅ .env.local is in .gitignore${NC}"
    else
        echo -e "${RED}❌ .env.local not in .gitignore${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "node_modules" .gitignore; then
        echo -e "${GREEN}✅ node_modules is in .gitignore${NC}"
    else
        echo -e "${YELLOW}⚠️  node_modules not in .gitignore${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ .gitignore not found${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 3: Dependencies
echo "3️⃣  Checking dependencies..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json exists${NC}"
    
    if [ -f "package-lock.json" ]; then
        echo -e "${GREEN}✅ package-lock.json exists${NC}"
    else
        echo -e "${YELLOW}⚠️  package-lock.json not found${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✅ node_modules directory exists${NC}"
    else
        echo -e "${YELLOW}⚠️  node_modules not found. Run: npm install${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ package.json not found${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 4: Build test
echo "4️⃣  Testing build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed. Check errors above.${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 5: Critical files
echo "5️⃣  Checking critical files..."
critical_files=(
    "app/api/upload/route.ts"
    "app/api/keepalive/route.ts"
    "app/api/health/route.ts"
    "lib/mongodb.ts"
    "middleware.ts"
    "next.config.ts"
    "vercel.json"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# Check 6: Security
echo "6️⃣  Security checks..."

# Check JWT secret strength
if [ -f ".env.local" ]; then
    jwt_secret=$(grep "^JWT_SECRET=" .env.local | cut -d'=' -f2)
    jwt_length=${#jwt_secret}
    
    if [ $jwt_length -lt 32 ]; then
        echo -e "${RED}❌ JWT_SECRET too short (${jwt_length} chars, need 32+)${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ JWT_SECRET length OK (${jwt_length} chars)${NC}"
    fi
fi

# Check for exposed credentials
if grep -r "mongodb+srv://" --include="*.ts" --include="*.tsx" --include="*.js" app/ lib/ 2>/dev/null | grep -v "process.env" > /dev/null; then
    echo -e "${RED}❌ Found hardcoded MongoDB URI in code${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No hardcoded credentials in code${NC}"
fi
echo ""

# Summary
echo "=================================="
echo "📊 Summary:"
echo "=================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for deployment! 🚀${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    echo -e "${GREEN}✅ No critical errors. Deployment OK with warnings.${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    fi
    echo ""
    echo "Fix errors before deploying!"
    exit 1
fi
