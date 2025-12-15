# Aethla Backend API

A production-ready REST API backend for the Aethla cleaning services platform built with Node.js, Express.js, TypeScript, Mongoose, and MongoDB.

## 🚀 Features

- **TypeScript** - Type-safe code with full TypeScript support
- **Express.js** - Fast and minimal web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Error Handling** - Centralized error handling middleware
- **Authentication** - JWT-based authentication system
- **Validation** - Request validation and sanitization
- **Logging** - Structured logging utility
- **Environment Variables** - Secure configuration management
- **Async/Await** - Modern async error handling
- **Modular Architecture** - Clean, scalable folder structure

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   └── env.ts       # Environment variables
│   ├── controllers/     # Route controllers
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts    # JWT authentication
│   │   ├── asyncHandler.ts       # Async error wrapper
│   │   └── error.middleware.ts   # Global error handler
│   ├── models/          # Mongoose models
│   │   └── user.model.ts
│   ├── routes/          # API routes
│   │   ├── v1/          # Version 1 routes
│   │   │   ├── auth.routes.ts
│   │   │   └── user.routes.ts
│   │   └── index.ts     # Route aggregator
│   ├── utils/           # Utility functions
│   │   ├── appError.ts  # Custom error class
│   │   ├── logger.ts    # Logging utility
│   │   └── response.ts  # API response formatter
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── .env.example         # Environment variables template
├── .eslintrc.json       # ESLint configuration
├── .gitignore          # Git ignore rules
├── nodemon.json        # Nodemon configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/aethla
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   API_VERSION=v1
   ```

5. **Start MongoDB** (if running locally)
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community

   # On Linux
   sudo systemctl start mongod

   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

This will start the server with nodemon for automatic restarts on file changes.

### Production Mode

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

## 📡 API Endpoints

### Health Check

- **GET** `/api/health` - Server health check

### Authentication Routes (`/api/v1/auth`)

- **POST** `/api/v1/auth/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **POST** `/api/v1/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **GET** `/api/v1/auth/me` - Get current user (Protected)
- **POST** `/api/v1/auth/logout` - Logout user (Protected)

### User Routes (`/api/v1/users`)

All user routes require authentication (Bearer token in Authorization header).

- **GET** `/api/v1/users` - Get all users
- **GET** `/api/v1/users/me` - Get current user profile
- **GET** `/api/v1/users/:id` - Get user by ID
- **PATCH** `/api/v1/users/me` - Update current user profile
- **DELETE** `/api/v1/users/:id` - Delete user

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Example with cURL:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:5000/api/v1/users/me
```

## 📝 Example API Requests

### Register User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Current User (Protected)

```bash
curl -X GET http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret key for JWT | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `API_VERSION` | API version prefix | `v1` |

## 🏗️ Architecture Patterns

### Error Handling

- Custom `AppError` class for operational errors
- Global error handling middleware
- Consistent error response format
- Automatic error logging

### Async Operations

- `asyncHandler` wrapper for all async route handlers
- Automatic error catching and forwarding to error middleware

### Response Formatting

Standardized API responses:

**Success Response:**
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📦 Dependencies

### Production Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variable loader
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation

### Development Dependencies

- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `nodemon` - Development server with auto-reload
- `eslint` - Code linting
- `@types/*` - TypeScript type definitions

## 🧪 Testing

Testing setup can be added using Jest or Mocha. Example:

```bash
npm install --save-dev jest @types/jest ts-jest
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Environment Setup

Ensure all environment variables are set in your production environment (use environment variables in your hosting platform, not `.env` files).

### MongoDB Atlas

For cloud MongoDB deployment:

1. Create a MongoDB Atlas account
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in production environment

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linter: `npm run lint`
4. Test your changes
5. Submit a pull request

## 📄 License

ISC

## 👤 Author

Aethla Development Team

---

**Note:** Make sure to change the `JWT_SECRET` and other sensitive values in production environments!

