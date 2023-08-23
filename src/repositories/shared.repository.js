import { db } from "../database/database.connection.js";

export async function repost(userId, postId) {
  const result = await db.query(
    `INSERT INTO "rePosts" ("userId", "postId") VALUES ($1,$2)`,
    [userId, postId]
  );
  return result;
}
