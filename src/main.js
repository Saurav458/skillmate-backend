// This is the Starting Point of APP
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { authRouter } from "./routers/auth.js";
import { homeRouter } from "./routers/home.js";
import { Logger } from "./utils/logger.service.js";
import { logRequests } from "./middlewares/logger.middleware.js";

const app = express();
const logger = new Logger("Main");

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logRequests);

dotenv.config();
const PORT = process.env.PORT

// Home page
app.use("/", homeRouter);
// Auth Login / Signup
app.use("/auth", authRouter);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
