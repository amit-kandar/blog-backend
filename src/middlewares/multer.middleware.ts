import multer from 'multer';
import path from 'path';
import { Request, Response } from 'express';

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb) {
        cb(null, './public/temp');
    },
    filename: function (req: Request, file: Express.Multer.File, cb) {
        const fileName = file.originalname;

        cb(null, fileName);
    }
});

export const upload = multer({ storage: storage });