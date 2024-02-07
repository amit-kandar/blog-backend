import { Document, Schema, model, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';

export interface UserDocument extends Document {
    name: string;
    username: string;
    role: string;
    email: string;
    avatar: {
        url: string,
        public_id: string
    };
    password: string;
    refreshToken: string;
    isCorrectPassword(password: string): Promise<boolean>;
    generateAccessToken(): Promise<string>;
    generateRefreshToken(): Promise<string>;
}

const UserSchema = new Schema<UserDocument, Model<UserDocument>>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    role: {
        type: String,
        enum: ['regular', 'admin'],
        default: 'regular'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    avatar: {
        type: {
            url: { type: String, required: true },
            public_id: { type: String, required: true }
        },
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    }
}, { timestamps: true });

UserSchema.pre<UserDocument>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        logger.error("Error hashing password on user save", error);
    }
});

UserSchema.methods.isCorrectPassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.generateAccessToken = async function (): Promise<string> {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        },
    );
}

UserSchema.methods.generateRefreshToken = async function (): Promise<string> {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        },
    );
}
UserSchema.index({ name: 'text' });

export const User = model<UserDocument>('User', UserSchema);