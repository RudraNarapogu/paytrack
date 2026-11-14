# PayTrack API Contracts

**Version:** 1.0.0  
**Base URL:** `https://api.paytrack.app/v1`  
**Authentication:** Bearer JWT Token

---

## Authentication

### Send OTP

**Endpoint:** `POST /auth/send-otp`

**Request:**
```json
{
  "phoneNumber": "+919876543210"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

**Errors:**
- `400` - Invalid phone number format
- `429` - Too many OTP requests

---

### Verify OTP

**Endpoint:** `POST /auth/verify-otp`

**Request:**
```json
{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "phoneNumber": "+919876543210",
    "role": "CONTRACTOR",
    "profile": {
      "id": "uuid",
      "businessName": "ABC Construction",
      "ownerName": "John Doe"
    }
  }
}
```

**Errors:**
- `400` - Invalid or expired OTP
- `404` - User not found

---

### Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

---

## Users

### Get Current User

**Endpoint:** `GET /users/me`

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "phoneNumber": "+919876543210",
  "role": "CONTRACTOR",
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00Z",
  "profile": {
    "id": "uuid",
    "businessName": "ABC Construction",
    "ownerName": "John Doe",
    "email": "john@abc.com",
    "gstin": "29ABCDE1234F1Z5"
  }
}
```

---

### Update Profile

**Endpoint:** `PATCH /users/me`

**Request:**
```json
{
  "email": "newemail@example.com",
  "address": "123 Main St, City"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "profile": { /* updated profile */ }
}
```

---

## Workers (Contractor Only)

### Create Worker

**Endpoint:** `POST /workers`

