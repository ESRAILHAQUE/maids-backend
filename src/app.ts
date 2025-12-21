import express, { Application } from "express";
import cors from "cors";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

const app: Application = express();

// CORS middleware - must be before other middleware
app.use(cors({
  origin: env.nodeEnv === 'production'
    ? process.env.FRONTEND_URL || 'http://localhost:3000'
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (in development)
if (env.nodeEnv === "development") {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

// API routes
app.use("/api", routes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
