import { Student } from "../models/student.model.js";
import { Logger } from "../utils/logger.service.js";

const logger = new Logger("Home Controller");

export function homePage(req, res) {
  logger.info(`You are at home page`);
  res.json({ message: "You are at home page" });
}

export async function profile(req, res) {
  try {
    const user = await Student.findByPk(req.user.id, {
      attributes: ["id", "username"],
    });
    if (!user) {
      logger.notice(`No profile found for user id ${req.user.id}`);
      return res.status(404).json({ message: "User not found" });
    }
    logger.info(`Profile fetched successfully for user ${user.username}`);
    res.json({ user });
  } catch (err) {
    logger.error("[Profile Error]", err.message);
    res.status(500).json({ message: "Server error" });
  }
}