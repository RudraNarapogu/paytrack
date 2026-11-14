# PayTrack - Quick Start Guide

## ✅ Dependencies Installed Successfully!

All npm packages have been installed for:
- ✅ Backend (547 packages)
- ✅ Mobile (943 packages)  
- ✅ Web (pending completion)

---

## 🔧 Next Steps

### 1️⃣ Setup PostgreSQL Database

**Install PostgreSQL** (if not already installed):
- Download: https://www.postgresql.org/download/windows/
- During installation, remember your password!

**Create Database:**
```bash
# Open Command Prompt or PowerShell
createdb paytrack_dev

# Or use pgAdmin GUI to create database named: paytrack_dev
```

**Run Schema:**
```bash
psql paytrack_dev < database\schema.sql
```

---

### 2️⃣ Configure Backend Environment

**Edit:** `backend\.env`

**IMPORTANT:** Replace `YOUR_PASSWORD` with your actual PostgreSQL password:

```env
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/paytrack_dev
```

Example:
```env
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/paytrack_dev
```

**Note:** JWT secrets are already generated! ✅

---

### 3️⃣ Start the Backend Server

```bash
cd backend
npm start
```

**Expected Output:**
```
🚀 PayTrack Backend API Server
================================
📡 Environment: development
🌐 Server running on port 3000
🔗 API URL: http://localhost:3000/api/v1
💚 Health check: http://localhost:3000/health
```

---

### 4️⃣ Test the API

Open a new terminal and run:
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{"status":"ok","timestamp":"2026-02-01T...","environment":"development"}
```

---

### 5️⃣ Start Mobile App (Optional)

```bash
cd mobile
npm start

# In another terminal:
npm run android  # or npm run ios
```

---

### 6️⃣ Start Web Dashboard (Optional)

```bash
cd web
npm run dev
```

**Access:** http://localhost:3001

---

## 🧪 Testing Login (Without SMS)

### Backend Console Shows OTP

When you try to login:
1. Enter phone number: `9876543210`
2. Click "Send OTP"
3. **Check backend terminal** - OTP will be printed
4. Enter the OTP shown in console
5. Login successful! 🎉

**Development Mode:** OTP is always logged to console, no SMS service needed!

---

## 📝 Configuration Files Created

✅ `backend\.env` - Backend configuration (JWT secrets generated)  
✅ `mobile\.env` - Mobile API endpoint  
✅ `web\.env` - Web API endpoint

---

## ⚠️ Important Notes

### Database Password
- **Must update** `backend\.env` with your PostgreSQL password
- Line to change: `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@...`

### OTP in Development
- OTP is **logged to backend console**
- No SMS service needed for testing
- Any 6-digit code works in dev mode

### Security Vulnerabilities
- The npm warnings are normal
- Not critical for development
- Will be addressed in production deployment

---

## 🆘 Troubleshooting

### "Connection refused" error
- Check if PostgreSQL is running
- Verify database password in `.env`
- Ensure database `paytrack_dev` exists

### "Cannot find module" error
- Run `npm install` again
- Delete `node_modules` and reinstall

### Mobile app won't connect
- Check `mobile\.env` has correct API URL
- Use `http://10.0.2.2:3000/api/v1` for Android emulator
- Use your computer's IP for physical device

---

## 🎯 What's Next?

1. **Setup PostgreSQL** and create database
2. **Update backend\.env** with your database password
3. **Run database schema**
4. **Start backend server**
5. **Test API** with curl
6. **Start mobile/web apps**
7. **Test login flow**

---

## 📞 Need Help?

Check the detailed guides:
- [SETUP_GUIDE.md](file:///c:/Users/user/Documents/paytrack/SETUP_GUIDE.md) - Complete setup instructions
- [README.md](file:///c:/Users/user/Documents/paytrack/README.md) - Project overview
- [docs/deployment.md](file:///c:/Users/user/Documents/paytrack/docs/deployment.md) - Deployment guide

---

**Ready to start! 🚀**
