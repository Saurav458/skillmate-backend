import { User } from "../models/user.model.js";
import { Logger } from "./logger.service.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const logger = new Logger("Auth Helper");

/**
 * Check if user exists by phone or email
 */
export async function checkUserExists(phone) {
  try {
    const user = await User.findOne({
      where: { phone },
    });
    return user || null;
  } catch (error) {
    logger.error(`Error checking user existence: ${error.message}`);
    throw error;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      useremail: user.useremail,
      phone: user.phone,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "3h" }
  );
}

/**
 * Build user response object
 */
export function buildUserResponse(user, token = null) {
  const response = {
    id: user.id,
    useremail: user.useremail,
    phone: user.phone,
    name: user.name,
    role: user.role,
  };

  if (token) {
    response.token = token;
  }

  return response;
}

/**
 * Validate required fields
 */
export function validateRequiredFields(fields) {
  return {
    isValid: Object.values(fields).every((val) => val),
  };
}
