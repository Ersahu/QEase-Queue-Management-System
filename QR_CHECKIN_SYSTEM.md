# QR Check-in System - Admin & Customer Portal

## 🎯 Overview

This feature enables a complete QR-based check-in workflow where:
- **Admins** display QR codes for their queues
- **Customers** scan the QR code to notify admins of their arrival
- **Admins** receive real-time notifications with full customer details

---

## 🔄 How It Works

### For Admins
1. Navigate to Admin Dashboard
2. Select a queue
3. Click "Show Check-in QR" button
4. Display, download, or print the QR code
5. Place it at your entrance/reception
6. Get notified when customers scan it

### For Customers
1. Login to Customer Portal
2. Join a queue (if not already joined)
3. Navigate to "QR Scanner" from navbar
4. Scan the admin's QR code using camera
5. Check-in is confirmed instantly
6. Admin receives notification with your details

---

## 📱 Features Implemented

### Admin Portal

#### AdminQRDisplay Component
**Location**: `frontend/src/components/admin/AdminQRDisplay.jsx`

**Features**:
- Generates unique QR code per queue
- Displays QR in a modal dialog
- Download QR as PNG image
- Print QR with instructions
- Encodes queue ID, name, and admin ID

**QR Data Structure**:
```json
{
  "type": "ADMIN_QR",
  "queueId": "queue_id_here",
  "queueName": "DMV Services",
  "adminId": "admin_id_here",
  "timestamp": 1234567890
}
```

**Usage**:
```jsx
<AdminQRDisplay queue={queue} adminId={adminId} />
```

### Customer Portal

#### Enhanced QRScanner Component
**Location**: `frontend/src/pages/QRScanner.jsx`

**Features**:
- Auto-detects QR code type (Admin vs Customer)
- Camera-based scanning using html5-qrcode
- Manual QR input fallback
- Shows full check-in confirmation
- Displays customer and queue details

**Check-in Flow**:
1. Customer scans admin QR
2. System validates QR type
3. Finds customer's active entry in that queue
4. Marks as checked-in with timestamp
5. Notifies admin via Socket.io
6. Shows confirmation to customer

---

## 🔧 Backend Implementation

### New API Endpoint

**POST** `/api/ai/checkin-admin-qr`

**Request Body**:
```json
{
  "qrData": "base64_encoded_qr_string"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Successfully checked in to DMV Services",
  "data": {
    "entry": {
      "id": "entry_id",
      "position": 3,
      "status": "waiting",
      "queue": "DMV Services",
      "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "checkedInAt": "2026-04-24T10:30:00.000Z"
    },
    "queueInfo": {
      "queueId": "queue_id",
      "queueName": "DMV Services",
      "adminId": "admin_id"
    }
  }
}
```

**Error Responses**:
- `400` - Invalid QR format or already checked in
- `404` - Not in this queue or entry not active
- `500` - Server error

### Socket.io Event

**Event**: `customer:checkin`

**Emitted to**: Queue room (`queue_{queueId}`)

**Payload**:
```json
{
  "queueId": "queue_id",
  "entry": {
    "id": "entry_id",
    "position": 3,
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "checkedInAt": "2026-04-24T10:30:00.000Z",
    "queue": "DMV Services"
  },
  "message": "John Doe has checked in for DMV Services"
}
```

---

## 📊 Database Updates

### QueueEntry Model
The `checkedIn` and `checkedInAt` fields (already added) are used to track check-ins:

```javascript
{
  checkedIn: Boolean,          // true after QR scan
  checkedInAt: Date,           // timestamp of check-in
}
```

---

## 🎨 UI Components

### Admin Side

**QueueManager Integration**:
- "Show Check-in QR" button added below queue controls
- Opens modal with large QR code
- Options to download or print
- Clear instructions for customers

**Admin Dashboard Notifications**:
- Toast notification when customer checks in
- Shows customer name and queue
- Auto-refreshes customer list
- Icon: PersonCheck

### Customer Side

**QR Scanner Page**:
- Two scanning modes:
  1. Camera scanner (primary)
  2. Manual input (fallback)
- Auto-detects QR type
- Shows detailed confirmation:
  - Customer details (name, email, phone)
  - Queue information
  - Check-in timestamp
- Success message with next steps

---

## 🔐 Security & Validation

### QR Code Validation
1. **Type Check**: Verifies `type === 'ADMIN_QR'`
2. **Queue Membership**: Customer must be in that queue
3. **Active Entry**: Status must be 'waiting' or 'called'
4. **Single Use**: Prevents duplicate check-ins
5. **Timestamp**: Records exact check-in time

