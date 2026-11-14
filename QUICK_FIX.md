# Quick Fix for Network Error

## 🔧 Most Likely Issue

The web app might be trying to connect before the backend is fully ready, or there's a configuration mismatch.

## ✅ Quick Fix Steps

### **Step 1: Verify Backend is Running**

Check the backend terminal - you should see:
```
🚀 PayTrack Backend API Server
================================
🌐 Server running on port 3000
```

### **Step 2: Test Backend Manually**

Open a new browser tab and go to:
```
http://localhost:3000/health
```

**You should see:**
```json
{"status":"ok","timestamp":"...","environment":"development"}
```

**If you see this, backend is working!** ✅

### **Step 3: Clear Browser Cache**

1. In your browser, press: **Ctrl + Shift + Delete**
2. Select "Cached images and files"
3. Click "Clear data"

### **Step 4: Clear LocalStorage**

1. Open browser console: **F12**
2. Go to "Console" tab
3. Type: `localStorage.clear()`
4. Press Enter

### **Step 5: Refresh Web App**

1. Go to: http://localhost:3001
2. Press **Ctrl + F5** (hard refresh)
3. Try logging in again

---

## 🎯 If Still Getting Network Error

### **Option A: Restart Web Server**

1. Go to the web terminal
2. Press **Ctrl + C** to stop
3. Run: `.\start-web.bat`
4. Wait for "Local: http://localhost:3001"
5. Try again

### **Option B: Check Browser Console**

1. Open http://localhost:3001
2. Press **F12**
3. Go to "Console" tab
4. Try to login
5. **Take a screenshot of any red errors**
6. Share with me what the error says

---

## 💡 Common Error Messages & Fixes

### **"ERR_CONNECTION_REFUSED"**
→ Backend is not running  
→ Fix: Run `.\start-backend.bat`

### **"Failed to fetch"**
→ Wrong API URL or CORS issue  
→ Fix: Check `web\.env` has correct URL

### **"Network request failed"**
→ Backend crashed  
→ Fix: Check backend terminal for errors

---

## 🚀 Nuclear Option (If Nothing Works)

```bash
# 1. Stop everything (Ctrl+C in both terminals)

# 2. Restart backend
.\start-backend.bat

# 3. Wait 10 seconds

# 4. Restart web
.\start-web.bat

# 5. Open INCOGNITO browser window
# Ctrl+Shift+N (Chrome) or Ctrl+Shift+P (Firefox)

# 6. Go to: http://localhost:3001

# 7. Try login with:
# Phone: +919876543210
# OTP: 000000
```

---

## 📸 What I Need to Help You

If still not working, tell me:

1. **What does the backend terminal show?**
   (Copy the last few lines)

2. **What does the browser console show?**
   (Press F12, go to Console tab, copy any red errors)

3. **Can you access http://localhost:3000/health in browser?**
   (Yes/No and what you see)

---

**Most likely it's just a cache issue - try the Quick Fix steps above!**
