# PayTrack Web Dashboard

React web application for PayTrack contractor analytics and management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Features

- Contractor dashboard with analytics
- Worker management
- Transaction history
- Financial reports
- Advanced filtering and exports

## Tech Stack

- React 18
- Vite (build tool)
- React Router
- Recharts (for analytics)
- Vanilla CSS

## Project Structure

```
web/
├── src/
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   ├── services/       # API service
│   ├── App.jsx         # Root component
│   ├── App.css         # App styles
│   └── index.css       # Global styles
├── index.html          # HTML template
└── vite.config.js      # Vite configuration
```

## Environment Variables

Create a `.env` file:
```
VITE_API_URL=http://localhost:3000/api/v1
```
