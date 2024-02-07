import express, { Application } from "express";
import cors from "cors";
import { DATA_LIMIT } from "./constants";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import redisClient from "./config/redis";

const app: Application = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: DATA_LIMIT }));

app.use(express.static("public"));

app.use(cookieParser());

app.use(helmet());

redisClient.connect();

//Import Routes
import userRoutes from './routes/user.routes';
import { errorHandler } from "./middlewares/errorHandler.middleware";

// Declare routes
app.use('/api/v1/users', userRoutes);

app.get("/", (req, res) => {
    res.status(200).json("Hello World");
})

app.use(errorHandler);


export { app }