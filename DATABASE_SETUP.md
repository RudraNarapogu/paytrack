# PostgreSQL Installation & Setup Guide for PayTrack

## 🔍 PostgreSQL Not Found

PostgreSQL is not installed on your system. Here's how to install and set it up:

---

## 📥 Option 1: Install PostgreSQL (Recommended)

### Step 1: Download PostgreSQL

**Download Link:** https://www.postgresql.org/download/windows/

**Recommended Version:** PostgreSQL 16.x (latest stable)

**Direct Download:** https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

### Step 2: Install PostgreSQL

1. **Run the installer** (postgresql-16.x-windows-x64.exe)
2. **Installation wizard:**
   - Click "Next" through welcome screens
   - **Installation Directory:** Keep default (C:\Program Files\PostgreSQL\16)
   - **Components:** Select all (PostgreSQL Server, pgAdmin 4, Command Line Tools)
   - **Data Directory:** Keep default
   - **Password:** Set a password (REMEMBER THIS!) - e.g., `admin123`
   - **Port:** Keep default (5432)
   - **Locale:** Keep default
   - Click "Next" and "Finish"

### Step 3: Add PostgreSQL to PATH (Important!)

**Option A - Automatic (Recommended):**
The installer usually adds it automatically. Restart your terminal and try:
```bash
psql --version
```

**Option B - Manual:**
1. Open "Environment Variables" (Search in Windows)
2. Under "System variables", find "Path"
3. Click "Edit"
4. Click "New"
5. Add: `C:\Program Files\PostgreSQL\16\bin`
6. Click "OK" on all windows
7. **Restart your terminal**

### Step 4: Create PayTrack Database

**Open Command Prompt (as Administrator):**
```bash
# Login to PostgreSQL (enter your password when prompted)
psql -U postgres

# Inside psql, run:
CREATE DATABASE paytrack_dev;

# Verify database was created:
\l

# Exit psql:
\q
```

### Step 5: Run Database Schema

```bash
cd c:\Users\user\Documents\paytrack
psql -U postgres -d paytrack_dev -f database\schema.sql
```

**Enter your PostgreSQL password when prompted.**

### Step 6: Update Backend .env

Edit `backend\.env` and replace `YOUR_PASSWORD` with your PostgreSQL password:

```env
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/paytrack_dev
```

---

## 📥 Option 2: Use Docker (Alternative)

If you prefer Docker:

### Step 1: Install Docker Desktop
Download: https://www.docker.com/products/docker-desktop/

### Step 2: Run PostgreSQL Container
```bash
docker run --name paytrack-postgres -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=paytrack_dev -p 5432:5432 -d postgres:16
```

### Step 3: Run Schema
```bash
docker exec -i paytrack-postgres psql -U postgres -d paytrack_dev < database\schema.sql
```

### Step 4: Update Backend .env
```env
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/paytrack_dev
```

---

## 📥 Option 3: Use SQLite (Quick Testing - Not Recommended)

For quick testing without PostgreSQL, I can modify the backend to use SQLite instead. However, this is **NOT recommended** for production as the schema is designed for PostgreSQL.

---

## ✅ Verification Steps

After installation, verify everything works:

### 1. Check PostgreSQL is Running
```bash
psql --version
# Should show: psql (PostgreSQL) 16.x
```

### 2. Test Database Connection
```bash
psql -U postgres -d paytrack_dev
# Should connect successfully
# Type \q to exit
```

### 3. Verify Tables Were Created
```bash
psql -U postgres -d paytrack_dev -c "\dt"
# Should list all tables: users, profiles, projects, etc.
```

---

## 🆘 Troubleshooting

### "psql: command not found"
- PostgreSQL not in PATH
- Restart terminal after installation
- Manually add to PATH (see Step 3 above)

### "Connection refused"
- PostgreSQL service not running
- Start it: Services → postgresql-x64-16 → Start

### "Password authentication failed"
- Wrong password in .env file
- Update DATABASE_URL with correct password

### "Database does not exist"
- Run: `psql -U postgres -c "CREATE DATABASE paytrack_dev;"`

---

## 🎯 Quick Summary

**For Full Installation:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with password (remember it!)
3. Restart terminal
4. Create database: `psql -U postgres -c "CREATE DATABASE paytrack_dev;"`
5. Run schema: `psql -U postgres -d paytrack_dev -f database\schema.sql`
6. Update `backend\.env` with your password

**For Docker:**
1. Install Docker Desktop
2. Run PostgreSQL container (see Option 2)
3. Run schema
4. Update `backend\.env`

---

## 📞 Need Help?

**Which option do you prefer?**
1. Install PostgreSQL (full installation)
2. Use Docker (containerized)
3. Use SQLite (quick testing only)

Let me know and I'll guide you through the specific steps!
