# 🚀 Vercel Deployment Checklist - GridFS Edition

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
Make sure these are set in Vercel Dashboard (Settings → Environment Variables):

- [ ] `MONGODB_URI` - Your MongoDB Atlas connection string
- [ ] `OPENAI_API_KEY` - Your OpenAI API key
- [ ] `NEXTAUTH_SECRET` - Random secret for NextAuth
- [ ] `NEXTAUTH_URL` - Your production URL (e.g., https://docquest.vercel.app)

### 2. Code Changes
- [x] GridFS helper created (`lib/gridfs.ts`)
- [x] Upload route updated to use GridFS
- [x] Download route created
- [x] Delete route updated to remove from GridFS
- [x] All routes have `export const runtime = "nodejs"`
- [x] All routes have `export const dynamic = 'force-dynamic'`

### 3. MongoDB Atlas Setup
- [ ] MongoDB Atlas cluster is running
- [ ] Database user has read/write permissions
- [ ] Network Access allows connections from anywhere (0.0.0.0/0) for Vercel
- [ ] Connection string is correct in environment variables

### 4. Local Testing
```bash
# Run this script
bash scripts/test-gridfs.sh

# Or manually test
npm run build
npm run dev

# Then test upload:
# 1. Go to http://localhost:3000
# 2. Upload a file
# 3. Check MongoDB Atlas for 'uploads.files' collection
# 4. Try downloading the file
```

## 🚀 Deployment Steps

### Option 1: Automatic Deployment (Push to GitHub)
```bash
# Commit changes
git add .
git commit -m "feat: implement GridFS for Vercel compatibility"
git push

# Vercel will automatically deploy
```

### Option 2: Manual Deployment via Vercel CLI
```bash
# First time setup
npm i -g vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🔍 Post-Deployment Verification

### 1. Check Build Logs
- Go to Vercel Dashboard → Deployments
- Click on latest deployment
- Check build logs for errors

### 2. Test Upload Functionality
1. Visit your production URL
2. Log in
3. Upload a test file
4. Verify file appears in documents list
5. Try downloading the file
6. Check MongoDB Atlas for the file in `uploads.files`

### 3. Verify GridFS Collections
In MongoDB Atlas, check that these collections exist:
- `uploads.files` - File metadata
- `uploads.chunks` - File data chunks
- `documents` - Document metadata with `gridfsId` field

## ❗ Common Issues & Solutions

### Issue 1: Build fails with "MONGODB_URI not defined"
**Solution**: Add `MONGODB_URI` to Vercel environment variables
- Go to Settings → Environment Variables
- Add variable for Production, Preview, and Development

### Issue 2: Upload works but download fails
**Solution**: Check `gridfsId` field in documents
```javascript
// The document should have:
{
  gridfsId: "507f1f77bcf86cd799439011", // ObjectId as string
  // ... other fields
}
```

### Issue 3: Files not appearing in GridFS
**Solution**: Check MongoDB Atlas permissions
- Ensure user has `readWrite` role
- Network access allows 0.0.0.0/0

### Issue 4: Function timeout on large files
**Solution**: Already configured in `vercel.json`
```json
{
  "functions": {
    "app/api/upload/route.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

## 📊 Monitoring

### Check Function Logs
```bash
# Vercel CLI
vercel logs

# Or in dashboard
Vercel Dashboard → Project → Logs
```

### Monitor GridFS Usage
- Go to MongoDB Atlas Dashboard
- Click on your cluster
- Check "Metrics" for storage usage
- GridFS files count in Collections

## 🎉 Success Criteria

Your deployment is successful when:
- [x] Build completes without errors
- [x] Upload endpoint returns success
- [x] Files appear in MongoDB GridFS
- [x] Download works from production
- [x] No filesystem errors in logs
- [x] Users can upload and download files

## 📚 Additional Resources

- [MongoDB GridFS Documentation](https://www.mongodb.com/docs/manual/core/gridfs/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**Need Help?**
Check the logs in Vercel Dashboard or run `vercel logs` to see detailed error messages.
