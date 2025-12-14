import { User } from "../models/user.model.js";
import { Logger } from "../utils/logger.service.js";
import {
  generateToken,
  buildUserResponse,
  checkUserExists,
} from "../utils/auth.helper.js";
import dotenv from "dotenv";

dotenv.config();
const logger = new Logger("Auth Controller");

// ============================================================
// SIGNUP FLOWS
// ============================================================
export async function registerUser(req, res) {
  const { phone, useremail, name, role } = req.body;

  logger.info(`Registration attempt initiated`, {
    phone,
    useremail,
    name,
    role,
  });

  try {
    // Validate required fields
    if (!phone || !useremail || !name || !role) {
      logger.warn(`Registration failed - Missing required fields`, {
        phone,
        useremail,
        name,
        role,
      });
      return res.status(400).json({
        success: false,
        message: "Missing required fields: phone, useremail, name, role",
      });
    }

    const userDetail = await checkUserExists(phone);
    if (userDetail) {
      logger.warn(`Registration failed - User already exists`, {
        phone,
        useremail,
      });
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    // Create user in database
    logger.debug(`Creating new user in database`, { phone, useremail });
    const newUser = await User.create({
      phone,
      useremail,
      name,
      role,
      additional_data: {},
    });
    logger.debug(`User created successfully in database`, {
      userId: newUser.id,
      useremail,
    });

    // Generate JWT token
    logger.debug(`Generating JWT token for user`, { userId: newUser.id });
    const token = generateToken(newUser);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3 * 60 * 60 * 1000,
    });
    logger.debug(`JWT token set in cookie`);

    logger.info(`✓ User registered successfully: ${useremail}`, {
      userId: newUser.id,
    });
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: buildUserResponse(newUser),
      },
    });
  } catch (error) {
    logger.error(`Registration failed - ${error.message}`, {
      phone,
      useremail,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// ============================================================
// LOGIN FLOWS
// ============================================================
export async function getRegisteredUserDetails(req, res) {
  const { phone } = req.body;

  logger.info(`User login attempt initiated`, { phone });

  try {
    // Validate phone number
    if (!phone) {
      logger.warn(`Login failed - Phone number missing`);
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    logger.debug(`Checking if user exists`, { phone });
    const userDetail = await checkUserExists(phone);

    if (!userDetail) {
      logger.warn(`Login failed - User not found`, { phone });
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    logger.info(`✓ User login verification successful`, {
      phone,
      userId: userDetail.id,
    });
    return res.status(200).json({
      success: true,
      message: "User found",
      data: {
        user: buildUserResponse(userDetail),
      },
    });
  } catch (error) {
    logger.error(`Login verification failed - ${error.message}`, {
      phone,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/**
 * Logout user
 */
export function logout(req, res) {
  const userId = req.user?.id;

  logger.info(`User logout initiated`, { userId });

  try {
    res.clearCookie("token");
    logger.info(`✓ User logged out successfully`, { userId });
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error(`Logout failed - ${error.message}`, {
      userId,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
}
