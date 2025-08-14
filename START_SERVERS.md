# 🚀 AIT Platform - Server Startup Guide

This guide will help you start both the backend (NestJS) and frontend (Next.js) servers for the AIT Platform.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v13 or higher)
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## 🔧 Quick Setup

### Option 1: Automated Setup (Recommended)

\`\`\`bash
# Make scripts executable
chmod +x scripts/setup-project.sh
chmod +x scripts/start-dev.sh

# Run complete setup
./scripts/setup-project.sh

# Start both servers
./scripts/start-dev.sh
\`\`\`

### Option 2: Manual Setup

#### Step 1: Database Setup

\`\`\`bash
# Create PostgreSQL database
createdb ait_platform

# Or using psql
psql -U postgres
CREATE DATABASE ait_platform;
\q
\`\`\`

#### Step 2: Backend Server Setup

\`\`\`bash
# Install backend dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your database credentials
nano .env

# Run database migrations
npm run migration:run

# Seed initial data
npm run seed

# Start backend server (Port 3001)
npm run start:dev
\`\`\`

#### Step 3: Frontend Server Setup

\`\`\`bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local if needed
nano .env.local

# Start frontend server (Port 3000)
npm run dev
\`\`\`

## 🌐 Access Points

Once both servers are running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger API Documentation**: http://localhost:3001/api/docs
- **API Health Check**: http://localhost:3001/health

## 🔑 Default Credentials

### Admin Account
- **Email**: `admin@ait-platform.com`
- **Password**: `admin123`

### Test User Account
- **Email**: `user@ait-platform.com`
- **Password**: `user123`

## 📁 Project Structure

\`\`\`
ait-platform/
├── src/                    # Backend NestJS application
│   ├── auth/              # Authentication module
│   ├── user/              # User management
│   ├── products/          # Product management
│   ├── orders/            # Order processing
│   ├── mlm/               # MLM system
│   ├── admin/             # Admin operations
│   └── ...
├── frontend/              # Frontend Next.js application
│   ├── src/
│   │   ├── app/          # Next.js app directory
│   │   ├── components/   # Reusable components
│   │   └── lib/          # Utility functions
│   └── ...
├── docs/                  # Project documentation
├── scripts/               # Setup and deployment scripts
└── database/              # Database migrations and seeds
\`\`\`

## 🛠️ Development Commands

### Backend Commands

\`\`\`bash
# Development server with hot reload
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Generate database migration
npm run migration:generate -- MigrationName

# Run database migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Seed database
npm run seed
\`\`\`

### Frontend Commands

\`\`\`bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npm run type-check
\`\`\`

## 🔍 API Documentation

The backend includes comprehensive Swagger API documentation available at:
**http://localhost:3001/api/docs**

### Key API Endpoints:

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

#### Products
- `GET /products` - List products with filters
- `POST /products` - Create product (Vendor/Admin)
- `GET /products/:id` - Get product details

#### MLM System
- `GET /mlm/network` - Get user's MLM network
- `GET /mlm/commissions` - Get commission history
- `GET /mlm/ranks` - Get rank information

#### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error
\`\`\`bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U postgres -l | grep ait_platform

# Verify connection string in .env
DATABASE_URL=postgresql://username:password@localhost:5432/ait_platform
\`\`\`

#### 2. Port Already in Use
\`\`\`bash
# Check what's using port 3001
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Or use different port in .env
PORT=3002
\`\`\`

#### 3. Frontend API Connection Issues
\`\`\`bash
# Verify backend is running
curl http://localhost:3001/health

# Check frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

#### 4. Migration Errors
\`\`\`bash
# Reset database (WARNING: This will delete all data)
npm run migration:revert
npm run migration:run
npm run seed
\`\`\`

### Environment Variables

#### Backend (.env)
\`\`\`env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ait_platform
JWT_SECRET=your-super-secure-jwt-secret
PORT=3001
FRONTEND_URL=http://localhost:3000
\`\`\`

#### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=AIT Platform
\`\`\`

## 📊 Monitoring

### Health Checks
- Backend: `GET http://localhost:3001/health`
- Database: Check via health endpoint or direct connection

### Logs
- Backend logs: Console output when running `npm run start:dev`
- Frontend logs: Browser console and terminal output

## 🚀 Production Deployment

For production deployment, refer to:
- `docs/06-deployment-guide.md` - Complete deployment guide
- `docker-compose.yml` - Docker deployment
- `scripts/deploy.sh` - Deployment script

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed
4. Verify environment variables are set correctly
5. Check the API documentation at `/api/docs`

For additional support, refer to the project documentation in the `docs/` directory.

---

**Happy Coding! 🎉**
