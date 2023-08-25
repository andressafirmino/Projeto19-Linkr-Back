import { db } from "../database/database.connection.js";

export async function addComment(comment, postId, userId) {
    const result = db.query(`INSERT INTO comments (comment, "postId", "userId") VALUES ($1, $2, $3)
    ;`, [comment, postId, userId]);
    return result;
}