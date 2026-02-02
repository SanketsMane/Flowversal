# FlowversalAI - Modern Workflow Automation Platform

> **Enterprise-grade workflow automation with AI-powered capabilities**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/flowversal/flowversal-ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb)](https://reactjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4+-000000)](https://www.fastify.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-47a248)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 Overview

FlowversalAI is a comprehensive workflow automation platform that combines visual workflow building, AI-powered automation, and enterprise-grade reliability. The platform enables users to create complex automated workflows through an intuitive drag-and-drop interface, enhanced with AI capabilities for intelligent automation.

### ✨ Key Features

- **Visual Workflow Builder**: Intuitive drag-and-drop interface for creating complex workflows
- **AI-Powered Automation**: Integration with multiple AI models for intelligent decision-making
- **Multi-Platform Support**: Web, mobile, and API integrations
- **Enterprise Security**: Advanced authentication, authorization, and data protection
- **Scalable Architecture**: Microservices-based design with horizontal scaling
- **Real-time Collaboration**: Multi-user workflow editing and team management

## 🏗️ Architecture

### Backend Architecture

The backend follows a modular, service-oriented architecture with clear separation of concerns:

```
backend/
├── modules/                 # Feature modules
│   ├── workflows/          # Workflow management
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Data models
│   │   └── types/          # TypeScript types
│   ├── tasks/              # Task management
│   ├── projects/           # Project management
│   ├── users/              # User management
│   └── ai/                 # AI services
├── core/                   # Core infrastructure
│   ├── config/            # Configuration management
│   ├── middleware/        # HTTP middleware
│   ├── stores/            # State management
│   └── auth/              # Authentication
├── services/              # Shared services
│   ├── workflow/          # Workflow execution
│   └── nodes/             # Node executors
└── infrastructure/        # Infrastructure services
    ├── database/          # Database connections
    ├── queue/             # Background jobs
    └── storage/           # File storage
```

### Frontend Architecture

The frontend uses a component-based architecture with modern React patterns:

```
frontend/
├── app/                    # Application entry points
├── core/                   # Core infrastructure
│   ├── auth/              # Authentication
│   ├── theme/             # Theme management
│   ├── api/               # API layer
│   └── stores/            # Global state
├── features/              # Feature modules
│   ├── workflows/         # Workflow management
│   ├── projects/          # Project management
│   ├── tasks/             # Task management
│   └── ai/                # AI features
├── shared/                # Shared components
│   ├── components/        # Reusable UI components
│   ├── utils/             # Utility functions
│   └── hooks/             # Shared React hooks
└── assets/                # Static assets
```

## 📁 Directory Structure

### Backend Modules

Each backend module follows a consistent structure:

```
modules/{feature}/
├── routes/                 # API route handlers
│   ├── {feature}.routes.ts    # Main route definitions
│   ├── handlers/             # Route handler functions
│   ├── validators/           # Input validation
│   └── types/               # Route-specific types
├── services/               # Business logic
│   ├── {feature}.service.ts     # Main service class
│   ├── {submodule}/            # Sub-service modules
│   │   ├── executors/         # Execution logic
│   │   ├── validators/        # Business validation
│   │   └── types/            # Service types
│   └── index.ts              # Service exports
├── models/                 # Database models
├── types/                  # TypeScript definitions
└── index.ts               # Module exports
```

### Frontend Features

Each frontend feature follows a consistent structure:

```
features/{feature}/
├── components/             # React components
│   ├── {Feature}.tsx          # Main component
│   ├── {subcomponents}/       # Sub-components
│   ├── hooks/                # Feature-specific hooks
│   └── types/                # Component types
├── store/                  # Feature state management
├── utils/                  # Feature utilities
├── types/                  # Feature type definitions
└── index.ts               # Feature exports
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB 7+
- Redis (optional, for caching)
- Docker (optional, for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/flowversal/flowversalAI.git
   cd flowversalAI
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd App/Backend
   npm install

   # Frontend
   cd ../Frontend
   npm install
   ```

3. **Environment setup**
   ```bash
   # Copy environment files
   cp App/Backend/.env.example App/Backend/.env
   cp App/Frontend/.env.example App/Frontend/.env

   # Edit environment variables
   # See configuration guides below
   ```

4. **Database setup**
   ```bash
   # Start MongoDB
   mongod

   # Run database migrations (if any)
   cd App/Backend
   npm run db:migrate
   ```

5. **Start development servers**
   ```bash
   # Backend (Terminal 1)
   cd App/Backend
   npm run dev

   # Frontend (Terminal 2)
   cd App/Frontend
   npm run dev
   ```

6. **(Optional) Run with Docker Compose**
   ```bash
   cd App
   docker compose up --build
   # Frontend: http://localhost:3000
   # Backend:  http://localhost:3001/api/v1/health
   ```

### Environment Configuration

Additional guides:
- Onboarding: `docs/onboarding.md`
- API quickstart: `docs/api-quickstart.md`

#### Backend Configuration

Create `App/Backend/.env` with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/flowversal
REDIS_URL=redis://localhost:6379

# Authentication
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
```

#### Frontend Configuration

Create `App/Frontend/.env` with:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3002/api/v1

# Authentication
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Analytics (optional)
VITE_GA_TRACKING_ID=your_ga_id
```

## 🛠️ Development

#### Developer Tooling
- EditorConfig enforced via `.editorconfig` (LF, 2-space indents, final newline).
- VS Code recommendations in `.vscode/` (Prettier, ESLint, Tailwind).
- Husky + lint/format/type-check/test scripts available per app (`npm run lint`, `npm run type-check`, `npm run test`).

### Code Organization

This project follows industry best practices for code organization:

- **Single Responsibility**: Each module/component has one clear purpose
- **Dependency Injection**: Services are injected rather than imported directly
- **Type Safety**: Comprehensive TypeScript coverage
- **Testing**: Unit and integration tests for all components
- **Documentation**: Inline documentation and API docs

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow the architecture patterns**
   - Backend: Use the modular service structure
   - Frontend: Use the feature-based component structure
   - Always add types for new interfaces

3. **Write tests**
   ```bash
   # Backend tests
   cd App/Backend
   npm test

   # Frontend tests
   cd App/Frontend
   npm test
   ```

4. **Update documentation**
   - Update relevant README files
   - Add JSDoc comments for new functions
   - Update API documentation

### Available Scripts

#### Backend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run E2E tests
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run dev:seed     # Seed database with test data
npm run dev:reset    # Reset database
npm run dev:health   # Check system health
```

#### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run E2E tests with Playwright
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## 📚 Documentation

### Developer Guides

- [Backend Development Guide](./docs/backend-development.md)
- [Frontend Development Guide](./docs/frontend-development.md)
- [API Documentation](./docs/api/)
- [Component Library](./docs/components/)
- [Deployment Guide](./docs/deployment.md)

### Architecture Documentation

- [System Architecture](./docs/architecture/system-overview.md)
- [Database Schema](./docs/architecture/database-schema.md)
- [API Design](./docs/architecture/api-design.md)
- [Security Model](./docs/architecture/security.md)

### Refactoring Documentation

- [Refactoring Overview](./docs/refactoring/overview.md)
- [Migration Guide](./docs/refactoring/migration-guide.md)
- [Best Practices](./docs/refactoring/best-practices.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch
3. Make your changes following our patterns
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb config with React rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Structured commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔧 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB is running: `mongod`
- Verify environment variables are set correctly
- Check port 3002 is not already in use

**Frontend build fails:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (requires 18+)
- Verify all environment variables are set

**Tests failing:**
- Ensure test database is configured
- Check test environment variables
- Run `npm run type-check` to verify TypeScript errors

**Import errors:**
- Verify path aliases in tsconfig.json
- Check file extensions in imports
- Run `npm run format` to fix formatting issues

**Performance issues:**
- Check database indexes are created
- Monitor memory usage with `npm run dev:health`
- Review performance metrics in monitoring dashboard

## 🙋 Support

- **Documentation**: [docs.flowversal.ai](https://docs.flowversal.ai)
- **Issues**: [GitHub Issues](https://github.com/flowversal/flowversal-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/flowversal/flowversal-ai/discussions)
- **Discord**: [Join our community](https://discord.gg/flowversal)

## 🏆 Acknowledgments

- **React Team** for the amazing React framework
- **Fastify Team** for the high-performance web framework
- **Supabase Team** for the excellent BaaS platform
- **OpenAI** for pioneering AI accessibility
- **MongoDB** for the powerful document database

---

**Built with ❤️ by the FlowversalAI team**
