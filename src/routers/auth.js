import express from "express";

export const authRouter = express.Router();

authRouter.get("/", async (req, res) => {
  res.json({ message: "You are at home page" });
});

authRouter.get("/signup", async (req, res) => {
  res.json({ message: "You are at signup page" });
});
