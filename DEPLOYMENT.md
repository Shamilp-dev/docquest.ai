# 🚀 DocQuest Deployment Guide - Vercel Optimized

## 📋 Overview
This guide will help you deploy DocQuest to Vercel with optimal performance and zero cold starts.

**Deployment Stack:**
- ✅ Frontend: Vercel (Global CDN)
- ✅ Backend APIs: Vercel (Edge Functions)
- ✅ Database: MongoDB Atlas (Free tier)
- ✅ Keep-Alive: UptimeRobot (Free monitoring)

**Expected Performance:**
- Page loads: 200-500ms ⚡
- API calls: 100-300ms ⚡
- No cold starts with keep-alive setup
- Total cost: $0/month forever 💰

---

## 🎯 Step 1: Prepare MongoDB Atlas (5 minutes)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free, no credit card required)
3. Create a new project called "DocQuest"

### 1.2 Create Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select a cloud provider (AWS recommended)
4. Choose region closest to your users
5. Click "Create Cluster" (takes 3-5 minutes)

### 1.3 Configure Database Access
1. Go to "Database Access" tab
2. Click "Add New Database User"
3. Create username and strong password (save these!)
4. Set privileges to "Read and write to any database"
5. Click "Add User"

### 1.4 Configure Network Access
1. Go to "Network Access" tab
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String
1. Click "Database" in left menu
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `knowledgehub`

**Example:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/knowledgehub?retryWrites=true&w=majority
```

---

## 🚀 Step 2: Deploy to Vercel (10 minutes)

### 2.1 Push Code to GitHub
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Create GitHub repo and push
# (Follow GitHub instructions to create repo)
git remote add origin https://github.com/yourusername/docquest.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2.3 Add Environment Variables
Click "Environment Variables" and add these:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/knowledgehub?retryWrites=true&w=majority

OPENAI_API_KEY=sk-proj-your-key-here

JWT_SECRET=your-super-secret-jwt-key-min-32-chars

NEXT_PUBLIC_URL=https://your-app.vercel.app
```

**Important:** 
- Generate a strong JWT_SECRET: `openssl rand -base64 32`
- Get OpenAI API key from: https://platform.openai.com/api-keys
- You'll update NEXT_PUBLIC_URL after deployment

### 2.4 Deploy!
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Your app is live! 🎉

### 2.5 Update Environment Variable
1. After deployment, copy your Vercel URL (e.g., `https://docquest-xyz.vercel.app`)
2. Go to Settings → Environment Variables
3. Update `NEXT_PUBLIC_URL` with your actual URL
4. Redeploy (deployments → click three dots → redeploy)

---

## 🔥 Step 3: Setup Keep-Alive (Eliminate Cold Starts) (5 minutes)

### 3.1 Create UptimeRobot Account
1. Go to https://uptimerobot.com
2. Sign up (free, no credit card required)
3. Verify your email

### 3.2 Add Monitor
1. Click "Add New Monitor"
2. Configure:
   ```
   Monitor Type: HTTP(s)
   Friendly Name: DocQuest Keep-Alive
   URL: https://your-app.vercel.app/api/keepalive
   Monitoring Interval: 5 minutes
   ```
3. Click "Create Monitor"

### 3.3 Test Keep-Alive
Visit: `https://your-app.vercel.app/api/keepalive`

You should see:
```json
{
  "status": "warm",
  "message": "Functions are warm and ready! 🔥",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "endpoints": 2
}
```

### 3.4 Verify Health Check
Visit: `https://your-app.vercel.app/api/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "uptime": 12.345,
  "message": "🚀 Server is running!"
}
```

**That's it!** Your functions will now stay warm 24/7 with zero cold starts! 🎉

---

## ✅ Step 4: Verify Deployment

### 4.1 Check Frontend
Visit your Vercel URL and verify:
- [ ] Login page loads
- [ ] Can create account
- [ ] Dashboard loads
- [ ] UI looks correct

