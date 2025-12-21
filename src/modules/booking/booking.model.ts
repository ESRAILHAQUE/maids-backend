import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface IBooking extends Document {
    service: string;
    hours: number;
    cleaners: number;
    materials: 'with' | 'without';
    date: string; // yyyy-mm-dd
    time: string; // HH:mm
    area: string;
    address: {
        zone?: string;
        building?: string;
        street?: string;
    };
    client: {
        name: string;
        phone: string;
        email?: string;
    };
    notes?: string;
    totalQAR: number;
    status: BookingStatus;
    payment: {
        status: PaymentStatus;
        method?: PaymentMethod;
        invoiceId?: string;
    };
    assignedStaffIds: string[];
    userId?: mongoose.Types.ObjectId; // Optional: link to user account if logged in
    createdAt: Date;
    updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
    {
        service: {
            type: String,
            required: [true, 'Service type is required'],
            trim: true,
        },
        hours: {
            type: Number,
            required: [true, 'Number of hours is required'],
            min: [1, 'Hours must be at least 1'],
        },
        cleaners: {
            type: Number,
            required: [true, 'Number of cleaners is required'],
            min: [1, 'Must have at least 1 cleaner'],
        },
        materials: {
            type: String,
            enum: ['with', 'without'],
            required: [true, 'Materials choice is required'],
        },
        date: {
            type: String,
            required: [true, 'Date is required'],
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
        },
        time: {
            type: String,
            required: [true, 'Time is required'],
        },
        area: {
            type: String,
            required: [true, 'Area is required'],
            trim: true,
        },
        address: {
            zone: { type: String, trim: true },
            building: { type: String, trim: true },
            street: { type: String, trim: true },
        },
        client: {
            name: {
                type: String,
                required: [true, 'Client name is required'],
                trim: true,
            },
            phone: {
                type: String,
                required: [true, 'Client phone is required'],
                trim: true,
            },
            email: {
                type: String,
                trim: true,
                lowercase: true,
                match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
            },
        },
        notes: {
            type: String,
            trim: true,
        },
        totalQAR: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total must be positive'],
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
            default: 'pending',
        },
        payment: {
            status: {
                type: String,
                enum: ['unpaid', 'paid', 'refunded'],
                default: 'unpaid',
            },
            method: {
                type: String,
                enum: ['cash', 'card', 'transfer'],
            },
            invoiceId: {
                type: String,
                trim: true,
            },
        },
        assignedStaffIds: {
            type: [String],
            default: [],
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ 'client.phone': 1 });
bookingSchema.index({ date: 1 });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

