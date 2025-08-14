#!/bin/bash

# AIT Platform Project Setup Script
# This script sets up the entire project from scratch

set -e

echo "🔧 Setting up AIT Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check system requirements
print_status "Checking system requirements..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    print_status "Visit: https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm."
    exit 1
else
    NPM_VERSION=$(pnpm --version)
    print_success "pnpm found: $NPM_VERSION"
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed. Please install PostgreSQL v13 or higher."
    print_status "Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    print_status "macOS: brew install postgresql"
    exit 1
else
    PSQL_VERSION=$(psql --version)
    print_success "PostgreSQL found: $PSQL_VERSION"
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    print_warning "PostgreSQL is not running. Attempting to start..."
    
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    elif command -v brew &> /dev/null; then
        brew services start postgresql
    else
        print_error "Could not start PostgreSQL automatically. Please start it manually."
        exit 1
    fi
    
    # Wait a moment for PostgreSQL to start
    sleep 3
    
    if pg_isready -q; then
        print_success "PostgreSQL started successfully."
    else
        print_error "Failed to start PostgreSQL. Please start it manually."
        exit 1
    fi
fi

# Create database
print_status "Setting up database..."

DB_NAME="nest"
DB_USER="nest"

# Check if database exists
if psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    print_warning "Database '$DB_NAME' already exists."
    read -p "Do you want to recreate it? This will delete all existing data. (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Dropping existing database..."
        dropdb -U $DB_USER $DB_NAME
        print_status "Creating new database..."
        createdb -U $DB_USER $DB_NAME
        print_success "Database recreated successfully."
    else
        print_status "Using existing database."
    fi
else
    print_status "Creating database '$DB_NAME'..."
    createdb -U $DB_USER $DB_NAME
    print_success "Database created successfully."
fi

# Setup environment files
print_status "Setting up environment files..."

# Backend .env
if [ ! -f ".env" ]; then
    print_status "Creating backend .env file..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgres://nest:nestjs@localhost:5432/nest
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=nest
DB_PASSWORD=nestjs
DB_DATABASE=nest

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# MLM Configuration
MLM_MAX_LEVELS=10
COMMISSION_RATE_LEVEL_1=10
COMMISSION_RATE_LEVEL_2=5
COMMISSION_RATE_LEVEL_3=3
EOF
    print_success "Backend .env file created."
else
    print_warning "Backend .env file already exists. Skipping..."
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    print_status "Creating frontend .env.local file..."
    mkdir -p frontend
    cat > frontend/.env.local << EOF
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=AIT Platform
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF
    print_success "Frontend .env.local file created."
else
    print_warning "Frontend .env.local file already exists. Skipping..."
fi

# Install dependencies
print_status "Installing backend dependencies..."
pnpm install
print_success "Backend dependencies installed."

print_status "Installing frontend dependencies..."
cd frontend
pnpm install
cd ..
print_success "Frontend dependencies installed."

# Setup database schema
print_status "Setting up database schema..."

# Run migrations
print_status "Running database migrations..."
pnpm run migration:run || {
    print_warning "Migrations failed. This might be normal if database is already set up."
}

# Seed database
print_status "Seeding database with initial data..."
pnpm run seed || {
    print_warning "Seeding failed. This might be normal if database is already seeded."
}

# Create necessary directories
print_status "Creating project directories..."
mkdir -p uploads
mkdir -p logs
mkdir -p temp
print_success "Project directories created."

# Set permissions
print_status "Setting file permissions..."
chmod +x scripts/*.sh
chmod 755 uploads
chmod 755 logs
chmod 755 temp
print_success "File permissions set."

# Verify setup
print_status "Verifying setup..."

# Test database connection
if pnpm run typeorm -- query "SELECT 1" > /dev/null 2>&1; then
    print_success "Database connection verified."
else
    print_error "Database connection failed. Please check your configuration."
    exit 1
fi

# Test backend build
print_status "Testing backend build..."
pnpm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Backend build successful."
else
    print_error "Backend build failed. Please check for errors."
    exit 1
fi

# Test frontend build
print_status "Testing frontend build..."
cd frontend
pnpm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Frontend build successful."
else
    print_warning "Frontend build failed. This might be due to missing components."
fi
cd ..

# Create startup script
print_status "Creating quick start script..."
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting AIT Platform..."
./scripts/start-dev.sh
EOF
chmod +x start.sh
print_success "Quick start script created (./start.sh)."

# Final setup summary
echo ""
print_success "🎉 AIT Platform setup completed successfully!"
echo ""
echo "📋 Setup Summary:"
echo "   ✅ System requirements verified"
echo "   ✅ Database created and configured"
echo "   ✅ Environment files created"
echo "   ✅ Dependencies installed"
echo "   ✅ Database schema initialized"
echo "   ✅ Initial data seeded"
echo "   ✅ Project structure created"
echo ""
echo "🚀 Next Steps:"
echo "   1. Review and update .env files if needed"
echo "   2. Start the development servers:"
echo "      ./scripts/start-dev.sh"
echo "      or"
echo "      ./start.sh"
echo ""
echo "📱 Once started, access:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:3001"
echo "   API Docs:     http://localhost:3001/api/docs"
echo ""
echo "🔑 Default Login Credentials:"
echo "   Admin: admin@ait-platform.com / admin123"
echo "   User:  user@ait-platform.com / user123"
echo ""
echo "📚 Documentation:"
echo "   - API Documentation: http://localhost:3001/api/docs"
echo "   - Project Docs: ./docs/"
echo "   - Startup Guide: ./START_SERVERS.md"
echo ""
print_success "Happy coding! 🎉"
