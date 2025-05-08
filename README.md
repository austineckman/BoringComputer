# Inventr Circuit Builder & Learning Platform

A nostalgic and interactive pixel art development platform for electronic circuit design, empowering makers and electronics enthusiasts through advanced learning technologies and comprehensive technical education.

## Overview

This application is a comprehensive learning platform for electronics and maker education, featuring:

- Interactive circuit building and simulation
- Educational quest-based learning
- Inventory and crafting systems
- Component glossary and educational resources
- Customizable user experience with retro aesthetics

## Technology Stack

- **Frontend**: TypeScript, React, Vite, TailwindCSS, ShadCN UI components
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom authentication with secure session management
- **Circuit Simulation**: AVR8js for Arduino simulation

## Security Features

This application implements various security best practices, including:

- **CSRF Protection**: All state-changing API requests require a valid CSRF token
- **Content Security Policy**: Strict CSP headers to prevent XSS attacks
- **Secure File Uploads**: Comprehensive file validation, type checking, and sanitization
- **Secure Password Storage**: Bcrypt password hashing with proper salting
- **Session Security**: HTTP-only cookies with secure settings and proper expiration
- **Input Validation**: Server-side validation for all user input
- **XSS Protection**: Headers and content sanitization to prevent cross-site scripting

## Installation

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/inventr-platform.git
   cd inventr-platform
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   ```
   npm run db:push
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/inventr

# Session Secret
SESSION_SECRET=your-secret-key-here

# Node Environment
NODE_ENV=development
```

## Project Structure

- `/client` - Frontend React application
- `/server` - Express backend API
- `/shared` - Shared types and utilities
- `/public` - Static assets

## Security Overview

### CSRF Protection

The application uses a custom CSRF token implementation that:

1. Generates unique tokens per session
2. Requires tokens for all state-changing operations (POST, PUT, DELETE)
3. Implements proper token validation and error handling

### File Upload Security

File uploads are protected through:

1. File type validation (both MIME type and magic numbers)
2. Size limits on uploads
3. Secure random filename generation
4. Content validation for uploaded files

### API Security

All API endpoints implement:

1. Proper authentication checking
2. Input validation
3. Rate limiting for sensitive operations
4. Error handling that doesn't leak sensitive information

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

## Acknowledgments

- [Inventr.io](https://inventr.io/) for inspiration
- [AVR8js](https://github.com/wokwi/avr8js) for the Arduino simulation
- All open source libraries and tools used in this project