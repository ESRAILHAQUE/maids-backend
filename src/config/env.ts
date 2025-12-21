import dotenv from 'dotenv';

/**
 * Environment Configuration
 * Loads and validates environment variables
 */
dotenv.config();

interface EnvConfig {
  nodeEnv: string;
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpire: string;
  apiVersion: string;
  emailHost?: string;
  emailPort?: number;
  emailUser?: string;
  emailPassword?: string;
  emailFrom?: string;
  frontendUrl?: string;
}

/**
 * Validate required environment variables
 */
const validateEnv = (): void => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

validateEnv();

export const env: EnvConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  apiVersion: process.env.API_VERSION || 'v1',
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined,
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailFrom: process.env.EMAIL_FROM || 'noreply@maids.com',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

