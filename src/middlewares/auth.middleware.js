import jwt from "jsonwebtoken";
import { Logger } from "../utils/logger.service.js";

const JWT_SECRET = process.env.JWT_SECRET;
const logger = new Logger("Auth Middleware");

// Middleware to protect routes
export function requireAuth(req, res, next) {
  const token = req.cookies.token;
  const requestPath = req.originalUrl;

  logger.debug(`Auth verification attempt`, { path: requestPath });

  if (!token) {
    logger.warn(`Auth verification failed - No token provided`, {
      path: requestPath,
    });
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
  }

  try {
    logger.debug(`Verifying JWT token`, { path: requestPath });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    logger.debug(`✓ JWT token verified successfully`, {
      userId: decoded.id,
      path: requestPath,
    });
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      logger.warn(`Auth verification failed - Token expired`, {
        path: requestPath,
        expiredAt: err.expiredAt,
      });
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    if (err.name === "JsonWebTokenError") {
      logger.warn(`Auth verification failed - Invalid token`, {
        path: requestPath,
        error: err.message,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    logger.error(`Auth verification failed - ${err.message}`, {
      path: requestPath,
      stack: err.stack,
    });
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
