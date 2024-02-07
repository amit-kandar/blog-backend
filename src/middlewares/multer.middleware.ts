import multer from 'multer';
import path from 'path';
import { Request, Response } from 'express';

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb) {
        cb(null, './public/temp');
    },
    filename: function (req: Request, file: Express.Multer.File, cb) {
        // Access user-provided name from the request body or query params
        const userProvidedName = req.body.name || req.body.title;

        // Generate a random 6-digit number
        const randomSixDigits = Math.floor(100000 + Math.random() * 900000);

        // Get the file extension
        const ext = path.extname(file.originalname);

        // Construct the filename with user-provided name and random number
        const fileName = `${userProvidedName}_${randomSixDigits}${ext}`;

        cb(null, fileName);
    }
});

export const upload = multer({ storage: storage });