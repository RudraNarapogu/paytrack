# PayTrack Mobile App

React Native mobile application for PayTrack - Contractor Payment Tracking System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install iOS dependencies (Mac only):
```bash
cd ios && pod install && cd ..
```

3. Start Metro bundler:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

5. Run on iOS (Mac only):
```bash
npm run ios
```

## Features

- OTP-based authentication
- Worker dashboard with balance tracking
- Money request workflow
- Contractor dashboard with analytics
- Payment approval system
- Transaction history

## Tech Stack

- React Native 0.73
- React Navigation
- React Native Paper (Material Design)
- Axios for API calls
- AsyncStorage for local data

## Environment Variables

Create a `.env` file:
```
API_BASE_URL=http://localhost:3000/api/v1
```

## Project Structure

```
mobile/
├── src/
│   ├── config/         # Theme and configuration
│   ├── context/        # React Context (Auth)
│   ├── navigation/     # Navigation setup
│   ├── screens/        # All screens
│   │   ├── auth/       # Login, OTP
│   │   ├── worker/     # Worker screens
│   │   └── contractor/ # Contractor screens
│   └── services/       # API service
├── App.js              # Root component
└── index.js            # Entry point
```
