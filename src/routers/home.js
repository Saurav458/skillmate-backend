import express from "express";
import { homePage, profile } from "../controllers/home.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const homeRouter = express.Router();

// Home
homeRouter.get("/", homePage);

// Profile (protected - Only logged in user)
homeRouter.get("/profile", requireAuth, profile);
