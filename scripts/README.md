# Admin Management Scripts

This folder contains Node.js scripts for managing admin users in the docQuest.ai application.

## 📁 Available Scripts

### 1. `set-admin.js`
**Purpose:** Promote a user to admin role

**Usage:**
```bash
node scripts/set-admin.js <email>
```

**Example:**
```bash
node scripts/set-admin.js john@example.com
```

**Output:**
```
✓ Connected to MongoDB
✅ Successfully set user as admin:
   Email: john@example.com
   Username: john
   Role: admin
```

---

### 2. `remove-admin.js`
**Purpose:** Demote an admin to regular user role

**Usage:**
```bash
node scripts/remove-admin.js <email>
```

**Example:**
```bash
node scripts/remove-admin.js admin@example.com
```

**Output:**
```
✓ Connected to MongoDB
✅ Successfully removed admin role:
   Email: admin@example.com
   Username: admin
   New Role: user

⚠️  Note: User must log out and log in again for changes to take effect.
```

---

### 3. `list-users.js`
**Purpose:** List all users with their roles and status

**Usage:**
```bash
node scripts/list-users.js
```

**Output:**
```
✓ Connected to MongoDB

Found 3 user(s):

═══════════════════════════════════════════════════════════════════
1. 👑 admin
   Email:  admin@example.com
   Role:   admin
   Status: 🟢 Online
   Joined: 11/20/2024
───────────────────────────────────────────────────────────────────
2. 👤 john
   Email:  john@example.com
   Role:   user
   Status: ⚪ Offline
   Joined: 11/21/2024
───────────────────────────────────────────────────────────────────
3. 👤 jane
   Email:  jane@example.com
   Role:   user
   Status: 🟢 Online
   Joined: 11/22/2024
───────────────────────────────────────────────────────────────────

📊 Summary:
   Total Users:  3
   👑 Admins:     1
   👤 Users:      2
   🟢 Online:     2
```

---

## 🔧 Requirements

### Environment Variables
Create a `.env.local` file in the project root with:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Dependencies
These scripts use the following packages (already installed in your project):
- `mongoose` - MongoDB ORM
- `dotenv` - Environment variable loader

---

## 🚀 Quick Start

### First Time Setup

1. **Create a user account:**
   - Go to `http://localhost:3000/login`
   - Click "Sign Up" and create your account

2. **Make yourself admin:**
   ```bash
   node scripts/set-admin.js your-email@example.com
   ```

3. **Verify:**
   ```bash
   node scripts/list-users.js
   ```

4. **Log in as admin:**
   - Log out from the app
   - Log back in with your credentials
   - Access `http://localhost:3000/admin`

---

## ⚠️ Important Notes

### 1. Scripts Must Run from Project Root
```bash
# ✅ Correct
cd /path/to/discovery-search-app
node scripts/set-admin.js email@example.com

# ❌ Wrong
cd scripts
node set-admin.js email@example.com
```

### 2. Changes Require Re-login
After changing a user's role:
- The user must **log out** completely
- Then **log back in**
- JWT token needs to refresh with new role

### 3. Email is Case-Insensitive
```bash
# These are all the same user:
node scripts/set-admin.js John@Example.com
node scripts/set-admin.js john@example.com
node scripts/set-admin.js JOHN@EXAMPLE.COM
```

### 4. Keep at Least One Admin
Always maintain at least one admin account:
- Don't remove admin from yourself while logged in
- Don't remove admin from the last admin user
- You could lock yourself out of the admin panel!

---

## 🐛 Troubleshooting

### Error: "MONGODB_URI not found"
**Problem:** `.env.local` file missing or incomplete

**Solution:**
1. Check if `.env.local` exists in project root:
   ```bash
   ls -la .env.local
   ```
2. Verify it contains `MONGODB_URI`:
   ```bash
   cat .env.local | grep MONGODB_URI
   ```
3. Copy from `.env.local.example` if needed

---

### Error: "User not found with email: ..."
**Problem:** Email doesn't exist in database

**Solution:**
1. List all users to see available emails:
   ```bash
   node scripts/list-users.js
   ```
2. Use the exact email from the list
3. Verify user created account successfully

---

### Error: "Cannot connect to MongoDB"
**Problem:** Database connection issue

**Solution:**
1. Check if MongoDB is running (if self-hosted)
2. Verify `MONGODB_URI` is correct
3. Check network/firewall settings
4. Test connection with MongoDB Compass

---

### Script runs but admin panel still inaccessible
**Problem:** JWT token not refreshed

**Solution:**
1. Clear browser cookies:
   - DevTools (F12) → Application → Cookies
   - Delete `auth-token` cookie
2. Log out from app
3. Close all browser tabs
4. Log in again
5. Try accessing `/admin`

---

## 💡 Advanced Usage

### Batch Operations

**Make multiple users admin at once:**
```bash
# Create a file: admins.txt
cat > admins.txt << EOF
admin1@example.com
admin2@example.com
admin3@example.com
EOF

# Run batch promotion
while read email; do
  node scripts/set-admin.js "$email"
done < admins.txt
```

**Remove admin from multiple users:**
```bash
while read email; do
  node scripts/remove-admin.js "$email"
done < remove-admins.txt
```

---

### Verify Changes in MongoDB

**Using MongoDB Compass:**
1. Connect to your database
2. Navigate to `users` collection
3. Find the user document
4. Check `role` field is `"admin"`

**Using MongoDB Shell:**
```javascript
// Find specific user
db.users.findOne({ email: "admin@example.com" })

// Find all admins
db.users.find({ role: "admin" })

// Count admins
db.users.countDocuments({ role: "admin" })

// Update role manually
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

---

## 🎯 Common Tasks

### Check admin status quickly
```bash
node scripts/list-users.js | grep "👑"
```

### Count total admins
```bash
node scripts/list-users.js | grep "👑 Admins:" | awk '{print $3}'
```

### Find online admins
First run list-users, then look for lines with both 👑 and 🟢

---

## 📚 Related Documentation

- **Full Admin Guide:** `ADMIN_LOGIN_GUIDE.md`
- **Quick Reference:** `ADMIN_QUICK_REFERENCE.md`
- **Setup Summary:** `SETUP_SUMMARY.md`
- **Visual Diagrams:** `ADMIN_VISUAL_GUIDE.md`

---

## 🤝 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Read the troubleshooting section above
3. Verify `.env.local` configuration
4. Check MongoDB connection
5. Review related documentation

---

**Last Updated:** November 2024  
**Author:** Admin Management System  
**Version:** 1.0.0
