import mongoose, { Document, Schema } from 'mongoose';

export interface IStaff extends Document {
    name: string;
    phone: string;
    role: 'Cleaner' | 'Supervisor' | 'Driver';
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            unique: true,
        },
        role: {
            type: String,
            enum: ['Cleaner', 'Supervisor', 'Driver'],
            required: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Staff = mongoose.model<IStaff>('Staff', staffSchema);

