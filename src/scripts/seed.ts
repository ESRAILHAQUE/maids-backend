import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '../modules/user/user.model';
import { logger } from '../utils/logger';

/**
 * Seed script to populate database with test data
 */

const seedUsers = async () => {
    try {
        // Create admin user (john.doe@example.com)
        const adminExists = await User.findOne({ email: 'john.doe@example.com' });
        if (!adminExists) {
            await User.create({
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'aaaaaa',
                role: 'admin',
                isVerified: true,
                isSuspended: false,
                isDeleted: false,
                isActive: true,
            });
            logger.info('✅ Admin user created: john.doe@example.com / aaaaaa');
        } else {
            logger.info('ℹ️  Admin user already exists');
        }

        // Create additional admin user (admin@maids.com) for backward compatibility
        const adminExists2 = await User.findOne({ email: 'admin@maids.com' });
        if (!adminExists2) {
            await User.create({
                name: 'Admin User',
                email: 'admin@maids.com',
                password: 'admin123',
                role: 'admin',
                isVerified: true,
                isSuspended: false,
                isDeleted: false,
                isActive: true,
            });
            logger.info('✅ Admin user created: admin@maids.com / admin123');
        }

        // Create verified users
        const verifiedUsers = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                phone: '+1234567890',
                role: 'user' as const,
                isVerified: true,
                isSuspended: false,
                isDeleted: false,
                isActive: true,
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: 'password123',
                phone: '+1234567891',
                role: 'user' as const,
                isVerified: true,
                isSuspended: false,
                isDeleted: false,
                isActive: true,
            },
            {
                name: 'Bob Johnson',
                email: 'bob@example.com',
                password: 'password123',
                phone: '+1234567892',
                role: 'user' as const,
                isVerified: true,
                isSuspended: false,
                isDeleted: false,
                isActive: true,
            },
        ];

        for (const userData of verifiedUsers) {
            const exists = await User.findOne({ email: userData.email });
            if (!exists) {
                await User.create(userData);
                logger.info(`✅ Verified user created: ${userData.email}`);
            }
        }

        // Create unverified users (pending)
        const unverifiedUsers = [
            {
                name: 'Alice Williams',
                email: 'alice@example.com',
                password: 'password123',
                phone: '+1234567893',
                role: 'user' as const,
                isVerified: false,
                isSuspended: false,
                isDeleted: false,
                isActive: false,
            },
            {
                name: 'Charlie Brown',
                email: 'charlie@example.com',
                password: 'password123',
                phone: '+1234567894',
                role: 'user' as const,
                isVerified: false,
                isSuspended: false,
                isDeleted: false,
                isActive: false,
            },
            {
                name: 'Diana Prince',
                email: 'diana@example.com',
                password: 'password123',
                phone: '+1234567895',
                role: 'user' as const,
                isVerified: false,
                isSuspended: false,
                isDeleted: false,
                isActive: false,
            },
        ];

        for (const userData of unverifiedUsers) {
            const exists = await User.findOne({ email: userData.email });
            if (!exists) {
                await User.create(userData);
                logger.info(`✅ Unverified user created: ${userData.email}`);
            }
        }

        // Create suspended users
        const suspendedUsers = [
            {
                name: 'Eve Adams',
                email: 'eve@example.com',
                password: 'password123',
                phone: '+1234567896',
                role: 'user' as const,
                isVerified: true,
                isSuspended: true,
                isDeleted: false,
                isActive: false,
            },
        ];

        for (const userData of suspendedUsers) {
            const exists = await User.findOne({ email: userData.email });
            if (!exists) {
                await User.create(userData);
                logger.info(`✅ Suspended user created: ${userData.email}`);
            }
        }

        logger.info('✅ Seeding completed successfully');
    } catch (error) {
        logger.error('❌ Error seeding users:', error);
        throw error;
    }
};

const runSeed = async () => {
    try {
        await connectDatabase();
        logger.info('🌱 Starting database seeding...');
        await seedUsers();
        await mongoose.connection.close();
        logger.info('✅ Seeding process completed');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

// Run seed if this file is executed directly
if (require.main === module) {
    runSeed();
}

export { runSeed, seedUsers };

