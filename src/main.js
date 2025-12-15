import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRouter } from "./routers/auth.js";
import { homeRouter } from "./routers/home.js";
import { Logger } from "./utils/logger.service.js";
import { logRequests } from "./middlewares/logger.middleware.js";
import { testConnection, sequelize } from "./database/sequelize.js";

dotenv.config(); // Must be at the top

const app = express();
const logger = new Logger("Main");
const PORT = process.env.PORT;

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true, // Allow cookies to be sent
  })
);
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
    await testConnection();
    sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      logger.info(`✓ Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`, {
      stack: err.stack,
    });
    process.exit(1);
  }
};

startServer();

startServer();
