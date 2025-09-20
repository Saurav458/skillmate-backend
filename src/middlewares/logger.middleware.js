import { Logger } from "../utils/logger.service.js";

// Added Middeleware to log the routes called by user
const logger = new Logger();

export function logRequests(req, res, next) {
  logger.info(`HTTP ${req.method} ${req.originalUrl}`);
  next();
}
