# PayTrack

**Smart Payments. Clean Records. Zero Confusion.**

PayTrack is a production-ready contractor payment tracking and advance management system designed for contractors who frequently give on-demand money (advances) to workers instead of fixed salary payouts.

---

## 🎯 Problem Statement

Contractors currently face:
- ❌ No structured record of advances
- ❌ Disputes on salary vs advance
- ❌ No monthly visibility
- ❌ Cash payments with zero audit trail

## ✅ Solution

PayTrack provides:
- ✅ Single source of financial truth
- ✅ Immutable transaction history
- ✅ Clear separation of salary vs advance
- ✅ Simple mobile-first workflows
- ✅ Payment orchestration across cash and digital modes

---

## 🚀 Features

### For Contractors
- 📊 **Dashboard Analytics**: Monthly spend, worker-wise breakdown, advance vs salary ratio
- 👥 **Worker Management**: Add workers, set salaries, track balances
- ✅ **Payment Approval**: Approve/reject/modify payment requests
- 💰 **Multi-Mode Payments**: Cash, UPI, bank transfer support
- 📁 **Project Tracking**: Organize workers by projects/sites
- 📈 **Financial Reports**: Export data, view trends

### For Workers
- 💸 **Request Money**: Quick request flow with category selection
- 📱 **Dashboard**: View balance, salary earned, advances taken
- 📜 **Transaction History**: Complete payment history
- 🔔 **Notifications**: Real-time updates on request status
- 🧾 **Ledger View**: Transparent financial records

### Core Capabilities
- 🔐 **OTP Authentication**: Secure phone-based login
- 🔒 **Role-Based Access**: Contractor and worker roles
- 📝 **Immutable Ledger**: Tamper-proof financial records
- 🔔 **Real-Time Notifications**: Push and SMS alerts
- 📊 **Audit Trail**: Complete history of all actions
- 🌐 **Offline Support**: Cash payments work offline

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React Native (Mobile - iOS/Android)
- React (Web Dashboard)
- React Native Paper (UI Components)

**Backend:**
- Node.js + Express.js (API Server)
- PostgreSQL (Database)
- JWT Authentication

**Deployment (Free Tier Available):**
- Railway.app or Render.com (Backend)
- Supabase or Neon (Database)
- Vercel or Netlify (Frontend)

**External Services:**
- Firebase Auth or Twilio (OTP)
- Firebase Cloud Messaging (Push Notifications)

**💰 Cost:** Start with **$0/month** (free tier), scale to $10-50/month

### System Overview

```
┌─────────────────────────────────────────┐
│         Client Applications             │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │ Mobile App   │  │ Web Dashboard   │  │
│  │ React Native │  │ React           │  │
│  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         API Gateway (NestJS)            │
│  Auth • Rate Limiting • Validation      │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Service Layer                   │
│  Payment Requests • Transactions        │
│  Ledger • Users • Notifications         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Data Layer                      │
│  PostgreSQL • Redis • S3                │
└─────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
paytrack/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/       # Authentication
│   │   │   ├── users/      # User management
│   │   │   ├── payment-requests/
│   │   │   ├── transactions/
│   │   │   ├── ledger/     # Financial ledger
│   │   │   ├── notifications/
│   │   │   └── projects/
│   │   ├── guards/         # Auth & role guards
│   │   ├── interceptors/   # Logging, transform
│   │   └── main.ts
│   ├── test/
│   └── package.json
│
├── mobile/                  # React Native app
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   ├── contractor/
│   │   │   └── worker/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── services/       # API client
│   │   └── utils/
│   └── package.json
│
├── web/                     # React web dashboard
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── database/
│   ├── schema.sql          # Database schema
│   └── migrations/         # Migration files
│
├── infrastructure/
│   ├── terraform/          # AWS infrastructure
│   ├── docker-compose.yml  # Local development
│   └── Dockerfile
│
└── docs/
    ├── architecture.md     # System architecture
    ├── api-contracts.md    # API documentation
    ├── user-flows.md       # User journey maps
    └── deployment.md       # Deployment guide
```

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ LTS
- PostgreSQL 15+ (or use free cloud: Supabase/Neon)
- Git
- Firebase account (for OTP) OR Twilio account
- Code editor (VS Code recommended)

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/paytrack.git
cd paytrack
```

#### 2. Setup Database

**Option A: Use Free Cloud Database (Easiest)**
```bash
# Sign up for Supabase (https://supabase.com) or Neon (https://neon.tech)
# Create a new project
# Copy the connection string
# Run schema via their web interface or:
psql <your_connection_string> < database/schema.sql
```

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL locally
createdb paytrack_dev
psql paytrack_dev < database/schema.sql
```

