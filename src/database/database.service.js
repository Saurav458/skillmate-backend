import { Client } from "pg";

function createClient() {
  return new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });
}

// For SELECT queries
export async function executeQuery(query, params = []) {
  const client = createClient();
  try {
    await client.connect();
    const result = await client.query(query, params);
    return result.rows; // return rows for SELECT
  } catch (err) {
    console.error("[DB] executeQuery error:", err.message);
    throw err;
  } finally {
    await client.end();
  }
}

// For INSERT, UPDATE, DELETE
export async function executeCommand(query, params = []) {
  const client = createClient();
  try {
    await client.connect();
    const result = await client.query(query, params);
    return result.rowCount; // return number of affected rows
  } catch (err) {
    console.error("[DB] executeCommand error:", err.message);
    throw err;
  } finally {
    await client.end();
  }
}
