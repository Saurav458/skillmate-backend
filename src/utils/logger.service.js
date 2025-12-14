import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const ENV = process.env.ENVIRONMENT || "development";
const LOGS_DIR = path.join(process.cwd(), "logs");

// Ensure logs folder exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Get today's log file path (one file per day)
function getDailyLogFilePath() {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format
  const logFileName = `app-${dateStr}.log`;
  return path.join(LOGS_DIR, logFileName);
}

export class Logger {
  constructor(context = "Main") {
    this.context = context;
  }

  _formatOptional(param) {
    if (param === undefined) return null;
    if (param instanceof Error) {
      return { message: param.message, stack: param.stack };
    }
    if (typeof param === "object") return param;
    return param;
  }

  _writeToFile(logObj) {
    try {
      const logFilePath = getDailyLogFilePath();
      const logString = JSON.stringify(logObj) + "\n";
      fs.appendFileSync(logFilePath, logString, "utf-8");
    } catch (err) {
      console.error("Failed to write log to file:", err);
    }
  }

  _formatLogString(level, message, extra) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${
      this.context
    }] ${message}${extra ? " " + JSON.stringify(extra) : ""}`;
  }

  log(level, message, optionalParam) {
    const timestamp = new Date().toISOString();
    const extra = this._formatOptional(optionalParam);

    const logObj = {
      timestamp,
      level: level.toUpperCase(),
      context: this.context,
      message,
      ...(extra && { extra }),
    };

    const logString = this._formatLogString(level, message, extra);

    // Console output
    if (level.toLowerCase() === "error") {
      console.error(logString);
    } else {
      console.log(logString);
    }

    // File output (always write in all environments)
    this._writeToFile(logObj);
  }

  info(message, optionalParam) {
    this.log("info", message, optionalParam);
  }

  debug(message, optionalParam) {
    this.log("debug", message, optionalParam);
  }

  warn(message, optionalParam) {
    this.log("warn", message, optionalParam);
  }

  notice(message, optionalParam) {
    this.log("notice", message, optionalParam);
  }

  error(message, optionalParam) {
    this.log("error", message, optionalParam);
  }
}