**Option C: Docker**
```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15
createdb -h localhost -U postgres paytrack_dev
psql -h localhost -U postgres paytrack_dev < database/schema.sql
```

#### 3. Setup Backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

Backend will run on `http://localhost:3000`

#### 4. Setup Mobile App
```bash
cd mobile
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

#### 5. Setup Web Dashboard
```bash
cd web
npm install
npm run dev
```

Web dashboard will run on `http://localhost:5173`

---

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests
```bash
cd mobile
npm run test

cd web
npm run test
```

---

## 📦 Deployment

### Staging Deployment
```bash
# Push to develop branch
git push origin develop

# GitHub Actions will automatically:
# 1. Run tests
# 2. Build Docker image
# 3. Deploy to staging
```

### Production Deployment
```bash
# Create release branch
git checkout -b release/v1.0.0

# Merge to main
git checkout main
git merge release/v1.0.0
git push origin main

# GitHub Actions will automatically:
# 1. Run tests
# 2. Build Docker image
# 3. Deploy to production (blue-green)
```

See [docs/deployment.md](docs/deployment.md) for detailed deployment instructions.

---

## 📚 Documentation

- [System Architecture](docs/architecture.md) - High-level system design
- [API Contracts](docs/api-contracts.md) - Complete API reference
- [User Flows](docs/user-flows.md) - User journey documentation
- [Database Schema](database/schema.sql) - Database structure
- [Deployment Guide](docs/deployment.md) - Production deployment

---

## 🔐 Security

- ✅ OTP-based authentication
- ✅ JWT token-based authorization
- ✅ Role-based access control
- ✅ HTTPS only (TLS 1.3)
- ✅ Encrypted sensitive data
- ✅ Rate limiting
- ✅ Audit logging
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 📊 Key Metrics

**Performance:**
- API response time: < 200ms (p95)
- Mobile app load time: < 2s
- Database query time: < 50ms (p95)

**Scalability:**
- Supports 10,000+ contractors
- 100,000+ workers
- 1M+ transactions/month

**Reliability:**
- 99.9% uptime SLA
- Multi-AZ deployment
- Automated backups
- Point-in-time recovery

---

## 🗺️ Roadmap

### ✅ Phase 1 (MVP) - 8 weeks
- Core payment request workflow
- OTP authentication
- Ledger system
- Mobile app (iOS/Android)
- Web dashboard
- Basic analytics

### 🚧 Phase 2 (3-6 months)
- Automated salary accrual
- Payment gateway integration (Razorpay)
- WhatsApp notifications
- Multi-language support
- Advanced analytics

### 📅 Phase 3 (6-12 months)
- Biometric authentication
- Offline mode with sync
- Worker attendance tracking
- Geofencing for cash payments
- GST invoice generation
- Tax reporting

### 🔮 Phase 4 (12+ months)
- AI-powered fraud detection
- Predictive analytics
- Multi-contractor support
- Marketplace for contractor services

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👥 Team

**PayTrack Engineering Team**
- Product Design
- Backend Engineering
- Frontend Engineering
- DevOps
- QA

---

## 📞 Support

- 📧 Email: support@paytrack.app
- 💬 Slack: [paytrack.slack.com](https://paytrack.slack.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/paytrack/issues)
- 📖 Docs: [docs.paytrack.app](https://docs.paytrack.app)

---

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- React Native community
- PostgreSQL contributors
- All open-source libraries used in this project

---

**Built with ❤️ for contractors and workers**

**PayTrack** - Smart Payments. Clean Records. Zero Confusion.
