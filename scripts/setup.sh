#!/bin/bash

echo "🚀 Setting up AIT Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 13+ first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Create database
echo "🗄️  Setting up database..."
read -p "Enter database name (default: ait_platform): " DB_NAME
DB_NAME=${DB_NAME:-ait_platform}

read -p "Enter database user (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -s -p "Enter database password: " DB_PASS
echo

# Create database if it doesn't exist
createdb -U $DB_USER $DB_NAME 2>/dev/null || echo "Database might already exist"

# Update .env file
sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME|" .env

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env

echo "✅ Setup completed!"
echo "🔧 Next steps:"
echo "   1. Edit .env file if needed"
echo "   2. Run 'pnpm run start:dev' to start development server"
echo "   3. Visit http://localhost:3000 to see the application"
