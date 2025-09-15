import express from "express";

const app = express();

// Middlewares
app.use(express.json());

// Simple route for testing
app.get("/", (req, res) => {
  res.send("Backend is running smoothly");
});

export default app;