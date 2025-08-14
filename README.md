# AIT Platform - Multi-vendor E-commerce with MLM System

A comprehensive multi-vendor e-commerce platform with integrated MLM (Multi-Level Marketing) system, built with NestJS, TypeScript, and PostgreSQL.

## Features

### 🛒 E-commerce
- Multi-vendor marketplace
- Product catalog with categories
- Shopping cart and checkout
- Order management
- Payment processing (Multiple gateways)
- Inventory management

### 👥 MLM System
- 10-level commission structure
- Referral tracking
- Leadership progression
- Commission calculations
- Revenue sharing

### 💰 Financial Management
- Multi-wallet system (Money, Points, Commission)
- Double-entry accounting
- Transaction history
- Withdrawal management
- Revenue reports

### 🎓 Business Services
- Digital courses
- Subscription services
- Uddokta (Entrepreneur) programs
- Service enrollment

### 📊 Admin Dashboard
- Comprehensive analytics
- User management
- Order tracking
- Commission management
- Reports and exports

### 🔔 Notifications
- Real-time notifications
- Email alerts
- System announcements
- Commission notifications

## Tech Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **Caching**: Redis (optional)
- **File Storage**: AWS S3 (optional)

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis (optional)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd ait-platform
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Environment setup**
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. **Database setup**
\`\`\`bash
# Create database
createdb ait_platform

# Run migrations (auto-sync enabled in development)
npm run start:dev
\`\`\`

5. **Start the application**
\`\`\`bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
\`\`\`

### Docker Setup

1. **Using Docker Compose**
\`\`\`bash
docker-compose up -d
\`\`\`

This will start:
- Application server (port 3000)
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Nginx reverse proxy (port 80)

## API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3000/api
- **API Docs**: See `docs/07-api-documentation.md`

## Project Structure

\`\`\`
src/
├── auth/                 # Authentication module
├── user/                 # User management
├── products/             # Product catalog
├── orders/               # Order management
├── payments/             # Payment processing
├── transactions/         # Financial transactions
├── mlm/                  # MLM system
├── vendor/               # Vendor management
├── admin/                # Admin dashboard
├── notifications/        # Notification system
├── reports/              # Reporting system
├── core-service/         # Business services
├── common/               # Shared utilities
├── entity/               # Database entities
└── database/             # Database configuration
\`\`\`

## Key Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/use-referral` - Use referral code

### Products
- `GET /products` - List products
- `GET /products/:id` - Get product details
- `GET /categories` - List categories

### Orders
- `POST /orders` - Create order
- `GET /orders` - List user orders
- `GET /orders/:id` - Get order details

### MLM
- `GET /mlm/network` - Get referral network
- `GET /mlm/commissions` - Commission history
- `GET /mlm/leadership` - Leadership information

### Payments
- `POST /payments` - Create payment
- `POST /payments/:id/process` - Process payment

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `THROTTLE_TTL` | Rate limit TTL | 60 |
| `THROTTLE_LIMIT` | Rate limit count | 100 |

### MLM Configuration

The MLM system supports:
- **Commission Levels**: 10 levels (configurable)
- **Commission Rates**: [10%, 8%, 7%, 6%, 5%, 4%, 3%, 2%, 1%, 1%]
- **Leadership Levels**: Configurable via database
- **Qualification Requirements**: Customizable targets

## Database Schema

### Core Entities
- **Users**: User accounts and profiles
- **Products**: Product catalog
- **Orders**: Order management
- **Transactions**: Financial transactions
- **Wallets**: Multi-wallet system
- **RevenueShares**: MLM commissions

### Relationships
- Users have multiple wallets
- Orders contain multiple items
- Transactions have journal entries
- Users have referral relationships

## Testing

\`\`\`bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
\`\`\`

## Deployment

### Production Deployment

1. **Build the application**
\`\`\`bash
npm run build
\`\`\`

2. **Set production environment**
\`\`\`bash
export NODE_ENV=production
\`\`\`

3. **Start with PM2**
\`\`\`bash
npm install -g pm2
pm2 start dist/main.js --name ait-platform
\`\`\`

### Docker Deployment

\`\`\`bash
# Build image
docker build -t ait-platform .

# Run container
docker run -d -p 3000:3000 --env-file .env ait-platform
\`\`\`

## Security Features

- JWT authentication
- Role-based access control
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration

## Performance Optimization

- Database indexing
- Query optimization
- Caching with Redis
- Connection pooling
- Pagination
- Lazy loading

## Monitoring & Logging

- Request logging
- Error tracking
- Performance metrics
- Health checks
- Database monitoring

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- **Email**: support@ait-platform.com
- **Documentation**: `/docs` folder
- **Issues**: GitHub Issues

## Roadmap

### Phase 1 (Current)
- ✅ Core e-commerce functionality
- ✅ MLM system implementation
- ✅ Basic admin dashboard
- ✅ Payment integration

### Phase 2 (Next)
- 📱 Mobile app (React Native)
- 🔔 Real-time notifications
- 📊 Advanced analytics
- 🌐 Multi-language support

### Phase 3 (Future)
- 🤖 AI-powered recommendations
- 📱 Progressive Web App
- 🔗 Blockchain integration
- 🌍 Multi-currency support

---

**Built with ❤️ by the AIT Team**
