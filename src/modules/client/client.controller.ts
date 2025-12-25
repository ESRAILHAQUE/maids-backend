import { Request, Response, NextFunction } from 'express';
import { Booking } from '../booking/booking.model';
import { asyncHandler } from '../../middleware/asyncHandler';
import { sendSuccess } from '../../utils/response';

/**
 * Aggregate client summaries from all bookings (admin)
 * GET /api/v1/clients/summary
 */
export const getClientSummaries = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
        // Aggregate pipeline to build client summaries
        const bookings = await Booking.find().lean();

        // Build client rows
        const map = new Map<string, any>();
        for (const b of bookings) {
            if (!b.client?.phone) continue;
            const key = `${b.client.phone}::${b.client.name}`;
            const existing = map.get(key);
            const next = existing ?? {
                key,
                name: b.client.name,
                phone: b.client.phone,
                email: b.client.email,
                area: b.area,
                totalBookings: 0,
                lifetimeValue: 0,
                lastBookingAt: undefined,
                lastService: undefined,
                statuses: {},
            };
            next.totalBookings += 1;
            next.lifetimeValue += b.totalQAR;
            next.statuses[b.status] = (next.statuses[b.status] ?? 0) + 1;
            if (!next.lastBookingAt || b.date > next.lastBookingAt) {
                next.lastBookingAt = b.date;
                next.lastService = b.service;
                next.area = b.area;
            }
            if (!next.email && b.client.email) next.email = b.client.email;
            map.set(key, next);
        }
        const clients = [...map.values()].sort((a, b) => b.lifetimeValue - a.lifetimeValue);
        sendSuccess(res, clients, 'Clients retrieved successfully');
    }
);

