# Quick Start Guide - QEase

## 🚀 Get Running in 5 Minutes

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment
Create `backend/.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qease
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:5173
```

**Note**: If you don't have MongoDB installed locally, use MongoDB Atlas (free):
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Replace MONGODB_URI with your connection string

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Configure Frontend Environment
Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
=================================
QEase Server Running
Port: 5000
Environment: development
=================================
MongoDB Connected: localhost
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 6: Access the Application

Open your browser and go to: **http://localhost:5173**

## 🧪 Test the Application

### Create an Admin Account
1. Click "Sign Up"
2. Fill in details
3. Select "Business/Admin" as Account Type
4. Click "Sign Up"

### Create a User Account
1. Logout from admin account
2. Click "Sign Up" again
3. Fill in details
4. Select "Customer" as Account Type
5. Click "Sign Up"

### Admin Workflow
1. Login as admin
2. You'll be redirected to Admin Dashboard
3. (Queue creation can be done via API or add a form)

### User Workflow
1. Login as user
2. Browse available queues
3. Click "Join Queue" on any queue
4. View your position and estimated wait time
5. Wait for notification when called

## 📝 Sample API Calls

### Create a Queue (Admin Only)
```bash
curl -X POST http://localhost:5000/api/admin/queues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "General Service",
    "description": "Standard service queue",
    "avgServiceTime": 10
  }'
```

### Get All Queues
```bash
curl http://localhost:5000/api/queues
```

## 🔧 Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod`
- Or use MongoDB Atlas cloud database

### Port Already in Use
- Backend: Change PORT in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

### CORS Errors
- Ensure FRONTEND_URL in backend .env matches your frontend URL
- Default is http://localhost:5173

### Socket.io Connection Issues
- Check that VITE_SOCKET_URL matches your backend URL
- Ensure backend server is running

## 📱 Features to Test

✅ User Registration & Login  
✅ Admin Registration & Login  
✅ View Available Queues  
✅ Join a Queue  
✅ Real-time Position Updates  
✅ Admin Dashboard Statistics  
✅ Call Next Customer  
✅ Pause/Resume Queues  
✅ Complete Customers  
✅ Queue History  
✅ Toast Notifications  
✅ Responsive Design  

## 🎉 You're Ready!

Your QEase Smart Queue Management System is now running!

For detailed documentation, see [README.md](../README.md)

---

**Need Help?** Check the full README or open an issue on GitHub.
