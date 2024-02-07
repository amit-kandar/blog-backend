import dotenv from "dotenv";
import { connectToDB } from "./database";
import { app } from "./app";

if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: '.env.dev' });
} else if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' });
} else if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.prod' });
}

const PORT = process.env.PORT || 8080;

connectToDB()
    .then(() => {
        app.on("error", err => {
            console.error("Error: ", err);

        })
        app.listen(PORT, () => {
            console.info(`server is running at port ${PORT}`);
        })
    })
    .catch(err => console.error("MongoDB connection failed!!", err))