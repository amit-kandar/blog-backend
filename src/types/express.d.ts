import { Request } from 'express';
import { Document, Schema, model, Model, Types } from "mongoose";
import { UserDocument } from '../models/user.model';

declare global {
    namespace Express {
        interface Request {
            user: UserDocument;
        }
    }
}