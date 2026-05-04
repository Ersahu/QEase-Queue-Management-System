# 🗑️ Database Reset Guide

## Quick Reset (Windows)

### Method 1: Use the Reset Script (Easiest)

```bash
# Double-click this file or run in terminal:
reset-database.bat
```

This will:
1. Drop the entire `qease` database
2. Create fresh demo data
3. Give you new login credentials

---

### Method 2: Manual Reset via Command Line

```bash
# Step 1: Stop your backend server (Ctrl+C)

# Step 2: Open MongoDB shell
mongosh

# Step 3: In MongoDB shell, run:
use qease
db.dropDatabase()
exit

# Step 4: Re-seed with demo data
cd backend
npm run seed

# Step 5: Restart your application
npm run dev
```

---

### Method 3: Using MongoDB Compass

1. **Open MongoDB Compass**
2. **Connect** to your MongoDB instance
3. **Find** the `qease` database in the left sidebar
4. **Click** the trash icon next to `qease`
5. **Confirm** deletion
6. **Run seed script**:
   ```bash
   cd backend
   npm run seed
   ```

---

### Method 4: Using MongoDB Atlas (Cloud)

If you're using MongoDB Atlas:

1. **Login** to MongoDB Atlas
2. **Go to** Database Deployments
3. **Click** "Browse Collections" on your cluster
4. **Select** the `qease` database
5. **Drop** all collections:
   - Click on each collection
   - Click "Drop Collection"
   - Confirm
6. **OR** drop entire database:
   - Click the three dots next to `qease` database
   - Select "Drop Database"
7. **Run seed script** locally:
   ```bash
   cd backend
   npm run seed
   ```

---

## ✅ After Reset - Fresh Credentials

Once you've reset the database and run `npm run seed`, you'll have:

### **Demo Admin Account**
- **Email**: `demo@admin.com`
- **Password**: `demo123`
- **Role**: Admin
- **Queues**: 3 pre-created queues

### **Demo Customer Account**
- **Email**: `demo@customer.com`
- **Password**: `demo123`
- **Role**: Customer

### **Demo Queues Created**
1. 🏥 General Consultation (15 min avg)
2. 💇 VIP Service (10 min avg)
3. 📋 Follow-up Visit (8 min avg)

---

## 🔍 Verify Reset Worked

### Check in MongoDB:
```bash
mongosh
> use qease
> show collections
# Should see: users, queues, queueentries

> db.users.countDocuments()
# Should return: 2 (admin + customer)

> db.queues.countDocuments()
# Should return: 3 (demo queues)

> exit
```

### Check in Application:
1. **Start backend**: `npm run dev`
2. **Start frontend**: `npm run dev` (in another terminal)
3. **Login** with demo credentials
4. **Verify** you can see queues and features work

---

## ⚠️ Important Notes

### What Gets Deleted:
- ✅ All user accounts (except recreated demo accounts)
- ✅ All queues
- ✅ All queue entries/history
- ✅ All authentication tokens

### What Stays Intact:
- ✅ Application code
- ✅ Configuration files
- ✅ Environment variables (.env)
- ✅ Package dependencies
- ✅ Frontend build files

### Safety:
- The reset is **IRREVERSIBLE** - all data will be lost
- Make sure you really want to delete everything
- Demo data will be recreated automatically
- No need to reinstall dependencies

---

## 🐛 Troubleshooting

### "mongosh: command not found"
**Solution**: Install MongoDB Shell
```bash
# Windows: Download from mongodb.com/try/download/shell
# Or use MongoDB Compass instead
```

### "Could not connect to MongoDB"
**Solution**: Start MongoDB first
```bash
# Local MongoDB
mongod

# Then run reset in another terminal
```

### "Seed script fails"
**Solution**: Check your .env file
```bash
# Make sure backend/.env exists with correct MONGODB_URI
cat backend/.env
```

### "Collections still exist after drop"
**Solution**: Force drop
```bash
mongosh
> use qease
> db.dropDatabase({force: true})
> exit
```

---

## 🎯 When to Reset Database

**Good reasons to reset:**
- Testing from scratch
- Corrupted data
- Want clean demo environment
- Development testing
- Removed test data manually

**Don't reset if:**
- You have production data you need
- Users are actively using the system
- You haven't backed up important data

---

## 💡 Pro Tips

### Before Reset (Optional Backup):
```bash
# Export current data (if needed)
mongodump --db qease --out ./backup
```

### After Reset:
```bash
# Verify everything works
cd backend
npm run dev

# In another terminal
cd frontend
npm run dev

# Test login with demo credentials
```

### Automate Regular Resets (Development):
Add to `backend/package.json`:
```json
{
  "scripts": {
    "reset": "node -e \"require('mongoose').connect(process.env.MONGODB_URI).then(() => mongoose.connection.db.dropDatabase()).then(() => console.log('Dropped')).catch(console.error)\" && npm run seed"
  }
}
```

---

## ✨ Summary

**To reset your database:**

1. **Stop** your backend server
2. **Run**: `reset-database.bat` (Windows) OR follow manual steps
3. **Wait** for seeding to complete
4. **Restart** your application
5. **Login** with fresh demo credentials

**That's it!** Your QEase system is now back to a clean state with demo data. 🎉

