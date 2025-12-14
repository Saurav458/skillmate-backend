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

  try {
    const userDetail = await checkUserExists(phone);
    if (userDetail)
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });

    // Create user in database
    const newUser = await User.create({
      phone,
      useremail,
      name,
      role,
      additional_data: {},
    });

    // Generate JWT token
    const token = generateToken(newUser);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3 * 60 * 60 * 1000,
    });

    logger.info(`User registered successfully: ${useremail}`);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: buildUserResponse(newUser),
      },
    });
  } catch (error) {
    logger.error(`Signup - Error: ${error.message}`);
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
  try {
    const userDetail = await checkUserExists(phone);
    if (!userDetail)
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    return res.status(200).json({
      success: true,
      message: "User found",
      data: {
        user: buildUserResponse(userDetail),
      },
    });
  } catch (error) {
    logger.error(`getUserLoginDetails failed. Error: ${error.message}`);
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
  res.clearCookie("token");
  logger.info(`User logged out successfully`);
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}
