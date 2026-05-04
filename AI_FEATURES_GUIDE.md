# QEase - AI-Powered Smart Queue Management System

## 🎉 What's New: AI Features

QEase has been upgraded with cutting-edge AI and automation features to provide an intelligent queue management experience!

---

## 🚀 New AI-Powered Features

### 1. **AI-Based Wait Time Prediction**
- **ML-Powered Predictions**: Uses Linear Regression trained on historical queue data
- **Smart Factors**: Considers queue length, service time, peak hours, weekends, and crowd patterns
- **Confidence Levels**: Shows prediction confidence (High/Medium/Low) based on data availability
- **Automatic Fallback**: Uses rule-based algorithm when insufficient ML data exists

**How it works:**
- ML model trains automatically on completed queue entries (last 30 days)
- Predictions update in real-time as queue status changes
- Displays factors affecting the prediction (peak hours, weekend, etc.)

### 2. **SMS & Email Notifications** (Mock Mode for Demo)
- **Join Notifications**: Automatic alerts when user joins a queue
- **Near-Turn Alerts**: Notifications when user's turn is approaching
- **Mock Implementation**: Logs notifications to console for demo purposes
- **Ready for Production**: Easy to integrate real Twilio/Nodemailer credentials

**Notification Types:**
- SMS (when phone number provided)
- Email (always sent)
- All notifications logged to database for tracking

### 3. **QR Code Check-In System**
- **Auto-Generation**: QR code created automatically when joining queue
- **Mobile Scanning**: Camera-based QR scanner using html5-qrcode
- **Manual Input**: Fallback option to enter QR code manually
- **Instant Validation**: Real-time check-in verification
- **Download Option**: Save QR code as image for offline use

**How to use:**
1. Join a queue → Click "Show QR Code" button
2. Download or display QR code
3. Scan at venue using QR Scanner page
4. Automatic check-in confirmation

### 4. **AI Chatbot Assistant**
- **Natural Language**: Ask questions in plain English
- **Smart Intents**: Detects user intent from messages
- **Quick Actions**: Pre-built buttons for common questions
- **Conversation History**: Tracks all interactions

**Supported Commands:**
- "What's my position?" → Shows current queue position
- "How long to wait?" → Provides estimated wait time
- "Queue status" → Shows crowd information
- "Best time to visit?" → Gets time recommendations
- "Help" → Shows all available commands

### 5. **Location & Time-Based Queue Optimization**
- **Crowd Analysis**: Analyzes historical patterns by hour
- **Smart Recommendations**: Suggests best times to visit
- **Forecast Display**: Shows next 6 hours crowd forecast
- **Scoring System**: Ranks times by crowd level and wait time

**Recommendation Levels:**
- Excellent: Low crowd, short wait (< 15 mins)
- Good: Moderate crowd, reasonable wait (< 30 mins)
- Moderate: Higher crowd, longer wait (< 45 mins)
- Busy: Peak times, expect delays

---

## 📡 New API Endpoints

### AI & Prediction
```
POST   /api/ai/predict-wait-time       - Get ML-powered wait time prediction
POST   /api/ai/notify-user             - Send SMS/Email notification
GET    /api/ai/recommend-time/:queueId - Get time recommendations
POST   /api/ai/train-model/:queueId    - Train ML model (Admin only)
```

### QR Code System
```
POST   /api/ai/generate-qr             - Generate QR code for entry
GET    /api/ai/my-qr                   - Get current user's QR code
POST   /api/ai/scan-qr                 - Validate and process QR scan
```

### Chatbot
```
POST   /api/ai/chatbot                 - Send message to chatbot
GET    /api/ai/chat-history            - Get conversation history
```

### Location
```
POST   /api/ai/location                - Update user location
```

---

## 🗂️ Database Models

### Enhanced QueueEntry Model
New fields added:
- `qrCode`: Unique QR code data
- `checkedIn`: Check-in status
- `checkedInAt`: Check-in timestamp
- `notificationSent`: Track sent notifications
- `userLocation`: GPS coordinates (optional)
- `predictedWaitTime`: ML prediction result
- `confidence`: Prediction confidence level

### New Models
- **NotificationLog**: Tracks all SMS/Email notifications
- **ChatSession**: Stores chatbot conversation history

---

## 🎨 Frontend Components

### New Components
- `ChatBot.jsx`: Floating AI chatbot widget
- `QRCodeDisplay.jsx`: QR code generation and download
- `PredictionDisplay.jsx`: AI prediction visualization
- `QRScanner.jsx`: Camera-based QR scanning page

### Enhanced Components
- `UserDashboard.jsx`: Integrated predictions and QR codes
- `Navbar.jsx`: Added QR Scanner navigation link
- `api.js`: Added AI API service methods

---

## 🔧 Technical Architecture

