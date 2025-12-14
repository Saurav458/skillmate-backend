import express from "express";
import {
  registerUser,
  getRegisteredUserDetails,
  logout,
} from "../controllers/auth.js";

export const authRouter = express.Router();

// ============================================================
// SIGNUP ROUTES
// ============================================================
authRouter.post("/signup/", registerUser);
// ============================================================
// LOGIN ROUTES
// ============================================================
authRouter.post("/login", getRegisteredUserDetails);
// ============================================================
// COMMON ROUTES
// ============================================================
authRouter.post("/logout", logout);
