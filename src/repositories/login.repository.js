import { db } from "../database/database.connection.js";

export async function getLogin(email) {
  const result = await db.query(`SELECT * FROM users WHERE email=$1;`, [email]);
  return result;
}

export async function session(token, userId) {
  const result = await db.query(
    `INSERT INTO sessions (token, "userId") VALUES ($1, $2);`,
    [token, userId]
  );
  return result;
}
