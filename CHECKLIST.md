# ✅ Deployment Checklist

Use this checklist to ensure smooth deployment to Vercel.

## 📋 Pre-Deployment

### Code Preparation
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] All environment variables documented
- [ ] Git repository initialized
- [ ] Code committed to GitHub
- [ ] `.env.local` added to `.gitignore`

### Dependencies
- [ ] All npm packages installed
- [ ] `package.json` has all dependencies
- [ ] No broken imports
- [ ] Build succeeds locally (`npm run build`)

---

## 🗄️ MongoDB Atlas Setup

### Account & Cluster
- [ ] MongoDB Atlas account created
- [ ] Free tier (M0) cluster created
- [ ] Cluster is running (green status)
- [ ] Region selected (closest to users)

### Security Configuration
- [ ] Database user created
- [ ] Strong password saved securely
- [ ] User has "Read and write" permissions
- [ ] Network access set to 0.0.0.0/0 (Allow from anywhere)
- [ ] IP whitelist confirmed

### Connection
- [ ] Connection string copied
- [ ] Password replaced in connection string
- [ ] Database name set to `knowledgehub`
- [ ] Connection tested locally
- [ ] Format: `mongodb+srv://user:pass@cluster.mongodb.net/knowledgehub`

---

## 🔑 API Keys & Secrets

### OpenAI
- [ ] OpenAI account created
- [ ] API key generated at platform.openai.com
- [ ] API key tested locally
- [ ] Billing set up (pay-as-you-go)
- [ ] Usage limits configured (optional)

### JWT Secret
- [ ] JWT secret generated (`openssl rand -base64 32`)
- [ ] Secret is at least 32 characters
- [ ] Secret saved securely

### Environment Variables Ready
```env
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-proj-...
JWT_SECRET=your-32-char-secret
NEXT_PUBLIC_URL=https://your-app.vercel.app
```

---

## 🚀 Vercel Deployment

### GitHub Setup
- [ ] Code pushed to GitHub
- [ ] Repository is accessible
- [ ] Main branch is up to date
- [ ] No sensitive data in repository

### Vercel Project
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Project imported from GitHub
- [ ] Framework preset set to Next.js
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`

### Environment Variables in Vercel
- [ ] `MONGODB_URI` added
- [ ] `OPENAI_API_KEY` added
- [ ] `JWT_SECRET` added
- [ ] `NEXT_PUBLIC_URL` added (update after first deploy)
- [ ] All variables applied to Production

### First Deployment
- [ ] Deploy button clicked
- [ ] Build succeeded (check logs)
- [ ] No build errors
- [ ] Deployment URL copied
- [ ] `NEXT_PUBLIC_URL` updated with real URL
- [ ] Redeployed with correct URL

---

## 🔥 Keep-Alive Setup (Critical!)

### UptimeRobot Account
- [ ] Account created at uptimerobot.com
- [ ] Email verified
- [ ] Logged into dashboard

### Monitor Configuration
- [ ] New monitor created
- [ ] Monitor type: HTTP(s)
- [ ] Name: "DocQuest Keep-Alive"
- [ ] URL: `https://your-app.vercel.app/api/keepalive`
- [ ] Monitoring interval: 5 minutes
- [ ] Alert contacts added (optional)
- [ ] Monitor is active (green)

### Verification
- [ ] `/api/keepalive` returns 200 OK
- [ ] Response shows "warm" status
- [ ] `/api/health` returns 200 OK
- [ ] UptimeRobot shows successful pings
- [ ] Monitor uptime is 100%

---

## 🧪 Testing Deployment

### Frontend Tests
- [ ] Homepage loads correctly
- [ ] Login page works
- [ ] Registration works
- [ ] Dashboard displays
- [ ] UI looks correct (no broken styles)
- [ ] Images load
- [ ] Dark mode toggles (if applicable)

### Authentication Tests
- [ ] Can create new account
- [ ] Can login with credentials
- [ ] JWT token is set
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Session persists on refresh

### Backend API Tests
- [ ] `/api/health` returns OK
- [ ] `/api/keepalive` returns warm status
- [ ] `/api/documents` returns data (when logged in)
- [ ] `/api/analytics` returns statistics
- [ ] `/api/auth/login` works
- [ ] `/api/auth/register` works

