# Network Error Troubleshooting Guide

## 🔍 Quick Diagnosis

### **1. Check Backend is Running**

Open a new terminal and run:
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{"status":"ok","timestamp":"...","environment":"development"}
```

**If it fails:**
- Backend is not running
- Run: `.\start-backend.bat`

---

### **2. Check Web Dashboard URL**

The web app should be connecting to: `http://localhost:3000/api/v1`

**Verify in browser console:**
1. Open http://localhost:3001
2. Press F12 (Developer Tools)
3. Go to "Console" tab
4. Look for errors

---

### **3. Common Issues & Fixes**

#### **Issue: "Network Error" on Login**

**Cause:** Backend not running or wrong URL

**Fix:**
```bash
# Check if backend is running
curl http://localhost:3000/health

# If not, start it
.\start-backend.bat
```

#### **Issue: "CORS Error"**

**Cause:** Browser blocking cross-origin requests

**Fix:** Already configured! CORS is set to allow all origins.

#### **Issue: "Failed to fetch"**

**Cause:** Backend crashed or database connection failed

**Fix:**
1. Check backend terminal for errors
2. Verify PostgreSQL is running
3. Check database password in `backend\.env`

---

### **4. Test Backend Manually**

#### **Test Health Endpoint:**
```bash
curl http://localhost:3000/health
```

#### **Test Send OTP:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\": \"+919876543210\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "000000"
}
```

#### **Test Verify OTP:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\": \"+919876543210\", \"otp\": \"000000\"}"
```

---

### **5. Restart Everything**

If still having issues, restart all services:

```bash
# 1. Stop backend (Ctrl+C in backend terminal)

# 2. Stop web (Ctrl+C in web terminal)

# 3. Restart backend
.\start-backend.bat

# 4. Wait 5 seconds for backend to fully start

# 5. Restart web
.\start-web.bat

# 6. Open browser
# http://localhost:3001
```

---

### **6. Check Browser Console**

1. Open http://localhost:3001
2. Press **F12** (Developer Tools)
3. Go to **Console** tab
4. Try to login
5. Look for red error messages

**Common errors:**

**"ERR_CONNECTION_REFUSED"**
- Backend is not running
- Start backend: `.\start-backend.bat`

**"Network request failed"**
- Wrong API URL
- Check `web\.env` has: `VITE_API_URL=http://localhost:3000/api/v1`

**"404 Not Found"**
- Wrong endpoint
- Check API routes in backend

---

### **7. Verify Configuration Files**

#### **backend\.env:**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:Rudra@56@localhost:5432/paytrack_dev
JWT_SECRET=fbc5a708c3fea5afdd668e9fe67db422c0f0ef70bf49022a4c5dd5ec23b427d4
JWT_REFRESH_SECRET=f57039ebc8b9c2811c4980a8056727c6a017d80072d124eb0ad8869ac419238c
CORS_ORIGIN=*
```

#### **web\.env:**
```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

### **8. Check Firewall**

Windows Firewall might be blocking the connection:

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find "Node.js" and ensure both Private and Public are checked

---

### **9. Test in Different Browser**

Sometimes browser cache causes issues:

1. Try in **Incognito/Private mode**
2. Or try a different browser (Chrome, Firefox, Edge)

---

### **10. Check Backend Logs**

Look at the backend terminal for errors:

**Good logs:**
```
🚀 PayTrack Backend API Server
================================
📡 Environment: development
🌐 Server running on port 3000
```

**Bad logs (examples):**
```
Error: connect ECONNREFUSED  ← Database not running
Error: password authentication failed  ← Wrong DB password
Error: listen EADDRINUSE  ← Port 3000 already in use
```

---

## 🆘 Still Not Working?

### **Complete Reset:**

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Clear browser cache
# Press Ctrl+Shift+Delete in browser
# Clear "Cached images and files"

# 3. Clear localStorage
# Open browser console (F12)
# Type: localStorage.clear()
# Press Enter

# 4. Restart PostgreSQL service
# Open Services (Win+R, type services.msc)
# Find "postgresql-x64-18"
# Right-click → Restart

# 5. Start backend
.\start-backend.bat

# 6. Wait 10 seconds

# 7. Start web
.\start-web.bat

# 8. Open fresh browser tab
http://localhost:3001
```

---

## ✅ Quick Checklist

Before trying to login, verify:

- [ ] Backend terminal shows "Server running on port 3000"
- [ ] Web terminal shows "Local: http://localhost:3001"
- [ ] PostgreSQL service is running
- [ ] Can access http://localhost:3000/health in browser
- [ ] Can access http://localhost:3001 in browser
- [ ] Browser console (F12) shows no red errors

---

## 📞 What to Check Right Now

**Run these commands:**

```bash
# Test backend
curl http://localhost:3000/health

# Test database
psql -U postgres -d paytrack_dev -c "SELECT COUNT(*) FROM users;"

# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

**If all pass, try login again!**
