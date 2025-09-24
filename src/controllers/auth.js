import { Student } from "../models/student.model.js";
import { Logger } from "../utils/logger.service.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const logger = new Logger("Auth Controller");

export function logout(req, res) {
  res.clearCookie("token");
  logger.info(`Logged out successfully`);
  res.json({ message: "Logged out successfully" });
}

export async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await Student.findOne({ where: { username } });
    if (!user) {
      logger.info(`No record found in database for user ${username}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      logger.notice(`Invalid credentials for user ${username}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "3h" }
    );

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      maxAge: 3000 * 60 * 60, // 3 hour
    });
    logger.info(`Login success for user ${username}`);
    res.json({ message: "Login successful" });
  } catch (err) {
    logger.error(`Failed to login, ${JSON.parse(err)}`);
    res.status(500).json({ message: "Server error" });
  }
}

export async function signup(req, res) {
  const { username, password, role } = req.body;

  if (!username || !password) {
    logger.notice(`Failed to signup: Missing required details`);
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    // check if user exists
    const existing = await Student.findOne({ where: { username } });
    if (existing) {
      logger.info(`${username} User already exists.`);
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert into DB
    await Student.create({
      username,
      password: hashedPassword,
      role,
      additional_data: {"created_via": "signup"}
    });

    logger.info(`${username} registered in database.`);
    res.json({ message: "Signup successful" });
  } catch (err) {
    logger.error(`Failed to Signup: ${JSON.parse(err)}`);
    res.status(500).json({ message: "Server error" });
  }
}
