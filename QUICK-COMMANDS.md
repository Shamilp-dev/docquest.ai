# 🚀 Quick Command Reference

## Essential Commands for Deployment

### 1. Pre-Deployment Setup
```bash
# Generate strong JWT secret
openssl rand -base64 32

# Copy to .env.local
# MONGODB_URI=your_connection_string
# OPENROUTER_API_KEY=your_api_key
# JWT_SECRET=generated_secret_here
# NEXT_PUBLIC_URL=http://localhost:3000
```

### 2. Run Pre-Deployment Checks
```bash
# Make script executable (first time only)
chmod +x scripts/pre-deploy-check.sh

# Run automated checks
npm run check:deploy
```

**Expected output:** ✅ All checks passed! Ready for deployment!

### 3. Deploy to Vercel
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy to staging
npm run deploy

# Or deploy to production directly
npm run deploy:prod
```

### 4. Setup Database Indexes
```bash
# After first deployment
npm run setup:indexes
```

**What it does:** Creates optimized indexes in MongoDB for fast queries

### 5. Test Your Deployment
```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test keep-alive endpoint
curl https://your-app.vercel.app/api/keepalive
```

**Expected responses:**
- Health: `{"status":"ok", ...}`
- Keep-alive: `{"status":"warm", ...}`

---

## Development Commands

### Local Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Run linter
npm run lint
```

### Testing
```bash
# Test build
npm run build

# Test locally before deploying
npm start
# Then visit http://localhost:3000
```

---

## Troubleshooting Commands

### If Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### If Environment Issues
```bash
# Verify .env.local exists
ls -la .env.local

# Check .gitignore
grep ".env.local" .gitignore

# Verify required variables
cat .env.local | grep -E "MONGODB_URI|OPENROUTER_API_KEY|JWT_SECRET"
```

### If MongoDB Connection Issues
```bash
# Test connection locally
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.MONGODB_URI)"
```

---

## Vercel Commands

### Deploy Commands
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

### Environment Variables
```bash
# Add environment variable
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls

# Pull environment variables to local
vercel env pull
```

---

## MongoDB Commands

### Setup Indexes
```bash
# Run index setup script
npm run setup:indexes

# Or manually with mongosh
mongosh "your_connection_string"
# Then run commands from scripts/setup-indexes.js
```

### Backup Data
```bash
# Export database
mongodump --uri="your_connection_string" --out=backup/

# Import database
mongorestore --uri="your_connection_string" backup/
```

---

## Git Commands

### Initial Setup
```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Production ready - optimized and secured"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/docquest.git
git branch -M main
git push -u origin main
```

### Before Each Deployment
```bash
# Check status
git status

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

---

## Quick Reference: File Locations

### Configuration Files
```
.env.local              # Environment variables (DO NOT COMMIT)
.env.local.example      # Example template (safe to commit)
next.config.ts          # Next.js configuration
vercel.json            # Vercel deployment config
package.json           # Dependencies and scripts
```

### Documentation
```
READY-TO-DEPLOY.md      # ⭐ Start here
CODE-REVIEW-SUMMARY.md  # Summary of changes
PRODUCTION-AUDIT.md     # Detailed audit report
DEPLOYMENT.md           # Step-by-step guide
CHECKLIST.md            # Deployment checklist
```

### Scripts
```
scripts/setup-indexes.js        # Database index setup
scripts/pre-deploy-check.sh     # Pre-deployment validation
```

### Critical Routes
```
app/api/upload/route.ts         # File upload handler
app/api/keepalive/route.ts      # Keep-alive endpoint
app/api/health/route.ts         # Health check
lib/mongodb.ts                  # Database connection
lib/rateLimit.ts                # Rate limiting
middleware.ts                   # Auth middleware
```

---

## UptimeRobot Setup

### Create Monitor
1. Visit: https://uptimerobot.com
2. Sign up (free)
3. Add new monitor:
   - Type: HTTP(s)
   - Name: DocQuest Keep-Alive
   - URL: https://your-app.vercel.app/api/keepalive
   - Interval: 5 minutes
4. Save

**Result:** Zero cold starts! 🔥

---

## Performance Testing

### Test API Speed
```bash
# Health check
time curl https://your-app.vercel.app/api/health

# Keep-alive
time curl https://your-app.vercel.app/api/keepalive
```

**Target:** < 300ms for both

### Load Testing
```bash
# Install Apache Bench (if needed)
# macOS: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Run load test
ab -n 100 -c 10 https://your-app.vercel.app/api/health
```

---

## Monitoring Commands

### Check Vercel Logs
```bash
# View recent logs
vercel logs

# Follow logs in real-time
vercel logs --follow

# View specific deployment
vercel logs [deployment-url]
```

### Check Function Metrics
1. Visit: https://vercel.com/dashboard
2. Select your project
3. Click "Analytics" tab
4. View function execution times

---

## Security Checklist Commands

### Verify Security
```bash
# Check .gitignore includes .env.local
grep ".env.local" .gitignore

# Verify no credentials in code
grep -r "mongodb+srv://" app/ lib/ --exclude-dir=node_modules

# Check JWT secret length
echo -n "$(grep JWT_SECRET .env.local | cut -d= -f2)" | wc -c
# Should be 32+ characters
```

---

## Cost Monitoring

### Check OpenRouter Usage
1. Visit: https://openrouter.ai/dashboard
2. Check API usage
3. View costs

### Check Vercel Usage
1. Visit: https://vercel.com/dashboard
2. Click "Usage" tab
3. Monitor bandwidth and function executions

---

## Emergency Commands

### Rollback Deployment
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Emergency Shutdown
```bash
# Remove all deployments
vercel rm [project-name] --yes
```

---

## Success Indicators

### Everything is working when:
```bash
✅ npm run check:deploy passes
✅ npm run build succeeds
✅ curl /api/health returns {"status":"ok"}
✅ curl /api/keepalive returns {"status":"warm"}
✅ UptimeRobot shows 100% uptime
✅ Vercel dashboard shows no errors
```

---

## 🎯 Deployment Workflow (Summary)

```bash
# 1. Setup
openssl rand -base64 32 > jwt_secret.txt
# Copy to .env.local

# 2. Validate
npm run check:deploy

# 3. Deploy
npm run deploy

# 4. Configure Vercel
# Add environment variables in dashboard

# 5. Setup Database
npm run setup:indexes

# 6. Monitor
# Setup UptimeRobot

# 7. Test
curl https://your-app.vercel.app/api/health
```

**Total time: 15 minutes** ⏱️

---

**Your app is ready! Deploy with confidence! 🚀**
