# Contributing to FlowversalAI

Welcome! We're excited that you're interested in contributing to FlowversalAI. This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Architecture Guidelines](#architecture-guidelines)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- **Be respectful**: Treat all contributors with respect and kindness
- **Be inclusive**: Welcome contributors from all backgrounds and experiences
- **Be collaborative**: Work together to improve the project
- **Be patient**: Understand that everyone has different levels of experience
- **Be constructive**: Provide helpful feedback and suggestions

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Git**: Version 2.30 or higher
- **MongoDB**: Version 7 or higher (for local development)
- **Redis**: Optional, for caching (local development)

### Environment Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/flowversal-ai.git
   cd flowversal-ai
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd App/Backend
   npm install

   # Frontend dependencies
   cd ../Frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp .env.example .env
   # Edit App/Backend/.env with your configuration

   # Frontend
   cp .env.example .env
   # Edit App/Frontend/.env with your configuration
   ```

4. **Start development databases**
   ```bash
   # MongoDB
   mongod

   # Redis (if using)
   redis-server
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

### First Contribution

1. **Find an issue**: Look for issues labeled `good first issue` or `help wanted`
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Make changes**: Follow the architecture and code standards below
4. **Write tests**: Ensure your changes are well-tested
5. **Update documentation**: Add or update relevant documentation
6. **Submit a PR**: Follow the pull request process below

## Development Workflow

### Branch Naming

Use descriptive branch names following this pattern:

```bash
# Features
git checkout -b feature/add-user-authentication
git checkout -b feature/implement-workflow-validation

# Bug fixes
git checkout -b fix/workflow-execution-crash
git checkout -b fix/ui-responsive-layout

# Documentation
git checkout -b docs/update-api-documentation
git checkout -b docs/add-contribution-guide

# Refactoring
git checkout -b refactor/modularize-workflow-services
git checkout -b refactor/optimize-bundle-size
```

### Commit Messages

Follow conventional commit format:

```bash
# Features
feat: add user authentication with OAuth
feat: implement workflow validation rules

# Bug fixes
fix: resolve workflow execution crash on invalid input
fix: correct responsive layout on mobile devices

# Documentation
docs: update API documentation for v2 endpoints
docs: add contribution guide for new developers

# Refactoring
refactor: modularize workflow services into separate executors
refactor: optimize bundle size with code splitting

# Testing
test: add unit tests for workflow validation
test: add integration tests for user authentication

# Chores
chore: update dependencies to latest versions
chore: configure CI/CD pipeline
```

### Development Process

1. **Choose a task**: Pick from the issue tracker or propose a new feature
2. **Create branch**: Follow the branch naming convention
3. **Implement changes**: Follow architecture guidelines and code standards
4. **Write tests**: Add comprehensive test coverage
5. **Test locally**: Ensure all tests pass and functionality works
6. **Update docs**: Add or update relevant documentation
7. **Commit changes**: Use clear, conventional commit messages
8. **Push branch**: Push your changes to your fork
9. **Create PR**: Submit a pull request with detailed description

## Architecture Guidelines

### Backend Architecture

Follow the modular backend architecture:

```
modules/{feature}/
├── routes/                 # API route definitions
│   ├── {feature}.routes.ts    # Main route file
│   ├── handlers/             # Route handler functions
│   ├── validators/           # Input validation schemas
│   └── types/               # Route-specific types
├── services/               # Business logic
│   ├── {feature}.service.ts     # Main service class
│   ├── {submodule}/            # Sub-service modules
│   └── index.ts              # Service exports
├── models/                 # Database models
├── types/                  # Module-level types
└── index.ts               # Module exports
```

**Key Principles:**
- Each module has a single responsibility
- Services are injected, not directly imported
- Comprehensive TypeScript typing
- Clear separation between routes, services, and models

### Frontend Architecture

Follow the feature-based frontend architecture:

```
features/{feature}/
├── components/             # React components
│   ├── {Feature}.tsx          # Main component
│   ├── {subcomponents}/       # Sub-components
│   ├── hooks/                # Component hooks
│   └── types/                # Component types
├── store/                  # State management
├── utils/                  # Feature utilities
├── types/                  # Feature types
└── index.ts               # Feature exports
```

**Key Principles:**
- Components are organized by feature, not by type
- Custom hooks encapsulate complex logic
- Zustand stores manage feature state
- TypeScript interfaces define all data structures

## Code Standards

### TypeScript Standards

- **Strict mode**: All TypeScript files use strict mode
- **Type definitions**: Define interfaces for all data structures
- **No any types**: Avoid `any` types; use proper type definitions
- **Generic constraints**: Use generics where appropriate

```typescript
// ✅ Good - Proper typing
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

function fetchUser(id: string): Promise<ApiResponse<User>> {
  // Implementation
}

// ❌ Bad - Using any
function fetchUser(id: string): Promise<any> {
  // Implementation
}
```

### React Standards

- **Functional components**: Use functional components with hooks
- **Custom hooks**: Extract complex logic into custom hooks
- **Props interface**: Define prop types for all components
- **Memoization**: Use `React.memo`, `useMemo`, and `useCallback` appropriately

```typescript
// ✅ Good - Well-structured component
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  theme: 'light' | 'dark';
}

export const UserCard = React.memo<UserCardProps>(({ user, onEdit, theme }) => {
  const handleEdit = useCallback(() => {
    onEdit(user);
  }, [user, onEdit]);

  return (
    <div className={`user-card ${theme}`}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
});
```

### Naming Conventions

- **Files**: kebab-case for file names (`user-card.tsx`, `user-service.ts`)
- **Components**: PascalCase (`UserCard`, `WorkflowBuilder`)
- **Functions**: camelCase (`getUser`, `createWorkflow`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`, `DEFAULT_TIMEOUT`)
- **Types**: PascalCase with descriptive names (`UserProfile`, `WorkflowConfig`)

### Code Style

- **ESLint**: Follow Airbnb configuration
- **Prettier**: Use consistent formatting
- **Import order**: Group imports by type (React, third-party, local)
- **Line length**: Maximum 100 characters per line

```typescript
// ✅ Good - Organized imports
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { User } from '../types/user.types';
import { userApi } from '../api/user.api';
import { useUserStore } from '../store/userStore';

// ❌ Bad - Disorganized imports
import {useState, useEffect} from "react"
import {observer} from 'mobx-react-lite'
import {useParams} from 'react-router-dom'
import {User} from '../types/user.types'
import {userApi} from '../api/user.api'
import {useUserStore} from '../store/userStore'
```

## Testing

### Testing Strategy

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test module interactions
- **E2E Tests**: Test complete user workflows
- **Coverage**: Aim for 80%+ code coverage

### Testing Frameworks

- **Backend**: Jest with Supertest for API testing
- **Frontend**: Jest with React Testing Library
- **E2E**: Playwright for end-to-end testing

### Writing Tests

```typescript
// Backend service test
describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };

      const result = await userService.createUser(userData);

      expect(result).toBeDefined();
      expect(result.name).toBe(userData.name);
      expect(result.email).toBe(userData.email);
    });

    it('should throw error for invalid email', async () => {
      const userData = { name: 'John Doe', email: 'invalid-email' };

      await expect(userService.createUser(userData)).rejects.toThrow('Invalid email');
    });
  });
});

