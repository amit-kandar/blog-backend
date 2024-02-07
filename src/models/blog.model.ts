import { Document, Schema, model, Model } from 'mongoose';

interface BlogDocument extends Document {
    title: string;
    image?: {
        url: string,
        public_id: string
    };
    content: string;
    author: Schema.Types.ObjectId;
    tags: Array<string>;
}

const BlogSchema = new Schema<BlogDocument, Model<BlogDocument>>({
    title: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    image: {
        url: {
            type: String,
            required: false,
        },
        public_id: {
            type: String,
            required: false,
        }
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    tags: {
        type: [String],
        required: true,
        index: true,
        trim: true
    }
}, { timestamps: true });

export const Blog = model<BlogDocument>('Blog', BlogSchema);
