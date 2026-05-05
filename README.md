# QEase — AI-Powered Smart Queue Management System

> A production-ready, real-time queue management platform that lets users join queues remotely and businesses manage queues intelligently — powered by ML predictions, QR check-ins, and an AI chatbot assistant.

---

## 🌟 Features

### 👤 User Features
- **Remote Queue Joining** — Join any active queue from anywhere, no physical presence needed
- **Real-time Position Tracking** — Live updates on your current position via WebSocket
- **AI Wait Time Prediction** — ML-powered estimated wait times with confidence levels (High / Medium / Low)
- **QR Code Check-In** — Auto-generated QR code on join; scan at venue for instant check-in
- **AI Chatbot Assistant** — Natural-language assistant for position queries, wait times, and recommendations
- **Smart Time Recommendations** — Crowd analysis with 6-hour forecasts to find the best visit time
- **Live Notifications** — SMS & Email alerts when your turn is approaching (mock mode by default)
- **Queue Withdrawal** — Leave a queue at any time with a single click; positions auto-recalculate
- **Queue History** — View past queue experiences and wait times

### 🛠️ Admin Features
- **Multi-Queue Management** — Create, pause, resume, and delete service queues
- **Real-time Dashboard** — Live statistics, queue status, and customer management
- **Call Next / Complete** — Advance the queue with a single action
- **QR Check-In Display** — Generate and display a venue QR code; receive real-time check-in alerts
- **Delete Queue** — Safely remove queues (blocked if active customers are present)
- **Analytics** — Served count, peak time tracking, and performance metrics
- **ML Model Training** — Retrain the wait-time prediction model on demand

### ⚙️ Technical Features
- **Real-time Updates** — Bidirectional WebSocket communication via Socket.io
- **JWT Authentication** — Secure, role-based access (user / admin)
- **ML Predictions** — Linear Regression trained on 30-day historical queue data
- **QR Code System** — Camera-based scanning with manual-input fallback
- **Input Validation** — express-validator on all API inputs
- **Responsive Design** — Mobile-first, works across all screen sizes

---

## 🛠️ Tech Stack

### Backend
| Package | Purpose |
|---|---|
| Node.js + Express | Runtime & web framework |
| MongoDB + Mongoose | Database & ODM |
| Socket.io | Real-time bidirectional events |
| JSON Web Token (JWT) | Authentication |
| bcryptjs | Password hashing |
| qrcode | QR code generation |
| nodemailer | Email notifications |
| express-validator | Request validation |

### Frontend
| Package | Purpose |
|---|---|
| React 18 + Vite | UI library & build tool |
| Material-UI (MUI v5) | Component library |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Socket.io-client | WebSocket client |
| html5-qrcode | Camera-based QR scanning |
| qrcode.react | QR code rendering |
| React Hot Toast | Toast notifications |

---

## 📂 Project Structure

```
QEase/
├── backend/
│   ├── config/                  # Database configuration
│   ├── controllers/
│   │   ├── adminController.js   # Admin queue management
│   │   ├── authController.js    # Register / login
│   │   ├── userController.js    # User queue actions
│   │   └── aiController.js      # AI & QR endpoints
│   ├── middleware/              # Auth & role guards
│   ├── models/
│   │   ├── User.js
│   │   ├── Queue.js
│   │   ├── QueueEntry.js        # Includes QR, check-in & prediction fields
│   │   ├── NotificationLog.js   # SMS/Email tracking
│   │   └── ChatSession.js       # Chatbot history
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── userRoutes.js
│   │   └── aiRoutes.js
│   ├── services/
│   │   ├── notificationService.js  # SMS & Email (mock/prod)
│   │   ├── qrService.js            # QR generation & validation
│   │   ├── chatbotService.js       # NLP intent detection
│   │   └── locationService.js      # Crowd & time recommendations
│   ├── socket/                  # Socket.io event handlers
│   ├── utils/
│   │   ├── mlPredictor.js       # Linear Regression ML model
│   │   └── waitTimePredictor.js # ML + rule-based fallback
│   ├── seed.js                  # Demo data seeder
│   ├── server.js                # Entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBot.jsx           # Floating AI chatbot widget
│   │   │   ├── QRCodeDisplay.jsx     # QR generation & download
│   │   │   ├── PredictionDisplay.jsx # AI prediction visualization
│   │   │   └── admin/
│   │   │       └── AdminQRDisplay.jsx  # Venue QR for admin
│   │   ├── context/             # React context (auth, socket)
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Role-based post-login redirect
│   │   │   ├── Register.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── QRScanner.jsx    # Camera + manual QR scanner
│   │   ├── services/
│   │   │   └── api.js           # Axios + AI API methods
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v16 or higher
- **MongoDB** (local instance or Atlas)
- npm

### 1. Clone the Repository
```bash
git clone <repository-url>
cd QEase
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://sahuvaibhav064_db_user:Hn7zg17RuCeo7yn6@cluster0.ebx0xun.mongodb.net/?appName=Cluster0
JWT_SECRET=your-strong-secret-key
PORT=5000
FRONTEND_URL=https://q-ease-queue-management-system.vercel.app