### Authorization
- ✅ Requires authentication (JWT)
- ✅ Validates user ownership of entry
- ✅ Admin receives notification only for their queue
- ✅ Socket.io room-based security

---

## 🧪 Testing Guide

### Test as Admin

1. **Login** as admin user
2. **Navigate** to Admin Dashboard
3. **Select** a queue
4. **Click** "Show Check-in QR"
5. **Verify** QR code displays
6. **Download** QR code (optional)
7. **Wait** for customer to scan

### Test as Customer

1. **Login** as regular user
2. **Join** the same queue (if not already)
3. **Navigate** to "QR Scanner"
4. **Scan** the admin's QR code (or paste manually)
5. **Verify** check-in confirmation shows:
   - Your name, email, phone
   - Queue name and position
   - Check-in timestamp
6. **Check** admin receives notification

### Verify Admin Notification

1. **Watch** admin dashboard
2. **Toast notification** should appear
3. **Customer list** should refresh
4. **Console logs** should show socket event

---

## 📋 Use Cases

### 1. Medical Clinics
- Admin displays QR at reception
- Patient scans on arrival
- Doctor sees patient has arrived
- Reduces front desk workload

### 2. Government Offices (DMV)
- QR code posted at entrance
- Citizens scan to check-in
- Staff notified instantly
- Better queue management

### 3. Restaurants
- Host displays QR at entrance
- Guests scan for reservation check-in
- Server gets notification
- Streamlined seating process

### 4. Corporate Offices
- Reception QR for visitor check-in
- Host notified of visitor arrival
- Professional check-in experience
- Audit trail of visits

---

## 🚀 Deployment Notes

### Production Checklist

- [ ] HTTPS enabled (required for camera access)
- [ ] Socket.io configured for production
- [ ] MongoDB connection optimized
- [ ] QR codes tested on mobile devices
- [ ] Camera permissions documented
- [ ] Print QR codes laminated for durability

### Mobile Compatibility
- ✅ iOS Safari (camera access granted)
- ✅ Android Chrome (camera access granted)
- ✅ Manual input works on all browsers
- ✅ Responsive design for all screen sizes

---

## 💡 Pro Tips

### For Admins
1. **Print and laminate** QR codes for durability
2. **Place at eye level** for easy scanning
3. **Add instructions** below QR code
4. **Test with multiple phones** before deployment
5. **Keep dashboard open** to see real-time notifications

### For Customers
1. **Ensure good lighting** for camera scanning
2. **Hold phone steady** while scanning
3. **Use manual input** if camera fails
4. **Check-in only once** (system prevents duplicates)
5. **Wait for confirmation** before proceeding

---

## 🔧 Troubleshooting

### Camera Not Working
**Solution**: 
- Check browser permissions
- Use HTTPS (required for camera)
- Try manual input as fallback

### "Not in this queue" Error
**Solution**:
- Customer must join the queue first
- Check queue ID matches
- Verify entry status is active

### "Already checked in" Error
**Solution**:
- One check-in per queue entry
- Check `checkedInAt` timestamp
- Contact admin if needs reset

### Admin Not Receiving Notifications
**Solution**:
- Check Socket.io connection
- Verify admin is on dashboard
- Check browser console for errors
- Ensure queue room joined correctly

---

## 📈 Future Enhancements

- [ ] Geofencing for auto check-in when nearby
- [ ] Multi-queue check-in support
- [ ] Check-in analytics dashboard
- [ ] SMS confirmation to customer
- [ ] Badge printing after check-in
- [ ] Integration with calendar systems
- [ ] Wait time recalculation after check-in
- [ ] VIP/priority check-in lanes

---

## 🎓 Technical Architecture

```
Customer Device                    Server                   Admin Device
     |                                |                          |
     |--- Scan Admin QR ------------->|                          |
     |                                |                          |
     |--- POST /checkin-admin-qr ---->|                          |
     |                                |--- Validate QR -----------|
     |                                |--- Find Entry ------------|
     |                                |--- Mark CheckedIn --------|
     |                                |                          |
     |                                |--- Socket: customer:checkin ->|
     |                                |                          |
     |<-- Success Response -----------|    Toast Notification <--|
     |                                |    Customer List Refresh<-|
     |                                |                          |
     Show Confirmation                |    Show Customer Details |
```

---

**Implementation Date**: April 24, 2026  
**Status**: ✅ Complete & Tested  
**Files Modified**: 6 files  
**New Files**: 1 component  
**New API**: 1 endpoint  
**New Socket Event**: 1 event
