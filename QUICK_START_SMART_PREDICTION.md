# 🚀 Quick Start - Smart Wait-Time Prediction

## Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Test in 3 Steps

### 1. Login as Customer
- URL: http://localhost:5173/login
- Email: `demo@customer.com`
- Password: `demo123`

### 2. Join a Queue
- Browse available queues
- Click "Join Queue" on any queue
- Confirm action

### 3. See Smart Prediction
You should see:
```
Your Position: #X

Estimated Wait Time: Y min

🕐 ~Y minutes  📈 medium confidence

✅ Smart Prediction powered by AI
• Based on recent service times
• Adjusted for current queue length
• Considers peak hours & trends
```

---

## Color Guide

- 🟢 **Green** = < 10 minutes (Quick!)
- 🟡 **Yellow** = 10-20 minutes (Moderate)
- 🔴 **Red** = > 20 minutes (Long wait)
- ✅ **Success** = No waiting time

---

## Confidence Levels

- 📈 **High**: 20+ completed services
- 📊 **Medium**: 5-19 completed services  
- 📉 **Low**: < 5 completed services

---

## API Endpoints

### Get Your Wait Time
```bash
GET /api/queues/:id/wait-time
Authorization: Bearer <token>
```

### Get Queue Statistics
```bash
GET /api/queues/:id/stats
```

---

## Key Files

### Backend
- `backend/utils/waitTimePredictor.js` - AI algorithm
- `backend/models/QueueEntry.js` - Schema with service times
- `backend/routes/queueRoutes.js` - API endpoints

### Frontend
- `frontend/src/components/common/SmartWaitTimeDisplay.jsx` - UI component
- `frontend/src/components/user/QueuePosition.jsx` - Integrated display
- `frontend/src/services/api.js` - API methods

---

## How It Works

1. **User joins queue** → System predicts wait time
2. **Algorithm calculates** → Uses position × avg service time
3. **Applies factors** → Peak hours, weekends, queue length
4. **Shows to user** → Color-coded with confidence
5. **Admin completes** → Records actual service time
6. **System learns** → Future predictions more accurate

---

## Customization

### Change Peak Hours
Edit `backend/utils/waitTimePredictor.js`:
```javascript
const isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16);
```

### Adjust Multipliers
```javascript
const peakMultiplier = isPeakHour ? 1.3 : 1.0;      // +30% during peak
const weekendMultiplier = isWeekend ? 1.15 : 1.0;   // +15% on weekends
```

### Modify Colors
Edit `frontend/src/components/common/SmartWaitTimeDisplay.jsx`:
```javascript
if (waitTime < 10) return 'success';   // Green threshold
if (waitTime <= 20) return 'warning';  // Yellow threshold
return 'error';                        // Red threshold
```

---

## Troubleshooting

### Not Seeing Smart Display?
1. Check browser console (F12) for errors
2. Verify both servers running
3. Restart frontend: `cd frontend && npm run dev`

### Predictions Inaccurate?
- Normal at first - system learns over time
- More completions = better accuracy
- Check confidence level badge

### API Errors?
- Ensure MongoDB running: `mongod`
- Check backend logs in terminal
- Verify .env file exists in backend/

---

## Documentation

- **Full Technical Guide**: `SMART_WAIT_TIME_FEATURE.md`
- **Testing Instructions**: `TEST_SMART_WAIT_TIME.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

---

## Success Checklist

After testing, verify:
- [ ] Joined queue successfully
- [ ] Saw position number
- [ ] Saw wait time with color
- [ ] Saw confidence badge
- [ ] Saw AI details box
- [ ] No console errors
- [ ] Real-time updates working

---

**That's it! Your Smart Wait-Time Prediction is ready!** 🎉

For detailed information, see the full documentation files.