### Core Features
- [ ] File upload works (PDF)
- [ ] File upload works (DOCX)
- [ ] File upload works (TXT)
- [ ] File upload works (Images with OCR)
- [ ] Search returns results
- [ ] Document details display
- [ ] Document deletion works
- [ ] Deleted files section works

### Performance Tests
- [ ] Page load < 1 second
- [ ] API responses < 500ms
- [ ] File upload completes successfully
- [ ] No timeout errors
- [ ] No cold start delays (with UptimeRobot)

---

## 📊 Monitoring Setup

### Vercel Dashboard
- [ ] Analytics enabled
- [ ] Function logs accessible
- [ ] Error tracking reviewed
- [ ] Deployment history visible

### UptimeRobot Dashboard
- [ ] Monitor status is green
- [ ] Uptime percentage visible
- [ ] Response time tracked
- [ ] Alert settings configured

### Optional Monitoring
- [ ] Sentry for error tracking (optional)
- [ ] Google Analytics (optional)
- [ ] Custom analytics dashboard (optional)

---

## 🔒 Security Checklist

### Environment Variables
- [ ] No secrets in code
- [ ] `.env.local` in `.gitignore`
- [ ] All secrets in Vercel dashboard
- [ ] Environment variables not exposed to client

### Database Security
- [ ] MongoDB user has minimal required permissions
- [ ] Strong password used
- [ ] IP whitelist configured correctly
- [ ] No default credentials used

### Application Security
- [ ] JWT secret is strong (32+ chars)
- [ ] Passwords are hashed
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] CORS configured properly
- [ ] Rate limiting considered

---

## 📈 Performance Optimization

### Vercel Optimization
- [ ] Edge functions enabled
- [ ] Image optimization enabled (Next.js)
- [ ] Static assets cached
- [ ] Compression enabled (automatic)

### Database Optimization
- [ ] MongoDB indexes created:
  - [ ] Index on `userId`
  - [ ] Index on `deleted`
  - [ ] Index on `createdAt`
- [ ] Queries optimized
- [ ] Connection pooling configured

### Code Optimization
- [ ] Large dependencies reviewed
- [ ] Unused code removed
- [ ] Images optimized
- [ ] Bundle size checked

---

## 🎯 Post-Deployment

### Documentation
- [ ] Deployment URL documented
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Admin credentials saved securely

### User Communication
- [ ] Users informed of new URL
- [ ] Migration guide created (if applicable)
- [ ] Support channels set up
- [ ] Feedback mechanism in place

### Ongoing Maintenance
- [ ] Monitor UptimeRobot weekly
- [ ] Check Vercel function logs
- [ ] Review MongoDB usage
- [ ] Monitor OpenAI API costs
- [ ] Update dependencies monthly

---

## ⚠️ Troubleshooting

If something goes wrong, check:

### Build Failures
- [ ] Check Vercel build logs
- [ ] Verify all dependencies in package.json
- [ ] Test build locally: `npm run build`
- [ ] Check for TypeScript errors

### Runtime Errors
- [ ] Check Vercel function logs
- [ ] Verify environment variables
- [ ] Test API endpoints individually
- [ ] Check MongoDB connection

### Performance Issues
- [ ] Verify UptimeRobot is running
- [ ] Check function execution time
- [ ] Review MongoDB query performance
- [ ] Check OpenAI API response times

### Database Issues
- [ ] Verify connection string
- [ ] Check IP whitelist
- [ ] Verify user permissions
- [ ] Test connection from Vercel

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Application loads in < 1 second
- ✅ All features work correctly
- ✅ No console errors
- ✅ API responses < 500ms
- ✅ UptimeRobot shows 100% uptime
- ✅ No cold starts experienced
- ✅ File uploads work smoothly
- ✅ Search returns accurate results
- ✅ Authentication flows correctly
- ✅ Mobile responsive

---

## 📞 Support Resources

If you need help:

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Next.js Docs**: https://nextjs.org/docs
- **OpenAI API Docs**: https://platform.openai.com/docs
- **UptimeRobot Support**: https://uptimerobot.com/support

---

## 🚀 You're Ready!

Once all items are checked, your DocQuest app is:
- ⚡ Production-ready
- 🔥 Optimized for performance
- 💰 Cost-effective
- 🌍 Globally distributed
- 🔒 Secure

**Congratulations on your deployment! 🎉**

---

**Last Updated**: Ready for deployment
**Next Review**: After first deployment
