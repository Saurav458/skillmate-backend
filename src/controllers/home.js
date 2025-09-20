import { executeQuery } from "../database/database.service.js";
import { Logger } from "../utils/logger.service.js";

const logger = new Logger("Home Controller");

export function homePage(req, res) {
  logger.info(`You are at home page`);
  res.json({ message: "You are at home page" });
}

export async function profile(req, res) {
  try {
    const result = await executeQuery(
      "SELECT id, username FROM students_tbl WHERE id = $1",
      [req.user.id]
    );
    logger.info(`Profile fetched successfully for user ${result[0].username}`);
    res.json({ user: result[0] });
  } catch (err) {
    logger.error("[Profile Error]", err.message);
    res.status(500).json({ message: "Server error" });
  }
}
