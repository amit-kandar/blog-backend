import { Document, Schema, model, Model } from 'mongoose';

interface CommentDocument extends Document {
    content: string;
    author: Schema.Types.ObjectId;
    blog: Schema.Types.ObjectId;
}

const CommentSchema = new Schema<CommentDocument, Model<Comment>>({
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    blog: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Blog"
    }
}, { timestamps: true });

export const Comment = model<CommentDocument>('Comment', CommentSchema);
