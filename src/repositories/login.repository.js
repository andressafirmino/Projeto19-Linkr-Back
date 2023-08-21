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

export async function checkEmail(email) {
  const result = await db.query(
    `SELECT id FROM users WHERE email = $1;`,
    [email]
  );
  return result;
}

export async function postSignUp(username, email, password, image) {
  const result = await db.query(
    `INSERT INTO users (username, email, password, image) VALUES ($1, $2, $3, $4);`,
    [username, email, password, image]
  );
  return result;
}