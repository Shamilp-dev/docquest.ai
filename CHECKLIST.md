# ✅ GridFS Deployment Checklist

Print this out and check off each item as you complete it!

---

## 📋 PRE-DEPLOYMENT

### Code Implementation
- [x] GridFS helper created (`lib/gridfs.ts`)
- [x] Upload route updated for GridFS
- [x] Download route created
- [x] Delete route enhanced for GridFS
- [x] All routes have proper exports

### Documentation
- [x] README_GRIDFS.md created
- [x] GRIDFS_SETUP.md created
- [x] DEPLOYMENT_CHECKLIST.md created
- [x] ARCHITECTURE.md created
- [x] Scripts created and tested

---

## 🧪 LOCAL TESTING

### Environment Setup
- [ ] `.env.local` file exists
- [ ] `MONGODB_URI` is set
- [ ] `OPENAI_API_KEY` is set
- [ ] `NEXTAUTH_SECRET` is set

### Build Test
- [ ] Run `npm install` (if needed)
- [ ] Run `npm run build` successfully
- [ ] No errors in build output

### Local Dev Test
- [ ] Run `npm run dev`
- [ ] Can access http://localhost:3000
- [ ] Can log in to application
- [ ] Upload test file succeeds
- [ ] File appears in documents list
- [ ] Download file works
- [ ] Check MongoDB Atlas for `uploads.files` collection

---

## 🚀 VERCEL DEPLOYMENT

### Environment Variables
Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

- [ ] `MONGODB_URI` added
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/knowledgehub`
- [ ] `OPENAI_API_KEY` added
  - Format: `sk-...`
- [ ] `NEXTAUTH_SECRET` added
  - Use same value from `.env.local`
- [ ] `NEXTAUTH_URL` added
  - Format: `https://your-app.vercel.app`

For each variable:
- [ ] Check ✅ Production
- [ ] Check ✅ Preview
- [ ] Check ✅ Development

### MongoDB Atlas Configuration
- [ ] Cluster is running
- [ ] Database user has readWrite permissions
- [ ] Network Access allows 0.0.0.0/0 (or Vercel IPs)
- [ ] Connection string is correct

### Git & Deploy
- [ ] All files staged: `git add .`
- [ ] Committed with message: `git commit -F COMMIT_MESSAGE.txt`
- [ ] Pushed to repository: `git push`
- [ ] Vercel deployment started automatically

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### Build Check
- [ ] Vercel build succeeded (no errors)
- [ ] Check deployment logs for warnings
- [ ] Function sizes are within limits

### Functionality Test
- [ ] Visit production URL
- [ ] Can log in successfully
- [ ] Upload a test file
  - [ ] Small file (< 1MB)
  - [ ] Medium file (1-5MB)
  - [ ] Large file (5-50MB)
- [ ] Files appear in documents list
- [ ] Download files successfully
- [ ] Delete works (soft delete)
- [ ] Permanent delete works (if implemented)

### Database Verification
In MongoDB Atlas Dashboard:

- [ ] Collection `uploads.files` exists
- [ ] Collection `uploads.chunks` exists
- [ ] Documents in `documents` collection have `gridfsId` field
- [ ] File metadata looks correct in `uploads.files`

### Log Verification
- [ ] No "ENOENT" errors in Vercel logs
- [ ] No filesystem-related errors
- [ ] No MongoDB connection errors
- [ ] Upload logs show "File uploaded to GridFS"

---

## 🐛 TROUBLESHOOTING

If something doesn't work, check:

### Build Failures
- [ ] All environment variables are set in Vercel
- [ ] MONGODB_URI format is correct
- [ ] No syntax errors in code

### Upload Failures
- [ ] MongoDB Atlas allows connections from 0.0.0.0/0
- [ ] Database user has correct permissions
- [ ] MONGODB_URI is correct and accessible
- [ ] File size is under 50MB limit

### Download Failures
- [ ] Document has `gridfsId` field
- [ ] User is authenticated
- [ ] File exists in GridFS (`uploads.files`)

### Performance Issues
- [ ] Check Vercel function execution time
- [ ] Verify file sizes are reasonable
- [ ] Check MongoDB Atlas performance metrics

---

## ✨ SUCCESS INDICATORS

You know it's working when:

- ✅ Upload returns `{ success: true, file: { gridfsId: "..." } }`
- ✅ Files appear in MongoDB `uploads.files` collection
- ✅ Download streams file correctly
- ✅ No filesystem errors in logs
- ✅ Users can upload, view, and download files

---

## 📞 SUPPORT

If you need help:

1. Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) troubleshooting
2. Review Vercel logs: `vercel logs`
3. Check MongoDB Atlas logs
4. Verify environment variables match `.env.local`

---

## 🎉 COMPLETION

- [ ] All tests pass
- [ ] Production is live
- [ ] Users can upload/download files
- [ ] No errors in logs
- [ ] Documentation is updated

**Congratulations! Your app is now serverless-ready! 🚀**

---

Date Completed: _______________
Deployed By: _______________
Production URL: _______________
