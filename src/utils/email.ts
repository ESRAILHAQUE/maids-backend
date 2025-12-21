import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

/**
 * Email Service
 * Handles sending emails for verification, password reset, etc.
 */

// Create reusable transporter
const createTransporter = () => {
    // If email config is not provided, use a test account (for development)
    if (!env.emailHost || !env.emailUser || !env.emailPassword) {
        logger.warn('Email configuration not found. Using test account. Emails will not be sent in production.');
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'test@ethereal.email',
                pass: 'test',
            },
        });
    }

    return nodemailer.createTransport({
        host: env.emailHost,
        port: env.emailPort || 587,
        secure: env.emailPort === 465,
        auth: {
            user: env.emailUser,
            pass: env.emailPassword,
        },
    });
};

const transporter = createTransporter();

/**
 * Send email verification
 */
export const sendVerificationEmail = async (
    email: string,
    name: string,
    verificationToken: string
): Promise<void> => {
    const verificationUrl = `${env.frontendUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: env.emailFrom,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #102a43; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Welcome to Maids Services!</h1>
          </div>
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hi ${name},</p>
            <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #102a43; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0066cc;">${verificationUrl}</p>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This link will expire in 24 hours. If you didn't create an account, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
        text: `
      Welcome to Maids Services!
      
      Hi ${name},
      
      Thank you for signing up! Please verify your email address by visiting:
      ${verificationUrl}
      
      This link will expire in 24 hours. If you didn't create an account, please ignore this email.
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Verification email sent to ${email}`);
    } catch (error) {
        logger.error(`Failed to send verification email to ${email}:`, error);
        throw new Error('Failed to send verification email');
    }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
    email: string,
    name: string,
    resetToken: string
): Promise<void> => {
    const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: env.emailFrom,
        to: email,
        subject: 'Reset Your Password',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #102a43; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Password Reset Request</h1>
          </div>
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hi ${name},</p>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #102a43; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0066cc;">${resetUrl}</p>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This link will expire in 10 minutes. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
        text: `
      Password Reset Request
      
      Hi ${name},
      
      You requested to reset your password. Visit this link to reset it:
      ${resetUrl}
      
      This link will expire in 10 minutes. If you didn't request a password reset, please ignore this email.
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
        logger.error(`Failed to send password reset email to ${email}:`, error);
        throw new Error('Failed to send password reset email');
    }
};

/**
 * Send account approval email
 */
export const sendAccountApprovalEmail = async (
    email: string,
    name: string
): Promise<void> => {
    const mailOptions = {
        from: env.emailFrom,
        to: email,
        subject: 'Your Account Has Been Approved',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Approved</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #102a43; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Account Approved!</h1>
          </div>
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hi ${name},</p>
            <p>Great news! Your account has been approved by our admin team. You can now access all features of our platform.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${env.frontendUrl}/login" 
                 style="background-color: #102a43; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Sign In Now
              </a>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              Thank you for choosing Maids Services!
            </p>
          </div>
        </body>
      </html>
    `,
        text: `
      Account Approved!
      
      Hi ${name},
      
      Great news! Your account has been approved by our admin team. You can now access all features of our platform.
      
      Sign in at: ${env.frontendUrl}/login
      
      Thank you for choosing Maids Services!
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Account approval email sent to ${email}`);
    } catch (error) {
        logger.error(`Failed to send account approval email to ${email}:`, error);
        throw new Error('Failed to send account approval email');
    }
};

/**
 * Send account suspension email
 */
export const sendAccountSuspensionEmail = async (
    email: string,
    name: string,
    reason?: string
): Promise<void> => {
    const mailOptions = {
        from: env.emailFrom,
        to: email,
        subject: 'Account Suspension Notice',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Suspended</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Account Suspended</h1>
          </div>
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hi ${name},</p>
            <p>We regret to inform you that your account has been suspended.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>If you believe this is an error, please contact our support team.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              Maids Services Support Team
            </p>
          </div>
        </body>
      </html>
    `,
        text: `
      Account Suspended
      
      Hi ${name},
      
      We regret to inform you that your account has been suspended.
      ${reason ? `Reason: ${reason}` : ''}
      
      If you believe this is an error, please contact our support team.
      
      Maids Services Support Team
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Account suspension email sent to ${email}`);
    } catch (error) {
        logger.error(`Failed to send account suspension email to ${email}:`, error);
        throw new Error('Failed to send account suspension email');
    }
};

