# Contributing to Carfax Manus

Thank you for your interest in contributing to Carfax Manus! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

1. **Fork the repository**
   ```bash
   gh repo fork mayo3030/carfax-manus --clone
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Write clear, descriptive commit messages
   - Add tests for new functionality

4. **Test your changes**
   ```bash
   pnpm test
   pnpm build
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear description of changes
   - Reference related issues
   - Include screenshots for UI changes

## Development Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

## Coding Standards

### TypeScript
- Use strict mode
- Define proper types for all functions
- Avoid `any` types

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use meaningful component names

### Database
- Use Drizzle ORM for all queries
- Add proper indexes for performance
- Write migrations for schema changes

### Testing
- Write tests for new features
- Aim for >80% code coverage
- Use Vitest for unit tests

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, etc.

### Examples
```
feat(carfax): add VIN validation
fix(api): resolve tRPC query timeout
docs(readme): update installation instructions
```

## Pull Request Process

1. Update the README.md with any new features
2. Update CHANGELOG.md with your changes
3. Ensure all tests pass
4. Request review from maintainers
5. Address review feedback
6. Merge when approved

## Reporting Issues

### Bug Reports
Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)

### Feature Requests
Include:
- Clear description of the feature
- Use cases and benefits
- Possible implementation approach
- Any relevant examples

## Project Structure

```
carfax-manus/
├── client/          # React frontend
├── server/          # Express backend
├── drizzle/         # Database schema
├── storage/         # S3 helpers
└── shared/          # Shared types
```

## Key Areas for Contribution

- **Frontend**: UI improvements, new components, better UX
- **Backend**: API optimization, error handling, new features
- **Database**: Schema optimization, migrations
- **Documentation**: README, guides, API docs
- **Testing**: Unit tests, integration tests
- **DevOps**: CI/CD improvements, deployment configs

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

## Questions?

Feel free to open an issue or discussion for questions about contributing.

---

**Thank you for contributing to Carfax Manus! 🚗**