// Frontend component test
import { render, screen, fireEvent } from '@testing-library/react';

describe('UserCard', () => {
  const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
  const mockOnEdit = jest.fn();

  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

### Running Tests

```bash
# Backend tests
cd App/Backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report

# Frontend tests
cd App/Frontend
npm test                   # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report

# E2E tests
npm run test:e2e          # Run end-to-end tests
```

## Documentation

### Documentation Standards

- **README files**: Every module/feature should have a README
- **Code comments**: Use JSDoc for functions and complex logic
- **API docs**: Document all API endpoints
- **Type definitions**: Self-documenting through TypeScript

### Documentation Structure

```
docs/
├── backend-development.md     # Backend development guide
├── frontend-development.md    # Frontend development guide
├── api/                       # API documentation
├── components/                # Component documentation
├── deployment.md             # Deployment guide
└── architecture/             # Architecture documentation
```

### Writing Documentation

```typescript
/**
 * Creates a new workflow with the specified configuration
 * @param config - The workflow configuration object
 * @param config.name - The name of the workflow
 * @param config.nodes - Array of workflow nodes
 * @param config.connections - Array of node connections
 * @returns Promise resolving to the created workflow
 * @throws {ValidationError} When the configuration is invalid
 * @throws {DuplicateError} When a workflow with the same name exists
 * @example
 * ```typescript
 * const workflow = await createWorkflow({
 *   name: 'User Onboarding',
 *   nodes: [/* node definitions */],
 *   connections: [/* connection definitions */]
 * });
 * ```
 */
export async function createWorkflow(config: WorkflowConfig): Promise<Workflow> {
  // Implementation
}
```

## Pull Request Process

### PR Checklist

Before submitting a PR, ensure:

- [ ] **Tests pass**: All tests are passing locally
- [ ] **Code style**: ESLint and Prettier checks pass
- [ ] **Type checking**: TypeScript compilation succeeds
- [ ] **Documentation**: Code is documented appropriately
- [ ] **Security**: No security vulnerabilities introduced
- [ ] **Performance**: No performance regressions

### PR Template

Use this template when creating pull requests:

```markdown
## Description
Brief description of the changes made

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have added tests that prove my fix/feature works
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings
- [ ] I have tested my changes in different browsers (if applicable)

## Testing
Describe the testing performed and any relevant test cases

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Additional Notes
Any additional information or context
```

### Review Process

1. **Automated Checks**: CI/CD runs linting, testing, and type checking
2. **Code Review**: At least one maintainer reviews the code
3. **Approval**: PR is approved and merged by a maintainer
4. **Deployment**: Changes are automatically deployed to staging

### Review Guidelines

**Reviewers should check for:**
- Code quality and adherence to standards
- Proper error handling and edge cases
- Test coverage and quality
- Documentation completeness
- Security considerations
- Performance implications

**Authors should:**
- Respond to review comments promptly
- Make requested changes clearly
- Re-request review when changes are complete

## Release Process

### Version Management

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)
- **MINOR**: New features (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes (1.0.0 → 1.0.1)

### Release Checklist

- [ ] **Version bump**: Update version in package.json files
- [ ] **Changelog**: Update CHANGELOG.md with release notes
- [ ] **Documentation**: Update any relevant documentation
- [ ] **Testing**: Run full test suite and E2E tests
- [ ] **Security**: Run security audit and vulnerability checks
- [ ] **Performance**: Verify performance benchmarks
- [ ] **Deployment**: Deploy to staging and verify functionality

### Release Types

- **Patch Release**: Bug fixes, security updates
- **Minor Release**: New features, enhancements
- **Major Release**: Breaking changes, major rewrites

## Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord**: For real-time chat and community support
- **Documentation**: Check docs/ folder for detailed guides

### Asking for Help

When asking for help, provide:

1. **Clear description**: What you're trying to accomplish
2. **Code examples**: Relevant code snippets
3. **Error messages**: Full error output
4. **Environment**: Node version, OS, etc.
5. **Steps to reproduce**: How to reproduce the issue

### Support Levels

- **Community Support**: Questions in GitHub Discussions
- **Priority Support**: Critical bugs and security issues
- **Commercial Support**: Available for enterprise customers

## Recognition

Contributors are recognized through:

- **GitHub Contributors**: Listed in repository contributors
- **Changelog**: Mentioned in release notes
- **Discord Roles**: Special roles for active contributors
- **Swag**: Stickers, t-shirts for major contributors

Thank you for contributing to FlowversalAI! 🚀
