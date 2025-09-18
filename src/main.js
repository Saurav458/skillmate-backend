import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { authRouter } from "./routers/auth.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

dotenv.config();
const PORT = process.env.PORT;

// Auth Login / Signup
app.use("/", authRouter);

app.listen(PORT, () => {
  console.log(`[SUCCESS] Server running on port ${PORT}`);
});
