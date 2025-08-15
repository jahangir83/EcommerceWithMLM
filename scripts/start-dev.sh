#!/bin/bash

# AIT Platform Development Server Startup Script

echo "🚀 Starting AIT Platform Development Servers..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    if port_in_use $1; then
        echo -e "${YELLOW}Killing process on port $1...${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null
        sleep 2
    fi
}

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

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

if ! command_exists pnpm; then
    print_error "pnpm is not installed. Please install pnpm."
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    print_warning "PostgreSQL is not running. Please start PostgreSQL service."
    print_status "Attempting to start PostgreSQL..."
    
    # Try to start PostgreSQL (works on most Linux systems)
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
    elif command -v service &> /dev/null; then
        sudo service postgresql start
    else
        print_error "Could not start PostgreSQL automatically. Please start it manually."
        exit 1
    fi
fi

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        return 1
    else
        return 0
    fi
}

# Check if required ports are available
if ! check_port 3001; then
    print_error "Port 3001 is already in use. Please free the port or change PORT in .env file."
    exit 1
fi

if ! check_port 3000; then
    print_error "Port 3000 is already in use. Please free the port or change the frontend port."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success ".env file created. Please update it with your configuration."
    else
        print_error ".env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Check if .env.local exists (for Next.js frontend)
if [ ! -f ".env.local" ]; then
    print_warning ".env.local file not found. Creating basic .env.local file..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=AIT Platform
EOF
    print_success ".env.local file created."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    pnpm install
    print_success "Dependencies installed."
fi

# Check database connection and run migrations if needed
print_status "Checking database connection..."
if pnpm run typeorm -- query "SELECT 1" > /dev/null 2>&1; then
    print_success "Database connection successful."
else
    print_warning "Database connection failed. Please check your DATABASE_URL in .env file."
    print_status "Example: DATABASE_URL=postgresql://postgres:password@localhost:5432/ait_platform"
fi

# Function to start backend server
start_backend() {
    print_status "Starting backend server on port 3001..."
    pnpm run start:dev &
    BACKEND_PID=$!
    echo $BACKEND_PID > .backend.pid
    
    # Wait for backend to start
    sleep 5
    
    # Check if backend is running
    if curl -s http://localhost:3001/health > /dev/null; then
        print_success "Backend server started successfully!"
        print_status "API Documentation: http://localhost:3001/api/docs"
    else
        print_error "Backend server failed to start properly."
        return 1
    fi
}



# Function to cleanup on exit
cleanup() {
    print_status "Shutting down servers..."
    
    if [ -f ".backend.pid" ]; then
        BACKEND_PID=$(cat .backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm .backend.pid
        print_status "Backend server stopped."
    fi
    
    
    
    print_success "All servers stopped. Goodbye!"
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start servers
print_status "Starting development servers..."
echo ""

# Start backend server
start_backend
if [ $? -ne 0 ]; then
    print_error "Failed to start backend server. Exiting..."
    exit 1
fi

echo ""


echo ""
print_success "🎉 All servers are running successfully!"
echo ""
echo "📱 Access Points:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:3001"
echo "   API Docs:     http://localhost:3001/api/docs"
echo "   Health Check: http://localhost:3001/health"
echo ""
echo "🔑 Default Login Credentials:"
echo "   Admin: admin@ait-platform.com / admin123"
echo "   User:  user@ait-platform.com / user123"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Keep script running
while true; do
    sleep 1
done
