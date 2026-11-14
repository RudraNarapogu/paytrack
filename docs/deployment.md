# PayTrack Deployment Guide

**Version:** 1.0.0  
**Last Updated:** January 2026

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Staging Deployment](#staging-deployment)
5. [Production Deployment](#production-deployment)
6. [Database Migrations](#database-migrations)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- ✅ AWS Account (for production infrastructure)
- ✅ Firebase Account (for OTP authentication)
- ✅ GitHub Account (for CI/CD)
- ✅ Domain name (for production)

### Required Tools
- Node.js 20+ LTS
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Terraform 1.6+
- AWS CLI 2.0+
- kubectl (for Kubernetes, optional)

### Required Credentials
- AWS Access Key ID & Secret
- Firebase Admin SDK credentials
- Database credentials
- JWT secret keys

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/paytrack.git
cd paytrack
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Mobile
cd ../mobile
npm install

# Web
cd ../web
npm install
```

### 3. Environment Variables

Create `.env` files for each environment:

#### Backend `.env`

```bash
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=paytrack_dev
DATABASE_USER=paytrack
DATABASE_PASSWORD=your_password_here
DATABASE_SSL=false
DATABASE_LOGGING=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your_jwt_secret_here_min_32_chars
JWT_EXPIRATION=900
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRATION=604800

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=paytrack-uploads

# SMS (AWS SNS)
SMS_SENDER_ID=PayTrack
SMS_ENABLED=true

# Push Notifications
FCM_SERVER_KEY=your_fcm_server_key

# Rate Limiting
RATE_LIMIT_TTL=900
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3001

# Logging
LOG_LEVEL=debug
SENTRY_DSN=your_sentry_dsn
```

#### Mobile `.env`

```bash
API_URL=http://localhost:3000/v1
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
ENVIRONMENT=development
```

#### Web `.env`

```bash
VITE_API_URL=http://localhost:3000/v1
VITE_ENVIRONMENT=development
```

---

## Local Development

### Option 1: Docker Compose (Recommended)

```bash
cd infrastructure
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

**Services:**
- Backend API: http://localhost:3000
- Web Dashboard: http://localhost:5173
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- PgAdmin: http://localhost:5050

### Option 2: Manual Setup

#### 1. Start PostgreSQL

```bash
# Using Homebrew (macOS)
brew services start postgresql@15

# Using apt (Ubuntu)
sudo systemctl start postgresql

# Create database
createdb paytrack_dev

# Run schema
psql paytrack_dev < database/schema.sql
```

#### 2. Start Redis

```bash
# Using Homebrew (macOS)
brew services start redis

# Using apt (Ubuntu)
sudo systemctl start redis
```

#### 3. Start Backend

```bash
cd backend
npm run start:dev
```

#### 4. Start Web Dashboard

```bash
cd web
npm run dev
```

#### 5. Start Mobile App

```bash
cd mobile

# iOS
npm run ios

# Android
npm run android
```

---

## Staging Deployment

### Infrastructure Setup (AWS)

#### 1. Configure AWS CLI

```bash
aws configure
# Enter AWS Access Key ID
# Enter AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

#### 2. Create Infrastructure with Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file=staging.tfvars

# Apply configuration
terraform apply -var-file=staging.tfvars
```

**Created Resources:**
- VPC with public/private subnets
- RDS PostgreSQL instance (db.t3.medium)
- ElastiCache Redis cluster
- EC2 instances (t3.medium) with Auto Scaling
- Application Load Balancer
- S3 bucket for uploads
- CloudWatch log groups

#### 3. Database Setup

```bash
# Get RDS endpoint from Terraform output
terraform output rds_endpoint

# Connect to RDS
psql -h <rds_endpoint> -U paytrack -d paytrack_staging

# Run schema
psql -h <rds_endpoint> -U paytrack -d paytrack_staging < database/schema.sql
```

### Application Deployment

#### 1. Build Docker Image

```bash
cd backend

# Build image
docker build -t paytrack-backend:staging .

# Tag for ECR
docker tag paytrack-backend:staging <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/paytrack-backend:staging

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com

# Push to ECR
docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/paytrack-backend:staging
```

#### 2. Deploy to EC2

```bash
# SSH to EC2 instance
ssh -i paytrack-staging.pem ec2-user@<ec2_public_ip>

# Pull latest image
docker pull <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/paytrack-backend:staging

# Stop existing container
docker stop paytrack-backend || true
docker rm paytrack-backend || true

# Run new container
docker run -d \
  --name paytrack-backend \
  -p 3000:3000 \
  --env-file /home/ec2-user/.env.staging \
  --restart unless-stopped \
  <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/paytrack-backend:staging

# Check logs
docker logs -f paytrack-backend
```

#### 3. Deploy Web Dashboard

```bash
cd web

# Build for production
npm run build

# Upload to S3
aws s3 sync dist/ s3://paytrack-staging-web --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <distribution_id> --paths "/*"
```

### Verification

```bash
# Health check
curl https://staging-api.paytrack.app/health

# Test authentication
curl -X POST https://staging-api.paytrack.app/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210"}'
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificates ready
- [ ] DNS configured
- [ ] Monitoring alerts configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### Blue-Green Deployment Strategy

#### 1. Prepare Green Environment

```bash
cd infrastructure/terraform

# Create green environment
terraform apply -var-file=production.tfvars -var="environment=green"
```

#### 2. Deploy to Green

```bash
# Build and push Docker image
docker build -t paytrack-backend:v1.0.0 .
docker tag paytrack-backend:v1.0.0 <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/paytrack-backend:v1.0.0
docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/paytrack-backend:v1.0.0

# Deploy to green instances
# (Use deployment script or CI/CD pipeline)
```

#### 3. Run Smoke Tests

```bash
# Test green environment
./scripts/smoke-tests.sh https://green.paytrack.app

# Expected output:
# ✅ Health check passed
# ✅ Authentication working
# ✅ Database connection OK
# ✅ Redis connection OK
```

#### 4. Switch Traffic

```bash
# Update ALB target group to point to green
aws elbv2 modify-listener \
  --listener-arn <listener_arn> \
  --default-actions Type=forward,TargetGroupArn=<green_target_group_arn>

# Verify traffic switch
curl https://api.paytrack.app/health
```

#### 5. Monitor

```bash
# Watch CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --dimensions Name=LoadBalancer,Value=<load_balancer_name> \
  --start-time 2026-01-24T00:00:00Z \
  --end-time 2026-01-24T23:59:59Z \
  --period 300 \
  --statistics Average

# Check error rate
# If error rate > 5%, rollback immediately
```

#### 6. Decommission Blue (After 24 Hours)

```bash
# If green is stable, decommission blue
terraform destroy -var-file=production.tfvars -var="environment=blue"
```

### Rollback Procedure

```bash
# Switch traffic back to blue
aws elbv2 modify-listener \
  --listener-arn <listener_arn> \
  --default-actions Type=forward,TargetGroupArn=<blue_target_group_arn>

# Verify rollback
curl https://api.paytrack.app/health
```

---

## Database Migrations

### Creating Migrations

```bash
cd backend

# Generate migration
npm run migration:generate -- -n AddWorkerPhoneIndex

# Edit migration file in src/migrations/
```

### Running Migrations

```bash
# Development
npm run migration:run

# Staging
NODE_ENV=staging npm run migration:run

# Production (with backup)
# 1. Create backup first
pg_dump -h <rds_endpoint> -U paytrack paytrack_production > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migration
NODE_ENV=production npm run migration:run

# 3. Verify
psql -h <rds_endpoint> -U paytrack -d paytrack_production -c "SELECT * FROM migrations;"
```

### Rolling Back Migrations

```bash
# Revert last migration
npm run migration:revert

# Restore from backup (if needed)
psql -h <rds_endpoint> -U paytrack -d paytrack_production < backup_20260124_120000.sql
```

---

## Monitoring & Logging

### CloudWatch Dashboards

**Key Metrics:**
- API request rate
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database connections
- CPU & memory utilization

**Access Dashboard:**
```bash
# Open CloudWatch console
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=PayTrack-Production
```

### Log Aggregation

```bash
# View API logs
aws logs tail /aws/ec2/paytrack-backend --follow

# Filter errors
aws logs filter-pattern /aws/ec2/paytrack-backend --filter-pattern "ERROR"

# Export logs
aws logs create-export-task \
  --log-group-name /aws/ec2/paytrack-backend \
  --from 1706054400000 \
  --to 1706140800000 \
  --destination paytrack-logs-export
```

### Alerts

**Critical Alerts (PagerDuty):**
- API error rate > 5%
- Database connection failures
- Payment processing failures
- Authentication service down

**Warning Alerts (Slack):**
- API response time > 1s (p95)
- Database CPU > 80%
- Disk space < 20%

**Configure Alerts:**
```bash
# Create CloudWatch alarm
aws cloudwatch put-metric-alarm \
  --alarm-name paytrack-high-error-rate \
  --alarm-description "Trigger when error rate exceeds 5%" \
  --metric-name 5XXError \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions <sns_topic_arn>
```

---

## Backup & Recovery

### Automated Backups

**RDS Automated Backups:**
- Daily backups at 3:00 AM UTC
- Retention: 30 days
- Point-in-time recovery: 5-minute granularity

**Manual Backup:**
```bash
# Create RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier paytrack-production \
  --db-snapshot-identifier paytrack-manual-$(date +%Y%m%d-%H%M%S)

# List snapshots
aws rds describe-db-snapshots --db-instance-identifier paytrack-production
```

### Disaster Recovery

#### Scenario 1: Database Corruption

```bash
# 1. Stop application
docker stop paytrack-backend

# 2. Restore from latest snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier paytrack-production-restored \
  --db-snapshot-identifier <snapshot_id>

# 3. Update DNS/connection string
# 4. Restart application
docker start paytrack-backend
```

#### Scenario 2: Complete Region Failure

```bash
# 1. Promote read replica in different region
aws rds promote-read-replica \
  --db-instance-identifier paytrack-production-replica-us-west-2

# 2. Update Route53 to point to new region
aws route53 change-resource-record-sets \
  --hosted-zone-id <zone_id> \
  --change-batch file://dns-failover.json

# 3. Deploy application in new region
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Timeout

**Symptoms:**
```
Error: Connection timeout
```

**Solution:**
```bash
# Check security group rules
aws ec2 describe-security-groups --group-ids <sg_id>

# Verify RDS is running
aws rds describe-db-instances --db-instance-identifier paytrack-production

# Test connection
psql -h <rds_endpoint> -U paytrack -d paytrack_production
```

#### 2. High Memory Usage

**Symptoms:**
```
OOM Killer terminated process
```

**Solution:**
```bash
# Check memory usage
docker stats paytrack-backend

# Increase instance size
# Update Terraform configuration
# Apply changes
terraform apply -var-file=production.tfvars
```

#### 3. SSL Certificate Expired

**Symptoms:**
```
SSL certificate expired
```

**Solution:**
```bash
# Renew certificate (Let's Encrypt)
certbot renew

# Update ALB listener
aws elbv2 modify-listener \
  --listener-arn <listener_arn> \
  --certificates CertificateArn=<new_cert_arn>
```

#### 4. Redis Connection Failed

**Symptoms:**
```
Error: Redis connection refused
```

**Solution:**
```bash
# Check ElastiCache status
aws elasticache describe-cache-clusters --cache-cluster-id paytrack-production

# Test connection
redis-cli -h <redis_endpoint> ping

# Restart Redis cluster (if needed)
aws elasticache reboot-cache-cluster --cache-cluster-id paytrack-production
```

---

## CI/CD Pipeline (GitHub Actions)

### Workflow File: `.github/workflows/deploy.yml`

```yaml
name: Deploy PayTrack

on:
  push:
    branches:
      - develop  # Staging
      - main     # Production

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd backend && npm ci
      - run: cd backend && npm run test
      - run: cd backend && npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: |
          docker build -t paytrack-backend:${{ github.sha }} backend/
          docker tag paytrack-backend:${{ github.sha }} ${{ secrets.ECR_REGISTRY }}/paytrack-backend:${{ github.sha }}
          aws ecr get-login-password | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
          docker push ${{ secrets.ECR_REGISTRY }}/paytrack-backend:${{ github.sha }}

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - run: |
          # Deploy to staging
          # Run smoke tests

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: |
          # Blue-green deployment
          # Run smoke tests
          # Switch traffic
```

---

## Performance Optimization

### Database Optimization

```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_transactions_worker_created 
ON transactions(worker_id, created_at DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM transactions WHERE worker_id = 'uuid' ORDER BY created_at DESC LIMIT 20;

-- Update statistics
ANALYZE transactions;
```

### API Optimization

```bash
# Enable response compression
# Add to main.ts
app.use(compression());

# Implement caching
# Cache dashboard data for 5 minutes
```

---

## Security Hardening

### SSL/TLS Configuration

```bash
# Generate strong SSL certificate
certbot certonly --standalone -d api.paytrack.app

# Configure ALB with TLS 1.3 only
aws elbv2 modify-listener \
  --listener-arn <listener_arn> \
  --ssl-policy ELBSecurityPolicy-TLS-1-3-2021-06
```

### Secrets Management

```bash
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name paytrack/production/database \
  --secret-string '{"username":"paytrack","password":"strong_password"}'

# Retrieve in application
aws secretsmanager get-secret-value --secret-id paytrack/production/database
```

---

## Maintenance Windows

**Recommended Schedule:**
- Database maintenance: Sunday 2:00 AM - 4:00 AM UTC
- Application updates: Tuesday/Thursday 10:00 PM - 11:00 PM UTC

**Notification:**
- Email users 48 hours in advance
- Display in-app banner 24 hours before
- Post on status page

---

## Support & Escalation

**Level 1 (DevOps):**
- Infrastructure issues
- Deployment failures
- Performance degradation

**Level 2 (Backend Team):**
- API errors
- Database issues
- Integration failures

**Level 3 (CTO):**
- Critical system failures
- Security incidents
- Data breaches

**Contact:**
- Slack: #paytrack-ops
- PagerDuty: paytrack-oncall
- Email: ops@paytrack.app

---

**Last Updated:** January 2026  
**Maintained by:** PayTrack DevOps Team
