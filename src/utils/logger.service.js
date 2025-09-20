import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const ENV = process.env.ENVIRONMENT || "production";
const LOG_FILE_PATH = path.join(process.cwd(), "logs", "app.log");

// Ensure logs folder exists in dev/staging
if (ENV === "production" || ENV === "staging") {
  const logDir = path.dirname(LOG_FILE_PATH);
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  // Create file with empty array if not exists
  if (!fs.existsSync(LOG_FILE_PATH))
    fs.writeFileSync(LOG_FILE_PATH, "[]", "utf-8");
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

    return param; // string, number, boolean
  }

  _writeToFile(logObj) {
    try {
      fs.appendFileSync(LOG_FILE_PATH, JSON.stringify(logObj) + "\n", "utf-8");
    } catch (err) {
      console.error("Failed to write log to file:", err);
    }
  }

  log(level, message, optionalParam) {
    const timestamp = new Date().toISOString();
    const extra = this._formatOptional(optionalParam);

    const logObj = {
      timestamp,
      level: level.toUpperCase(),
      context: this.context,
      message,
      extra: extra || undefined,
    };

    // Console output
    const logString = `[${timestamp}] [${level.toUpperCase()}] [${
      this.context
    }] ${message} ${extra ? JSON.stringify(extra) : ""}`;

    if (ENV === "production" || ENV === "staging") {
      this._writeToFile(logObj);
      console.log(logString);
    } else {
      if (level.toLowerCase() === "error") console.error(logString);
      else console.log(logString);
    }
  }

  info(message, optionalParam) {
    this.log("info", message, optionalParam);
  }

  debug(message, optionalParam) {
    this.log("debug", message, optionalParam);
  }

  notice(message, optionalParam) {
    this.log("notice", message, optionalParam);
  }

  error(message, optionalParam) {
    this.log("error", message, optionalParam);
  }
}
