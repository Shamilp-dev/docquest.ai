#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   DocQuest.AI - Quick Deploy Script${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Make scripts executable
chmod +x deploy-fixed.sh
chmod +x sync-git.sh

echo -e "${YELLOW}📋 Checking git status...${NC}"
git status --short
echo ""

echo -e "${GREEN}Which deployment method would you like to use?${NC}"
echo ""
echo "  1) 🚀 Automated (Recommended)"
echo "     - Pulls, commits, pushes, and builds automatically"
echo ""
echo "  2) 🔧 Manual Sync First"
echo "     - Syncs with remote, then you can review changes"
echo ""
echo "  3) 📝 Show Manual Commands"
echo "     - Display step-by-step manual commands"
echo ""
echo "  4) ❌ Cancel"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}Running automated deployment...${NC}"
        ./deploy-fixed.sh
        ;;
    2)
        echo ""
        echo -e "${YELLOW}Running manual sync...${NC}"
        ./sync-git.sh
        echo ""
        echo -e "${GREEN}After reviewing, run: ${BLUE}./deploy-fixed.sh${NC}"
        ;;
    3)
        echo ""
        echo -e "${BLUE}Manual Deployment Commands:${NC}"
        echo ""
        echo -e "${YELLOW}# Step 1: Sync with remote${NC}"
        echo "  git stash"
        echo "  git pull origin main"
        echo "  git stash pop"
        echo ""
        echo -e "${YELLOW}# Step 2: Stage and commit${NC}"
        echo "  git add ."
        echo "  git commit -m 'fix: remove duplicate upload popup'"
        echo ""
        echo -e "${YELLOW}# Step 3: Push and build${NC}"
        echo "  git push origin main"
        echo "  npm run build"
        echo ""
        ;;
    4)
        echo ""
        echo -e "${RED}Deployment cancelled.${NC}"
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}Done! Check output above for any errors.${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
