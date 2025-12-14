import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Initialize Neon connection
export const sql = neon(DATABASE_URL);

// Initialize Sequelize with Neon PostgreSQL
export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  pool: {
    max: 1,
    min: 1,
    idle: 0,
  },
  define: {
    timestamps: true,
  },
});

export const testConnection = async () => {
  try {
    console.log("\n[Database] Testing connection to Neon PostgreSQL...");
    await sequelize.authenticate();
    await sql`SELECT version()`;
    console.log("[Database] ✓ Neon SQL connection successful");
  } catch (error) {
    console.error("[Database] ✗ Connection failed:", error.message);
    throw error;
  }
};
