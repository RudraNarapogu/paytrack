# How to run PayTrack using Docker

This guide explains how to run the entire project (Backend, Web Dashboard, and Database) using Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- Docker Compose (usually included with Docker Desktop).

## Steps to Run

### 1. Stop any local services
If you have the backend, frontend, or PostgreSQL running locally on your machine, stop them first to avoid port conflicts (Ports 3000, 3001, 5432).

### 2. Start all services
Open your terminal in the root directory of the project and run:

```bash
docker-compose up --build
```

This command will:
- Build the Docker images for the Backend and Web Dashboard.
- Pull the PostgreSQL image.
- Start all three containers.
- **Automatically initialize the database** with the required schema.

### 3. Access the Application

- **Web Dashboard:** [http://localhost:3001](http://localhost:3001)
- **Backend Health Check:** [http://localhost:3000/health](http://localhost:3000/health)
- **PostgreSQL Database:** Connected on port `5432`.

### 4. Logging In
Use the testing credentials as before:
- **Phone:** Any 10-digit number (e.g., `9876543210`)
- **OTP:** `000000`

## Useful Commands

- **Stop all services:**
  ```bash
  docker-compose down
  ```

- **Stop and remove volumes (restarts with fresh database):**
  ```bash
  docker-compose down -v
  ```

- **View logs:**
  ```bash
  docker-compose logs -f
  ```

- **Run in detached mode (background):**
  ```bash
  docker-compose up -d
  ```

## Troubleshooting

- **Port in use:** Ensure no other app is using 3000, 3001, or 5432.
- **Database Connection Error:** The backend is configured to wait for the database, but if it fails, try `docker-compose restart backend`.
- **Hot Reloading:** The project is configured with volumes, so changes you make to the code (in `backend/` or `web/`) will automatically reflect inside the containers.
