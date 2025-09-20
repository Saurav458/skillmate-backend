import express from "express";
import { login, logout, signup } from "../controllers/auth.js";

export const authRouter = express.Router();

// Signup
authRouter.post("/signup", signup);

// Login
authRouter.post("/login", login);

// Logout
authRouter.post("/logout", logout);
