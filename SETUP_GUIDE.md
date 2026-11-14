# PayTrack Environment Setup Guide

## 🔑 Required Configuration

### **IMMEDIATE (For Testing)**
You can start testing **WITHOUT** any external API keys! The app will work in development mode with mock OTP.

### **OPTIONAL (For Production)**
These are needed only when deploying to production:

---

## 1️⃣ Backend Configuration

**File:** `backend/.env`

### Minimum Required (No API Keys Needed)
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/paytrack_dev

# JWT Secrets (Generate random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long

# CORS (Allow all origins in development)
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Optional (For Production Features)

#### **SMS/OTP Service** (Choose ONE)

**Option A: Twilio** (Recommended)
- **Get API Keys:** https://www.twilio.com/console
- **Free Tier:** $15 credit (enough for testing)
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Option B: Firebase Auth**
- **Get API Keys:** https://console.firebase.google.com/
- **Free Tier:** Unlimited
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

**Option C: MSG91** (India-specific)
- **Get API Keys:** https://msg91.com/
- **Free Tier:** 100 SMS/day
```env
# MSG91 Configuration
MSG91_AUTH_KEY=your_auth_key
MSG91_SENDER_ID=your_sender_id
```

#### **Push Notifications** (Optional)
```env
# Firebase Cloud Messaging
FCM_SERVER_KEY=your_fcm_server_key
```

---

## 2️⃣ Mobile App Configuration

**File:** `mobile/.env`

```env
# API Configuration
API_BASE_URL=http://localhost:3000/api/v1

# For Android Emulator, use:
# API_BASE_URL=http://10.0.2.2:3000/api/v1

# For Physical Device on same network, use your computer's IP:
# API_BASE_URL=http://192.168.1.100:3000/api/v1
```

---

## 3️⃣ Web Dashboard Configuration

**File:** `web/.env`

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 📝 How to Generate JWT Secrets

### Option 1: Node.js (Recommended)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 2: Online Generator
Visit: https://www.grc.com/passwords.htm
Copy the "63 random alpha-numeric characters" string

### Option 3: Simple Random String
Just type a long random string (min 32 characters):
```
my-super-secret-key-12345-abcdef-ghijkl-mnopqr
```

---

## 🗄️ Database Setup

### Install PostgreSQL
**Windows:** https://www.postgresql.org/download/windows/

### Create Database
```bash
# Open psql or pgAdmin
createdb paytrack_dev

# Or in psql:
CREATE DATABASE paytrack_dev;
```

### Run Schema
```bash
psql paytrack_dev < database/schema.sql
```

---

## ✅ Quick Start (No API Keys)

### 1. Create Backend .env
```bash
cd backend
copy .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/paytrack_dev
JWT_SECRET=my-development-secret-key-12345-min-32-chars
JWT_REFRESH_SECRET=my-development-refresh-key-67890-min-32-chars
CORS_ORIGIN=*
```

### 2. Create Mobile .env
```bash
cd mobile
echo API_BASE_URL=http://localhost:3000/api/v1 > .env
```

### 3. Create Web .env
```bash
cd web
echo VITE_API_URL=http://localhost:3000/api/v1 > .env
```

---

## 🧪 Testing Without SMS

In **development mode**, OTP will be:
- **Logged to console** (check backend terminal)
- **Always accepts:** `123456` (hardcoded for testing)

You can test the entire app without any SMS service!

---

## 🚀 When You Need API Keys

### For Testing (Now)
❌ **NO API KEYS NEEDED**
- App works with mock OTP
- All features functional locally

### For Production (Later)
✅ **API KEYS NEEDED:**
- Twilio/Firebase for real SMS
- FCM for push notifications
- Payment gateway (Razorpay) for UPI

---

## 📞 Getting API Keys (When Ready)

### Twilio (SMS)
1. Sign up: https://www.twilio.com/try-twilio
2. Get free $15 credit
3. Copy Account SID, Auth Token, Phone Number
4. Paste in `backend/.env`

### Firebase (Auth + Push)
1. Go to: https://console.firebase.google.com/
2. Create new project
3. Enable Authentication → Phone
4. Download service account JSON
5. Copy credentials to `backend/.env`

---

## ✨ Summary

**RIGHT NOW (For Testing):**
1. ✅ Create `.env` files (see Quick Start above)
2. ✅ Set DATABASE_URL with your PostgreSQL password
3. ✅ Generate random JWT secrets
4. ✅ Start testing!

**LATER (For Production):**
1. Get Twilio/Firebase API keys
2. Configure SMS service
3. Add push notifications
4. Integrate payment gateway

**You can start testing immediately without any external API keys!** 🎉
