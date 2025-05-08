# Contributing to Inventr Circuit Builder Platform

Thank you for your interest in contributing to this project! Here are some guidelines to help you get started.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Pull Requests

- Update the README.md with details of changes if applicable
- Update the documentation if needed
- The PR should work across different operating systems
- Follow the existing coding style and conventions
- Include appropriate tests
- Ensure all tests pass before submitting

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Setup

1. Clone your fork of the repository
   ```
   git clone https://github.com/your-username/inventr-platform.git
   cd inventr-platform
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up the database
   ```
   npm run db:push
   ```

4. Start the development server
   ```
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/inventr

# Session Secret
SESSION_SECRET=your-secure-secret-here

# Node Environment
NODE_ENV=development
```

## Project Structure

- `/client` - Frontend React application
- `/server` - Express backend API
- `/shared` - Shared types and utilities
- `/public` - Static assets

## Coding Standards

### General Guidelines

- Write clean, maintainable, and testable code
- Follow existing patterns in the codebase
- Keep functions small and focused on a single responsibility
- Add comments for complex logic
- Use meaningful variable and function names

### JavaScript/TypeScript

- Use TypeScript for type safety
- Follow the ESLint configuration
- Use async/await instead of promises where possible
- Avoid any unnecessary dependencies

### React

- Use functional components with hooks
- Keep components small and focused
- Use shared UI components from `/components/ui`
- Follow the existing file organization

### CSS/Styling

- Use TailwindCSS for styling
- Follow the existing design patterns
- Use the provided color tokens for consistency

## Security Guidelines

Please review our [Security Policy](SECURITY.md) for guidelines on:

- Secure coding practices
- Handling user data
- Authentication and authorization
- Reporting security vulnerabilities

## Testing

- Write tests for new features
- Run the existing test suite before submitting a PR
- Make sure your code doesn't break existing functionality

To run tests:
```
npm test
```

## Documentation

- Update documentation for any features you add or change
- Use JSDoc comments for functions and components
- Keep the README up to date

## Questions?

If you have any questions or need help, please:

1. Check if the question has already been answered in existing issues
2. Create a new issue with a clear description of your question
3. Be patient and respectful when waiting for a response

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).