### 4.2 Check Backend
Test these endpoints:
- [ ] `GET /api/health` - Returns OK
- [ ] `GET /api/keepalive` - Returns warm status
- [ ] `POST /api/auth/login` - Can login
- [ ] `GET /api/documents` - Returns documents (after login)

### 4.3 Test Upload
- [ ] Upload a PDF file
- [ ] Upload an image (OCR test)
- [ ] Search for content
- [ ] View document details

---

## 📊 Performance Monitoring

### Monitor in Vercel Dashboard
1. Go to your project in Vercel
2. Click "Analytics" tab
3. Monitor:
   - Response times
   - Error rates
   - Traffic patterns

### Monitor in UptimeRobot
1. Go to UptimeRobot dashboard
2. See your monitor status
3. Get uptime percentage (should be 100%)

---

## 🔧 Troubleshooting

### Issue: Functions timing out
**Solution:** 
- Check Vercel function logs
- Reduce file size limits
- Optimize heavy operations
- Files taking >8s will timeout (especially large images with OCR)

### Issue: MongoDB connection errors
**Solution:**
- Verify MongoDB Atlas IP whitelist (0.0.0.0/0)
- Check connection string format
- Ensure database user has correct permissions
- Test connection string locally first

### Issue: OpenAI API errors
**Solution:**
- Verify API key is correct
- Check OpenAI account has credits
- Ensure API key has embeddings access

### Issue: Cold starts still happening
**Solution:**
- Verify UptimeRobot monitor is running
- Check interval is 5 minutes
- Visit /api/keepalive manually to test
- Check Vercel logs for errors

### Issue: Uploads failing
**Solution:**
- Check file size (<50MB)
- Verify file type is supported
- Check Vercel function logs
- For images: OCR can take 5-8 seconds

---

## 🎯 Performance Optimization Tips

### 1. Use Edge Functions (Vercel Pro)
If you upgrade to Vercel Pro ($20/month):
- Edge functions have lower latency
- Better global performance
- No cold starts on edge

### 2. Optimize Images
- Compress images before upload
- Use Next.js Image component
- Enable Vercel image optimization

### 3. Database Indexing
Add MongoDB indexes for faster queries:
```javascript
db.documents.createIndex({ userId: 1 })
db.documents.createIndex({ "embedding": 1 })
db.documents.createIndex({ deleted: 1 })
```

### 4. Caching Strategy
Add caching headers for static content:
```typescript
export const revalidate = 60; // Cache for 60 seconds
```

---

## 📈 Scaling Strategy

### When to Upgrade
Consider upgrading when:
- **Traffic > 100k requests/month**: Upgrade to Vercel Pro
- **Database > 500MB**: Upgrade MongoDB Atlas to M2 ($9/month)
- **Need longer timeouts**: Upgrade to Vercel Pro (60s timeout)

### Cost Projection
- **0-10k users**: $0/month (free tier)
- **10k-100k users**: ~$20/month (Vercel Pro)
- **100k+ users**: ~$50-100/month (Vercel Pro + MongoDB M2/M5)

---

## 🎉 Success!

Your DocQuest app is now deployed with:
✅ Lightning-fast performance (<300ms response times)
✅ Zero cold starts (thanks to UptimeRobot)
✅ Global CDN distribution
✅ Automatic SSL/HTTPS
✅ Continuous deployment from GitHub
✅ $0/month cost 💰

**Next Steps:**
1. Share your app URL with users
2. Monitor performance in Vercel dashboard
3. Set up custom domain (optional)
4. Enable Vercel Analytics (optional)
5. Add error tracking (Sentry, optional)

**Your app URL:** `https://your-app.vercel.app`

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Next.js Docs**: https://nextjs.org/docs
- **UptimeRobot Support**: https://uptimerobot.com/support

**Happy deploying! 🚀**
