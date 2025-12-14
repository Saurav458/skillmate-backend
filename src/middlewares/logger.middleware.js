import { Logger } from "../utils/logger.service.js";

// Middleware to log all incoming routes
const logger = new Logger("Request Logger");

export function logRequests(req, res, next) {
  const startTime = Date.now();
  const { method, originalUrl, ip, headers } = req;

  logger.info(`→ Incoming Request`, {
    method,
    url: originalUrl,
    ip: ip || headers["x-forwarded-for"] || "unknown",
    userAgent: headers["user-agent"],
  });

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    const logLevel = statusCode >= 400 ? "warn" : "info";
    logger.log(logLevel, `← Response Sent`, {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}
