# 🚀 QEase - Complete Setup & Testing Guide

## Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Configure Environment

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://sahuvaibhav064_db_user:Hn7zg17RuCeo7yn6@cluster0.ebx0xun.mongodb.net/?appName=Cluster0
JWT_SECRET=qease-secret-key-change-in-production-2024
FRONTEND_URL=https://qease-queue-management-system-1.onrender.com
```

**Frontend (.env):**
```env
VITE_API_URL=https://qease-queue-management-system-1.onrender.com/api
VITE_SOCKET_URL=https://qease-queue-management-system-1.onrender.com
```

### Step 3: Seed Demo Data (Optional but Recommended!)

This creates demo users and queues for testing:

```bash
cd backend
npm run seed
```

**Demo Credentials:**
- **Admin**: demo@admin.com / demo123
- **Customer**: demo@customer.com / demo123

### Step 4: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Access the App

Open https://qease-queue-management-system-1.onrender.com in your browser!

---

## 🎯 Testing Scenarios

### Scenario 1: Admin Creates Queue (Cold Start)

1. **Login as Admin**
   - Email: demo@admin.com
   - Password: demo123
   - OR create new admin account

2. **First-Time Experience**
   - If no queues exist, you'll see "Create Your First Queue" button
   - Click it to open the creation form

3. **Create a Queue**
   - Queue Name: "General Consultation"
   - Service Type: Select from dropdown (🏥 Medical Clinic, 💇 Salon, etc.)
   - Description: "Standard consultation service"
   - Average Service Time: 15 minutes
   - Click "Create Queue"

4. **Verify**
   - Queue appears in dashboard
   - Statistics show 0 waiting, 0 called
   - "Create New Queue" button available for more queues

### Scenario 2: Customer Joins Queue

1. **Open Incognito/Private Window**
   - This simulates a different user

2. **Login as Customer**
   - Email: demo@customer.com
   - Password: demo123
   - OR create new customer account

3. **Browse Queues**
   - See all active queues with:
     - Service type icon (🏥, 💇, etc.)
     - Queue name
     - Number of people waiting
     - Average service time
     - Active/Paused status

4. **Join a Queue**
   - Click "Join Queue" on any queue
   - Confirm in dialog
   - See your position (#1, #2, etc.)
   - See estimated wait time

5. **Real-Time Updates**
   - Position updates automatically
   - Wait time recalculates
   - Notification when called

### Scenario 3: Admin Manages Customers

1. **Back to Admin Dashboard**
   - See customers in queue list
   - Each shows: Position, Name, Status, Wait Time

2. **Call Next Customer**
   - Click "Call Next" button
   - Customer receives notification
   - Status changes to "Called"

3. **Complete Service**
   - Click "Complete" on called customer
   - Customer removed from queue
   - Positions update for remaining customers
   - Statistics update

4. **Pause/Resume Queue**
   - Click "Pause" to stop new joins
   - Click "Resume" to accept customers again

---

## 📱 Feature Checklist

### ✅ Admin Features
- [ ] Create queues with service types
- [ ] View real-time statistics
- [ ] Call next customer
- [ ] Complete customer service
- [ ] Remove customers from queue
- [ ] Pause/Resume queues
- [ ] Switch between multiple queues
- [ ] See live customer list

### ✅ Customer Features
- [ ] Browse available queues
- [ ] See service type icons
- [ ] Join queues remotely
- [ ] View position in real-time
- [ ] See estimated wait times
- [ ] Receive notifications when called
- [ ] Leave queue if needed
- [ ] View queue history

### ✅ Real-Time Features
- [ ] Position updates instantly
- [ ] Wait time recalculates
- [ ] Notifications on events
- [ ] Queue status changes broadcast
- [ ] Multi-user synchronization

---

## 🔧 Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### Port Already in Use
```bash
# Change PORT in backend/.env
# Or kill process using port 5000
```

### Frontend Import Errors
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules
npm install
```

### Socket.io Not Connecting
- Ensure backend is running
- Check VITE_SOCKET_URL matches backend URL
- Verify CORS settings in backend

---

## 🎨 UI Enhancements Added

### Admin Dashboard
- ✨ Service type selection with icons
- ✨ Better empty state with CTA
- ✨ Improved queue creation form
- ✨ Real-time statistics cards

### User Dashboard
- ✨ Service type icons on queue cards
- ✨ Enhanced empty state with refresh button
- ✨ Better visual hierarchy
- ✨ Responsive grid layout

### Queue Cards
- ✨ Emoji icons for service types
- ✨ Live waiting count
- ✨ Active/Paused status badges
- ✨ Hover animations

---

## 📊 Database Schema Updates

The Queue model now supports:
```javascript
{
  name: String,
  description: String,
  serviceType: String, // NEW: 'clinic', 'salon', 'bank', etc.
  admin: ObjectId,
  isActive: Boolean,
  isPaused: Boolean,
  avgServiceTime: Number,
  totalServed: Number
}
```

---

## 🚀 Production Deployment Tips

### Backend (Render/Railway)
1. Set environment variables
2. Use MongoDB Atlas
3. Enable WebSocket support
4. Set strong JWT_SECRET

### Frontend (Vercel/Netlify)
1. Set VITE_API_URL to production backend
2. Set VITE_SOCKET_URL to production backend
3. Build with `npm run build`

---

## 🎉 Success Indicators

You'll know it's working when:

✅ Admin can create queues with service types  
✅ Customers see queues with icons  
✅ Real-time updates work across browsers  
✅ Notifications appear when called  
✅ Statistics update live  
✅ No "No queues available" on first login (after seeding)  

---

## 💡 Pro Tips

1. **Use Demo Data**: Run `npm run seed` for instant testing
2. **Test Real-Time**: Open admin and customer in different browsers
3. **Multiple Queues**: Create 2-3 queues to test tab switching
4. **Mobile Testing**: Use browser dev tools to test responsive design
5. **Network Throttling**: Test with slow connections

---

## 📞 Need Help?

- Check `README.md` for detailed documentation
- See `USER_GUIDE.md` for user workflows
- Review `QUICKSTART.md` for fast setup
- Check console logs for errors

---

**Happy Queue Managing! 🎊**
