# 🧪 Smart Wait-Time Prediction - Quick Test Guide

## Prerequisites

Make sure your application is running:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

---

## Test Steps

### ✅ Test 1: Join Queue & See Smart Prediction

1. **Login as Customer**
   - Email: `demo@customer.com`
   - Password: `demo123`

2. **Browse Queues**
   - You should see available queues with emoji icons

3. **Join a Queue**
   - Click "Join Queue" on any queue
   - Confirm the action

4. **Verify Smart Display**
   - Should see your position number (e.g., #1, #2, #3)
   - Should see estimated wait time in minutes
   - **NEW:** Below that, you should see:
     - Color-coded chip: 🟢 Green (<10 min), 🟡 Yellow (10-20 min), 🔴 Red (>20 min)
     - Confidence badge: "medium confidence" or "high confidence"
     - AI details box showing:
       ```
       ✅ Smart Prediction powered by AI
       • Based on recent service times
       • Adjusted for current queue length
       • Considers peak hours & trends
       ```

5. **Expected Result:**
   - Position displays correctly
   - Wait time shows with color indicator
   - Smart prediction details visible

---

### ✅ Test 2: Verify API Response

Open browser console (F12) and check network tab:

1. **Join a queue**
2. **Look for API call:** `GET /api/queues/:id/wait-time`
3. **Check response:**
```json
{
  "success": true,
  "data": {
    "position": 2,
    "predictedWaitTime": 24,
    "avgServiceTime": 12,
    "confidence": "medium",
    "factors": {
      "baseWaitTime": 24,
      "peakHourAdjustment": false,
      "weekendAdjustment": false,
      "queueLengthFactor": 1.0
    },
    "joinedAt": "...",
    "estimatedCompletionTime": "..."
  }
}
```

4. **Expected:** All fields present with valid data

---

### ✅ Test 3: Admin Completes Customer → System Learns

1. **Login as Admin** (new tab/incognito)
   - Email: `demo@admin.com`
   - Password: `demo123`

2. **Go to Admin Dashboard**
   - Select the queue where customer joined

3. **Call Next Customer**
   - Click "Call Next" button
   - Customer status changes to "called"

4. **Complete the Customer**
   - Click "Complete" button
   - This records actual service time

5. **Switch back to Customer tab**
   - Refresh page
   - If still in queue, wait time should update
   - Check if position changed

6. **Expected:** 
   - Service time recorded in database
   - Future predictions will use this data
   - Real-time updates work via Socket.io

---

### ✅ Test 4: Color Indicators

Test different scenarios to see color changes:

**Green (< 10 minutes):**
- Join queue when only 1 person ahead
- Short average service time queue
- Should see 🟢 green chip

**Yellow (10-20 minutes):**
- Join queue with 2-3 people ahead
- Medium service time
- Should see 🟡 yellow chip

**Red (> 20 minutes):**
- Join busy queue with many people
- Long average service time
- Should see 🔴 red chip

---

### ✅ Test 5: Confidence Levels

**Low Confidence:**
- Join a brand new queue (no history)
- Should show "low confidence" badge

**Medium Confidence:**
- After 5-19 completions
- Should show "medium confidence"

**High Confidence:**
- After 20+ completions
- Should show "high confidence"

**To test quickly:**
1. As admin, simulate multiple completions
2. Use MongoDB Compass to verify data
3. Or just observe confidence badge change over time

---

### ✅ Test 6: Peak Hour Adjustment

**During Peak Hours (9-11 AM or 2-4 PM):**
1. Check wait time prediction
2. Compare with off-peak time
3. Should be ~30% higher during peak

**Example:**
- Off-peak: Position 3 × 10 min = 30 min
- Peak: 30 min × 1.3 = 39 min

---

### ✅ Test 7: Withdraw from Queue

1. **As customer**, while waiting:
2. Click "Withdraw from Queue" button
3. Confirm action
4. Should leave queue successfully
5. Position display disappears
6. Can join again if desired

---

### ✅ Test 8: Delete Queue (Admin Only)

1. **As admin**, go to dashboard
2. Hover over queue tab
3. Click trash icon (🗑️)
4. Confirm deletion
5. Queue removed from list
6. Customers in queue get notification

---

### ✅ Test 9: Auto-Redirect After Login

**Admin Login:**
1. Logout if logged in
2. Login as admin
3. Should redirect to `/admin/dashboard`
4. Should NOT open new tab

**Customer Login:**
1. Logout if logged in
2. Login as customer
3. Should redirect to `/dashboard`
4. Should NOT open new tab

---

## 🐛 Troubleshooting

### Issue: Smart Wait Time Not Showing

**Check:**
1. Browser console for errors (F12)
2. Network tab - is API call successful?
3. Component imported correctly?
4. Restart frontend dev server

**Fix:**
```bash
cd frontend
npm run dev
```

---

### Issue: Predictions Seem Inaccurate

**This is normal initially!** The system learns over time.

**After first few completions:**
- Predictions become more accurate
- Confidence level increases
- System adapts to real patterns

---

### Issue: Colors Not Showing

**Check:**
1. MUI components installed?
2. SmartWaitTimeDisplay.jsx exists?
3. Imported in QueuePosition.jsx?

**Verify imports:**
```javascript
import SmartWaitTimeDisplay from '../common/SmartWaitTimeDisplay';
```

---

### Issue: API Returns Error

**Check backend logs:**
```bash
# Terminal 1 output
```

**Common errors:**
- MongoDB not running → Start mongod
- Missing .env file → Create backend/.env
- Route not found → Check server.js routes

---

## 📊 Verify Database Changes

Connect to MongoDB and check:

```bash
mongosh
use qease

# Check QueueEntry schema has new fields
db.queueentries.findOne()

# Should see:
{
  _id: ObjectId(...),
  queue: ObjectId(...),
  user: ObjectId(...),
  position: 2,
  status: "waiting",
  joinedAt: ISODate(...),
  estimatedWaitTime: 24,
  actualServiceTime: null,  // Will populate after completion
  serviceStartedAt: null,   // Will populate when called
  completedAt: null         // Will populate when completed
}
```

---

## ✨ Success Checklist

After testing, you should have:

- [ ] Joined a queue and seen smart wait time display
- [ ] Seen color-coded indicators (green/yellow/red)
- [ ] Seen confidence badge
- [ ] Seen AI details breakdown
- [ ] Verified API returns prediction data
- [ ] Tested admin completing customers
- [ ] Observed real-time updates
- [ ] Tested withdraw from queue
- [ ] Tested delete queue (admin)
- [ ] Verified auto-redirect after login
- [ ] No console errors
- [ ] Smooth user experience

---

## 🎯 What to Look For

### Visual Indicators:

**Good:**
```
Your Position: #3

Estimated Wait Time: 36 min

🕐 ~36 minutes  📈 medium confidence

✅ Smart Prediction powered by AI
• Based on recent service times
• Adjusted for current queue length
• Considers peak hours & trends
```

**Colors:**
- 🟢 Green = Short wait (<10 min)
- 🟡 Yellow = Moderate wait (10-20 min)
- 🔴 Red = Long wait (>20 min)

---

## 🚀 Next Steps

Once verified working:

1. **Monitor accuracy** over time
2. **Collect feedback** from users
3. **Adjust multipliers** if needed
4. **Add more factors** (weather, events, etc.)
5. **Implement ML model** for Phase 2

---

## 📝 Notes

- Predictions improve with more data
- First few predictions may be less accurate
- System self-learns automatically
- No manual intervention needed
- Works in real-time via WebSockets

---

**All tests passed? Your Smart Wait-Time Prediction is working perfectly!** 🎉