### Backend Structure
```
backend/
├── controllers/
│   └── aiController.js          # AI feature endpoints
├── services/
│   ├── notificationService.js   # SMS/Email notifications
│   ├── qrService.js             # QR code generation/validation
│   ├── chatbotService.js        # AI chatbot logic
│   └── locationService.js       # Time recommendations
├── utils/
│   ├── mlPredictor.js           # Linear Regression ML model
│   └── waitTimePredictor.js     # Updated with ML integration
├── models/
│   ├── NotificationLog.js       # Notification tracking
│   └── ChatSession.js           # Chat history
└── routes/
    └── aiRoutes.js              # AI API routes
```

### ML Model Details
- **Algorithm**: Simple Linear Regression (closed-form solution)
- **Features**: Position, service time, hour, weekend, peak hours
- **Training**: Automatic on-demand with 30-day historical data
- **Caching**: In-memory cache with 1-hour refresh
- **Fallback**: Rule-based prediction when data insufficient

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🧪 Testing Features

### Test AI Predictions
1. Login as user
2. Join any queue
3. View AI prediction on dashboard
4. Check confidence level and factors

### Test QR Code System
1. Join a queue
2. Click "Show QR Code"
3. Download QR code
4. Navigate to QR Scanner page
5. Use manual input to paste QR data
6. Verify check-in success

### Test Chatbot
1. Click chat icon (bottom-right)
2. Try quick action buttons
3. Ask: "What's my position?"
4. Ask: "How long to wait?"

### Test Notifications
1. Check backend console logs
2. Join queue → See SMS/Email mock logs
3. Logs stored in NotificationLog collection

### Test Time Recommendations
```bash
# Using API
curl -X GET http://localhost:5000/api/ai/recommend-time/{queueId} \
  -H "Authorization: Bearer {token}"
```

---

## 🔐 Environment Variables

```env
# Notification Services (Mock mode)
TWILIO_ACCOUNT_SID=mock_sid
TWILIO_AUTH_TOKEN=mock_token
TWILIO_PHONE_NUMBER=+1234567890
EMAIL_USER=mock@email.com
EMAIL_PASS=mock_password

# Demo Mode
DEMO_MODE=true
MOCK_NOTIFICATIONS=true
```

---

## 📊 Demo Mode

The system runs in **demo mode** by default:
- Notifications logged to console (not sent)
- Mock QR codes generated
- All features functional without external APIs
- Ready for production with real credentials

### Switch to Production
1. Add real Twilio credentials
2. Add real Email credentials
3. Set `MOCK_NOTIFICATIONS=false`
4. Update notificationService.js to use real APIs

---

## 🎯 Key Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| ML Predictions | ✅ Active | Linear Regression with auto-training |
| SMS Notifications | ✅ Mock | Console logging, ready for Twilio |
| Email Notifications | ✅ Mock | Console logging, ready for Nodemailer |
| QR Code Generation | ✅ Active | Auto-generated on join |
| QR Code Scanning | ✅ Active | Camera + manual input |
| AI Chatbot | ✅ Active | Rule-based NLP |
| Time Recommendations | ✅ Active | Crowd analysis & forecasting |
| Real-time Updates | ✅ Active | Socket.io integration |
| Location Support | ✅ Active | Optional GPS tracking |

---

## 🛠️ Development

### Add Real SMS/Email
Update `backend/services/notificationService.js`:
```javascript
// Replace mock with real implementation
const twilio = require('twilio');
const nodemailer = require('nodemailer');
// ... implement actual sending logic
```

### Retrain ML Model
```bash
curl -X POST http://localhost:5000/api/ai/train-model/{queueId} \
  -H "Authorization: Bearer {admin_token}"
```

### Customize Chatbot
Edit `backend/services/chatbotService.js`:
- Add new intents in `detectIntent()`
- Add responses in `generateResponse()`

---

## 📈 Future Enhancements

- [ ] Integrate real Twilio API for SMS
- [ ] Add push notifications (Firebase)
- [ ] Implement voice assistant (Web Speech API)
- [ ] Add geofencing for auto check-in
- [ ] Advanced ML models (Random Forest, Neural Networks)
- [ ] A/B testing for prediction accuracy
- [ ] Admin analytics dashboard
- [ ] Multi-language chatbot support

---

## 📚 Documentation

- [Project README](README.md)
- [Quick Start Guide](QUICKSTART.md)
- [Features Summary](FEATURES_UPDATE_SUMMARY.md)
- [Smart Wait Time](SMART_WAIT_TIME_FEATURE.md)

---

## 🤝 Support

For issues or questions:
1. Check console logs for errors
2. Verify MongoDB is running
3. Ensure all dependencies installed
4. Check `.env` configuration

---

**Built with ❤️ using Node.js, React, MongoDB, and AI**