**Request:**
```json
{
  "phoneNumber": "+919876543211",
  "fullName": "Ramesh Kumar",
  "email": "ramesh@example.com",
  "monthlySalary": 25000,
  "bankAccountNumber": "1234567890",
  "bankIfsc": "SBIN0001234",
  "bankName": "State Bank of India",
  "upiId": "ramesh@paytm",
  "preferredPaymentMode": "UPI"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "worker": {
    "id": "uuid",
    "userId": "uuid",
    "fullName": "Ramesh Kumar",
    "phoneNumber": "+919876543211",
    "monthlySalary": 25000,
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

---

### List Workers

**Endpoint:** `GET /workers`

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional)
- `isActive` (optional)

**Response:** `200 OK`
```json
{
  "workers": [
    {
      "id": "uuid",
      "fullName": "Ramesh Kumar",
      "phoneNumber": "+919876543211",
      "monthlySalary": 25000,
      "currentBalance": -5000,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### Get Worker Details

**Endpoint:** `GET /workers/:id`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "fullName": "Ramesh Kumar",
  "phoneNumber": "+919876543211",
  "email": "ramesh@example.com",
  "monthlySalary": 25000,
  "bankDetails": {
    "accountNumber": "1234567890",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank of India"
  },
  "upiId": "ramesh@paytm",
  "preferredPaymentMode": "UPI",
  "balance": {
    "salaryEarned": 25000,
    "salaryPaid": 10000,
    "advancesGiven": 20000,
    "outstandingBalance": -5000
  },
  "recentTransactions": [ /* last 5 transactions */ ]
}
```

---

## Payment Requests

### Create Payment Request (Worker Only)

**Endpoint:** `POST /payment-requests`

**Request:**
```json
{
  "amount": 5000,
  "category": "ADVANCE",
  "paymentMode": "UPI",
  "purpose": "Medical emergency",
  "notes": "Need urgent funds for hospital bill",
  "projectId": "uuid" // optional
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "paymentRequest": {
    "id": "uuid",
    "amount": 5000,
    "category": "ADVANCE",
    "paymentMode": "UPI",
    "status": "PENDING",
    "createdAt": "2026-01-24T15:30:00Z"
  }
}
```

**Errors:**
- `400` - Invalid amount or category
- `403` - Only workers can create requests

---

### List Payment Requests

**Endpoint:** `GET /payment-requests`

**Query Params:**
- `status` (PENDING, APPROVED, REJECTED, COMPLETED)
- `workerId` (contractor only)
- `startDate`, `endDate`
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "requests": [
    {
      "id": "uuid",
      "worker": {
        "id": "uuid",
        "fullName": "Ramesh Kumar"
      },
      "amount": 5000,
      "category": "ADVANCE",
      "paymentMode": "UPI",
      "status": "PENDING",
      "purpose": "Medical emergency",
      "createdAt": "2026-01-24T15:30:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### Get Payment Request Details

**Endpoint:** `GET /payment-requests/:id`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "worker": {
    "id": "uuid",
    "fullName": "Ramesh Kumar",
    "phoneNumber": "+919876543211"
  },
  "contractor": {
    "id": "uuid",
    "businessName": "ABC Construction"
  },
  "amount": 5000,
  "category": "ADVANCE",
  "paymentMode": "UPI",
  "purpose": "Medical emergency",
  "notes": "Need urgent funds for hospital bill",
  "status": "PENDING",
  "createdAt": "2026-01-24T15:30:00Z",
  "modifiedAmount": null,
  "modifiedCategory": null,
  "reviewedAt": null,
  "rejectionReason": null
}
```

---

### Approve Payment Request (Contractor Only)

**Endpoint:** `PATCH /payment-requests/:id/approve`

**Request:**
```json
{
  "modifiedAmount": 4000, // optional
  "modifiedCategory": "ADVANCE", // optional
  "modificationReason": "Reduced to available limit" // required if modified
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "paymentRequest": {
    "id": "uuid",
    "status": "APPROVED",
    "reviewedAt": "2026-01-24T15:35:00Z"
  },
  "transaction": {
    "id": "uuid",
    "amount": 4000,
    "status": "PENDING",
    "upiLink": "upi://pay?pa=ramesh@paytm&pn=Ramesh%20Kumar&am=4000&tr=TXN123&cu=INR"
  }
}
```

**Errors:**
- `403` - Only contractor can approve
- `400` - Request already reviewed

---

### Reject Payment Request (Contractor Only)

**Endpoint:** `PATCH /payment-requests/:id/reject`

**Request:**
```json
{
  "rejectionReason": "Insufficient funds available"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "paymentRequest": {
    "id": "uuid",
    "status": "REJECTED",
    "reviewedAt": "2026-01-24T15:35:00Z",
    "rejectionReason": "Insufficient funds available"
  }
}
```

---

## Transactions

### List Transactions

**Endpoint:** `GET /transactions`

**Query Params:**
- `workerId` (optional, contractor only)
- `category` (ADVANCE, SALARY, EXPENSE)
- `paymentMode` (CASH, UPI, BANK_TRANSFER)
- `status` (PENDING, COMPLETED, FAILED)
- `startDate`, `endDate`
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "transactions": [
    {
      "id": "uuid",
      "worker": {
        "id": "uuid",
        "fullName": "Ramesh Kumar"
      },
      "amount": 4000,
      "category": "ADVANCE",
      "paymentMode": "UPI",
      "status": "COMPLETED",
      "completedAt": "2026-01-24T15:40:00Z",
      "createdAt": "2026-01-24T15:35:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### Get Transaction Details

**Endpoint:** `GET /transactions/:id`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "paymentRequestId": "uuid",
  "worker": { /* ... */ },
  "contractor": { /* ... */ },
  "amount": 4000,
  "category": "ADVANCE",
  "paymentMode": "UPI",
  "status": "COMPLETED",
  "upiTransactionId": "UPI123456789",
  "completedAt": "2026-01-24T15:40:00Z",
  "createdAt": "2026-01-24T15:35:00Z",
  "ledgerEntries": [
    {
      "id": "uuid",
      "entryType": "ADVANCE_GIVEN",
      "amount": 4000,
      "createdAt": "2026-01-24T15:40:00Z"
    }
  ]
}
```

---

### Confirm Cash Payment (Contractor Only)

**Endpoint:** `POST /transactions/:id/confirm-cash`

**Request:**
```json
{
  "notes": "Cash handed over in person"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "status": "COMPLETED",
    "cashConfirmedAt": "2026-01-24T15:40:00Z"
  }
}
```

**Errors:**
- `400` - Transaction not in PENDING status or not CASH mode
- `403` - Only contractor can confirm

---

## Ledger

### Get Worker Ledger

**Endpoint:** `GET /ledger/worker/:workerId`

**Query Params:**
- `startDate`, `endDate`
- `entryType` (optional)
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "workerId": "uuid",
  "workerName": "Ramesh Kumar",
  "balance": {
    "salaryEarned": 25000,
    "salaryPaid": 10000,
    "advancesGiven": 20000,
    "outstandingBalance": -5000
  },
  "entries": [
    {
      "id": "uuid",
      "entryType": "ADVANCE_GIVEN",
      "amount": 4000,
      "description": "Payment request approved",
      "transactionId": "uuid",
      "createdAt": "2026-01-24T15:40:00Z"
    },
    {
      "id": "uuid",
      "entryType": "SALARY_EARNED",
      "amount": 25000,
      "description": "January 2026 salary accrual",
      "referenceMonth": "2026-01-01",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### Get Worker Balance

**Endpoint:** `GET /ledger/worker/:workerId/balance`

**Response:** `200 OK`
```json
{
  "workerId": "uuid",
  "workerName": "Ramesh Kumar",
  "salaryEarned": 25000,
  "salaryPaid": 10000,
  "advancesGiven": 20000,
  "expensesReimbursed": 0,
  "adjustmentCredits": 0,
  "adjustmentDebits": 0,
  "outstandingBalance": -5000,
  "lastUpdated": "2026-01-24T15:40:00Z"
}
```

---

### Create Adjustment Entry (Contractor Only)

**Endpoint:** `POST /ledger/adjustments`

**Request:**
```json
{
  "workerId": "uuid",
  "entryType": "ADJUSTMENT_CREDIT",
  "amount": 1000,
  "description": "Correction for missed payment on 2026-01-15"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "ledgerEntry": {
    "id": "uuid",
    "workerId": "uuid",
    "entryType": "ADJUSTMENT_CREDIT",
    "amount": 1000,
    "description": "Correction for missed payment on 2026-01-15",
    "createdAt": "2026-01-24T15:45:00Z"
  },
  "newBalance": -4000
}
```

**Errors:**
- `403` - Only contractor can create adjustments
- `400` - Invalid entry type (must be ADJUSTMENT_CREDIT or ADJUSTMENT_DEBIT)

---

## Dashboards

### Contractor Dashboard

**Endpoint:** `GET /dashboard/contractor`

**Query Params:**
- `startDate`, `endDate` (default: current month)

**Response:** `200 OK`
```json
{
  "summary": {
    "totalSpent": 150000,
    "totalWorkers": 12,
    "activeWorkers": 10,
    "pendingRequests": 3,
    "completedTransactions": 45
  },
  "breakdown": {
    "byCategory": {
      "salary": 80000,
      "advance": 60000,
      "expense": 10000
    },
    "byPaymentMode": {
      "cash": 40000,
      "upi": 90000,
      "bankTransfer": 20000
    }
  },
  "workerWiseSpend": [
    {
      "workerId": "uuid",
      "workerName": "Ramesh Kumar",
      "totalSpent": 25000,
      "advancesGiven": 20000,
      "salaryPaid": 5000
    }
  ],
  "projectWiseSpend": [
    {
      "projectId": "uuid",
      "projectName": "Site A Construction",
      "totalSpent": 75000,
      "workerCount": 6
    }
  ],
  "recentActivity": [ /* last 10 transactions */ ]
}
```

---

### Worker Dashboard

**Endpoint:** `GET /dashboard/worker`

**Query Params:**
- `period` (MONTH, LIFETIME)

**Response:** `200 OK`
```json
{
  "currentBalance": {
    "salaryEarned": 25000,
    "salaryPaid": 10000,
    "advancesGiven": 20000,
    "outstandingBalance": -5000
  },
  "monthlySummary": {
    "month": "2026-01",
    "totalReceived": 30000,
    "salaryReceived": 10000,
    "advancesReceived": 20000,
    "transactionCount": 8
  },
  "lifetimeSummary": {
    "totalReceived": 150000,
    "salaryReceived": 80000,
    "advancesReceived": 70000,
    "transactionCount": 45
  },
  "recentTransactions": [ /* last 10 transactions */ ],
  "pendingRequests": [ /* pending payment requests */ ]
}
```

---

## Projects

### Create Project (Contractor Only)

**Endpoint:** `POST /projects`

**Request:**
```json
{
  "name": "Site A Construction",
  "description": "Residential building construction",
  "location": "123 Main St, City",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "name": "Site A Construction",
    "isActive": true,
    "createdAt": "2026-01-24T15:50:00Z"
  }
}
```

---

### List Projects

**Endpoint:** `GET /projects`

**Query Params:**
- `isActive` (optional)
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "Site A Construction",
      "location": "123 Main St, City",
      "workerCount": 6,
      "totalSpent": 75000,
      "isActive": true,
      "startDate": "2026-01-01"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### Assign Worker to Project

**Endpoint:** `POST /projects/:id/workers`

**Request:**
```json
{
  "workerId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "assignment": {
    "id": "uuid",
    "workerId": "uuid",
    "projectId": "uuid",
    "assignedAt": "2026-01-24T15:55:00Z"
  }
}
```

---

## Notifications

### List Notifications

**Endpoint:** `GET /notifications`

**Query Params:**
- `isRead` (optional)
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "Payment Request Approved",
      "message": "Your request for ₹4,000 has been approved",
      "type": "PAYMENT_APPROVED",
      "isRead": false,
      "createdAt": "2026-01-24T15:35:00Z"
    }
  ],
  "unreadCount": 3,
  "pagination": { /* ... */ }
}
```

---

### Mark Notification as Read

**Endpoint:** `PATCH /notifications/:id/read`

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional additional context */ }
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `INTERNAL_SERVER_ERROR` (500)
- `RATE_LIMIT_EXCEEDED` (429)

---

## Rate Limiting

- **Default:** 100 requests per 15 minutes per IP
- **Auth endpoints:** 5 OTP requests per hour per phone number
- **Headers:**
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Pagination

All list endpoints support pagination:

**Request:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response:**
```json
{
  "data": [ /* ... */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Webhooks (Future)

For automated payment verification:
- `payment.completed`
- `payment.failed`
- `request.approved`
- `request.rejected`