# Notification Services (leave as mock for development)
TWILIO_ACCOUNT_SID=mock_sid
TWILIO_AUTH_TOKEN=mock_token
TWILIO_PHONE_NUMBER=+1234567890
EMAIL_USER=mock@email.com
EMAIL_PASS=mock_password
MOCK_NOTIFICATIONS=true
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=https://qease-queue-management-system-1.onrender.com/api
VITE_SOCKET_URL=https://qease-queue-management-system-1.onrender.com
```

### 4. Seed Demo Data (Optional)
```bash
cd backend
npm run seed
```

This creates demo accounts:
- **Admin** — `demo@admin.com` / `demo123`
- **Customer** — `demo@customer.com` / `demo123`

---

## ▶️ Running the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

| Service | URL |
|---|---|
| Frontend | https://qease-queue-management-system-1.onrender.com |
| Backend API | https://qease-queue-management-system-1.onrender.com |

---

## 📖 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | — |
| POST | `/api/auth/login` | Login | — |
| GET | `/api/auth/me` | Get current user | JWT |

### User Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/queues` | List all active queues | JWT |
| POST | `/api/users/queues/:id/join` | Join a queue | JWT |
| DELETE | `/api/users/queues/:id/leave` | Leave / withdraw from queue | JWT |
| GET | `/api/users/my-position` | Get current position | JWT |
| GET | `/api/users/history` | Get queue history | JWT |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Dashboard stats | Admin |
| POST | `/api/admin/queues` | Create queue | Admin |
| DELETE | `/api/admin/queues/:id` | Delete queue | Admin |
| POST | `/api/admin/queues/:id/call-next` | Call next customer | Admin |
| POST | `/api/admin/queues/:id/complete/:entryId` | Mark completed | Admin |
| POST | `/api/admin/queues/:id/pause` | Pause queue | Admin |
| POST | `/api/admin/queues/:id/resume` | Resume queue | Admin |
| DELETE | `/api/admin/queues/:queueId/customers/:entryId` | Remove customer | Admin |
| GET | `/api/admin/queues/:id/customers` | List queue customers | Admin |

