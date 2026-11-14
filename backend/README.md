# PayTrack Backend API

Express.js backend for PayTrack contractor payment tracking system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Setup database:
```bash
# Run the schema from parent directory
psql your_database < ../database/schema.sql
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/send-otp` - Send OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP and login
- `POST /api/v1/auth/refresh` - Refresh access token

### Users
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update profile
- `POST /api/v1/users/workers` - Create worker (contractor only)
- `GET /api/v1/users/workers` - List workers (contractor only)
- `GET /api/v1/users/workers/:id` - Get worker details

### Payment Requests
- `POST /api/v1/payment-requests` - Create request (worker only)
- `GET /api/v1/payment-requests` - List requests
- `GET /api/v1/payment-requests/:id` - Get request details
- `PATCH /api/v1/payment-requests/:id/approve` - Approve (contractor only)
- `PATCH /api/v1/payment-requests/:id/reject` - Reject (contractor only)

### Transactions
- `GET /api/v1/transactions` - List transactions
- `GET /api/v1/transactions/:id` - Get transaction details
- `POST /api/v1/transactions/:id/confirm-cash` - Confirm cash payment (contractor only)

### Ledger
- `GET /api/v1/ledger/worker/:workerId` - Get worker ledger
- `GET /api/v1/ledger/worker/:workerId/balance` - Get worker balance
- `POST /api/v1/ledger/adjustments` - Create adjustment (contractor only)

### Dashboard
- `GET /api/v1/dashboard/contractor` - Contractor dashboard
- `GET /api/v1/dashboard/worker` - Worker dashboard

## Project Structure

```
backend/
├── controllers/        # Business logic
├── routes/            # API routes
├── middleware/        # Auth, validation
├── db/               # Database connection
├── server.js         # Main entry point
└── package.json
```

## Environment Variables

See `.env.example` for all required variables.

## Development

```bash
npm run dev    # Start with nodemon
npm start      # Start production server
npm test       # Run tests
```
