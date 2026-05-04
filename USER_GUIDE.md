# QEase - User Guide

## 🎯 How It Works

### For Business Owners (Admin)

#### Step 1: Sign Up as Admin
1. Go to http://localhost:5173
2. Click "Sign Up"
3. Fill in your details
4. **Important**: Select **"Business/Admin"** as Account Type
5. Click "Sign Up"

#### Step 2: Create Your First Queue
After logging in as admin, you'll see the Admin Dashboard:

1. If you have no queues, you'll see a big **"Create Your First Queue"** button
2. If you already have queues, click **"Create New Queue"** button (top right)
3. Fill in the queue details:
   - **Queue Name**: e.g., "General Consultation", "VIP Service", "Express Check-in"
   - **Description**: Brief description of the service
   - **Average Service Time**: How long each customer takes (in minutes)
4. Click "Create Queue"

#### Step 3: Manage Your Queues
Once queues are created:

- **View Statistics**: See total waiting, called, and served customers
- **Switch Between Queues**: Use tabs if you have multiple queues
- **Call Next Customer**: Click "Call Next" to serve the next person
- **Complete Customer**: After serving, click "Complete" to mark them done
- **Pause Queue**: Temporarily stop accepting new customers
- **Resume Queue**: Start accepting customers again
- **Remove Customer**: Remove someone from the queue if needed

#### Step 4: Monitor Real-Time
- Dashboard updates automatically when customers join
- See live statistics
- Customer list updates in real-time

---

### For Customers (Users)

#### Step 1: Sign Up as Customer
1. Go to http://localhost:5173
2. Click "Sign Up"
3. Fill in your details
4. **Important**: Select **"Customer"** as Account Type
5. Click "Sign Up"

#### Step 2: Browse Available Queues
After logging in:
- You'll see all active queues created by businesses
- Each queue shows:
  - Queue name and description
  - Number of people waiting
  - Average service time
  - Status (Active/Paused)

#### Step 3: Join a Queue
1. Click **"Join Queue"** on any available queue
2. Confirm your choice in the dialog
3. You'll receive:
   - Your position number (e.g., #3)
   - Estimated wait time (e.g., ~15 min)
   - Real-time updates as your position changes

#### Step 4: Wait for Your Turn
- Your position is displayed prominently
- Watch the progress bar
- Estimated wait time updates automatically
- **You'll get a notification** when you're being called!

#### Step 5: Get Served
- When the admin calls you, you'll see a success notification
- Your status changes to "Being Called"
- Go to the service location
- After service, the admin marks you as "Completed"

#### Step 6: View History
- Click "History" in the navigation
- See all your past queue experiences
- View wait times and dates

---

## 🔄 Complete Workflow Example

### Scenario: Doctor's Clinic

**Admin (Clinic Staff):**
1. Signs up as Admin
2. Creates queue: "General Consultation" (15 min avg)
3. Creates queue: "Follow-up Visit" (10 min avg)
4. Starts managing patients

**Customer (Patient):**
1. Signs up as Customer
2. Sees two queues available
3. Joins "General Consultation" queue
4. Gets position #5, estimated wait 75 minutes
5. Waits at home or nearby
6. Receives notification when position is #1
7. Goes to clinic when called
8. Gets consultation
9. Checks history later to see visit details

---

## 💡 Tips

### For Admins:
- **Set accurate service times**: This helps customers get realistic wait estimates
- **Pause during breaks**: Stop new joins when you're unavailable
- **Monitor dashboard**: Keep track of queue lengths
- **Multiple queues**: Create different queues for different services

### For Customers:
- **Check wait times**: Choose queues with shorter waits
- **Join early**: Get better positions
- **Stay online**: Receive real-time notifications
- **Check history**: Track your past visits

---

## 🎨 Features Overview

### Admin Dashboard Features:
✅ Create unlimited queues  
✅ Real-time statistics  
✅ Call next customer  
✅ Complete/Remove customers  
✅ Pause/Resume queues  
✅ Multi-queue management  
✅ Live customer list  

### User Dashboard Features:
✅ Browse all active queues  
✅ Join queues remotely  
✅ Real-time position tracking  
✅ Smart wait time predictions  
✅ Live notifications  
✅ Queue history  
✅ Leave queue anytime  

---

## 🔔 Notifications

You'll receive toast notifications for:
- Successful login/registration
- Joining a queue successfully
- Being called (customer)
- Queue updates
- Errors or issues

---

## 📱 Mobile Friendly

The application works perfectly on:
- Desktop computers
- Tablets
- Mobile phones

All features are accessible on any device!

---

## ❓ Common Questions

**Q: Can I join multiple queues?**  
A: Yes, but only one position per queue. You can't be twice in the same queue.

**Q: What happens if I close the browser?**  
A: You remain in the queue. Re-login to check your position.

**Q: Can admins see my personal info?**  
A: Admins see your name, email, and phone (if provided) for service purposes.

**Q: How accurate are wait times?**  
A: Very accurate! The system learns from actual service times and adjusts predictions.

**Q: Can I leave a queue after joining?**  
A: Yes! Click "Leave Queue" if you change your mind.

---

## 🚀 Getting Started Now

1. **Backend should be running**: `npm run dev` in backend folder
2. **Frontend should be running**: `npm run dev` in frontend folder
3. **Open browser**: http://localhost:5173
4. **Create admin account**: Sign up with "Business/Admin" role
5. **Create your first queue**: Use the "Create New Queue" button
6. **Create customer account**: Sign up with "Customer" role in another browser/incognito
7. **Test the flow**: Customer joins queue, admin manages it

Enjoy your smart queue management system! 🎉