### AI & QR Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/predict-wait-time` | ML wait time prediction | JWT |
| GET | `/api/ai/recommend-time/:queueId` | Best-time recommendations | JWT |
| POST | `/api/ai/train-model/:queueId` | Retrain ML model | Admin |
| POST | `/api/ai/generate-qr` | Generate QR for entry | JWT |
| GET | `/api/ai/my-qr` | Get current user's QR | JWT |
| POST | `/api/ai/scan-qr` | Validate & process user QR | JWT |
| POST | `/api/ai/checkin-admin-qr` | Check in via venue QR | JWT |
| POST | `/api/ai/chatbot` | Send chatbot message | JWT |
| GET | `/api/ai/chat-history` | Get chatbot history | JWT |
| POST | `/api/ai/notify-user` | Send SMS/Email notification | JWT |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/queues` | List all active queues |
| GET | `/api/queues/:id` | Get queue by ID |

---

## 🤖 AI Features

### ML Wait Time Prediction
- **Algorithm**: Linear Regression (closed-form, no external ML library)
- **Features**: Queue position, average service time, current hour, weekend flag, peak-hour flag
- **Training**: Automatically trained on the last 30 days of completed entries; retrained on-demand
- **Caching**: In-memory model cache with 1-hour refresh
- **Fallback**: Rule-based estimation when training data is insufficient

### AI Chatbot
Floating widget accessible from any page. Supports natural-language queries:

| Example Query | Response |
|---|---|
| "What's my position?" | Current queue position |
| "How long do I have to wait?" | ML-predicted wait time |
| "Queue status" | Crowd level info |
| "Best time to visit?" | Next 6-hour crowd forecast |
| "Help" | All supported commands |

### Smart Time Recommendations
- Analyzes historical entry patterns by hour
- Scores time slots by crowd level and predicted wait time
- Returns a ranked forecast for the next 6 hours
- Recommendation levels: **Excellent** (<15 min) · **Good** (<30 min) · **Moderate** (<45 min) · **Busy**

### QR Check-In System

**Customer flow:**
1. Join a queue → a unique QR code is auto-generated
2. Tap **"Show QR Code"** on the dashboard
3. At the venue, navigate to the **QR Scanner** page
4. Scan the admin's venue QR code → instant check-in confirmation

**Admin flow:**
1. Open Admin Dashboard → select a queue
2. Click **"Show Check-in QR"** → display, download, or print the QR
3. Place it at reception/entrance
4. Receive a real-time toast notification when a customer checks in

---

## 🔔 Notifications

Notifications are sent on queue join and when a customer's turn is approaching.

| Channel | Dev Mode | Production |
|---|---|---|
| SMS | Console log | Twilio integration |
| Email | Console log | Nodemailer |

To enable real notifications, set credentials in `.env` and set `MOCK_NOTIFICATIONS=false`.

---

## 📊 Database Schema

### Users
```js
{ name, email, password (hashed), role: 'user'|'admin', phone, createdAt, updatedAt }
```

### Queues
```js
{ name, description, admin (ref: User), isActive, isPaused, avgServiceTime, totalServed, createdAt }
```

### QueueEntries
```js
{
  queue, user, position, status: 'waiting'|'called'|'completed'|'cancelled',
  joinedAt, calledAt, completedAt,
  qrCode, checkedIn, checkedInAt,
  estimatedWaitTime, predictedWaitTime, confidence,
  notificationSent, userLocation
}
```

### NotificationLog
```js
{ user, queue, type: 'sms'|'email', message, sentAt, success }
```

### ChatSession
```js
{ user, messages: [{ role: 'user'|'bot', content, timestamp }] }
```

---

## 🔐 Security

| Mechanism | Detail |
|---|---|
| Password hashing | bcrypt with 10 salt rounds |
| JWT | 7-day expiry, validated on every protected route |
| Role-based guards | Separate middleware for `user` and `admin` routes |
| Input validation | express-validator on all mutation endpoints |
| CORS | Configured for specific origin(s) |
| QR validation | Type-check, queue membership, active-status, single-use |
| Delete safety | Admin cannot delete a queue with active customers |

---

## 🧪 Testing Flows

### User Flow
1. Register or login as a user → auto-redirected to User Dashboard
2. Browse available queues and join one
3. View your position and AI-predicted wait time
4. Tap **"Show QR Code"** → download or display
5. Navigate to **QR Scanner**, scan the admin's venue QR
6. Receive confirmation and wait for your turn
7. Optionally tap **"Withdraw from Queue"** to leave early

### Admin Flow
1. Register or login as admin → auto-redirected to Admin Dashboard
2. Create a new queue
3. View live statistics and customer list
4. Click **"Show Check-in QR"** → print or display at venue
5. Call next customer → mark as completed
6. Pause/resume queues during breaks
7. Delete a queue once all customers are served

---

## 🚀 Deployment

### Backend (Render / Railway)
1. Connect your GitHub repo
2. Set environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET` (strong random string)
   - `FRONTEND_URL` (your deployed frontend URL)
3. Start command: `npm start`

### Frontend (Vercel / Netlify)
1. Connect your GitHub repo
2. Build settings:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
3. Set environment variables:
   - `VITE_API_URL` (your backend URL)
   - `VITE_SOCKET_URL` (your backend URL)

### Production Checklist
- [ ] HTTPS enabled (required for camera/QR scanning)
- [ ] Strong `JWT_SECRET` set
- [ ] CORS configured for production domain
- [ ] MongoDB Atlas configured with IP whitelist
- [ ] `MOCK_NOTIFICATIONS=false` with real Twilio/Email credentials
- [ ] Rate limiting enabled
- [ ] Error tracking configured (Sentry / LogRocket)
- [ ] Automated database backups enabled

---

## 🔮 Roadmap

- [ ] Push notifications via Firebase Cloud Messaging
- [ ] Geofencing for automatic check-in on arrival
- [ ] Advanced ML models (Random Forest, Neural Networks)
- [ ] Multi-language chatbot support
- [ ] Voice assistant (Web Speech API)
- [ ] Check-in analytics dashboard for admins
- [ ] Native mobile app (React Native)
- [ ] A/B testing for prediction accuracy
- [ ] Multi-queue check-in support

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 📚 Additional Documentation

| Document | Description |
|---|---|
| [AI_FEATURES_GUIDE.md](AI_FEATURES_GUIDE.md) | Deep dive into all AI features |
| [QR_CHECKIN_SYSTEM.md](QR_CHECKIN_SYSTEM.md) | QR check-in architecture & flows |
| [SMART_WAIT_TIME_FEATURE.md](SMART_WAIT_TIME_FEATURE.md) | ML prediction internals |
| [QUICKSTART.md](QUICKSTART.md) | Minimal quick-start guide |
| [SETUP_AND_TESTING.md](SETUP_AND_TESTING.md) | Full setup & test scenarios |

---

**Built with ❤️ using Node.js, React, MongoDB, Socket.io, and AI**
