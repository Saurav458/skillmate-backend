import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { authRouter } from "./routers/auth.js";
import { homeRouter } from "./routers/home.js";
import { Logger } from "./utils/logger.service.js";
import { logRequests } from "./middlewares/logger.middleware.js";
import { sequelize } from "./database/sequelize.js";

dotenv.config(); // Must be at the top

const app = express();
const logger = new Logger("Main");
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logRequests);

// Routes
app.use("/", homeRouter);
app.use("/auth", authRouter);

// Start server only after DB is ready
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("Database sync failed:", err);
    process.exit(1); // exit if DB connection fails
  }
};

startServer();
