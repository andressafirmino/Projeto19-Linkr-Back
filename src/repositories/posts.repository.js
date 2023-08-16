import { db } from "../database/database.connection.js";

export async function publicPost(link, description, userId) {
    const result = db.query(`
    INSERT INTO posts (link, description, "userId", likes) VALUES ($1, $2, $3, $4)
    RETURNING "id";
    `, [link, description, userId, 0]);
    return result;
}

export async function publicHasthtag(idPost, name) {
    const result = db.query(`
    INSERT INTO hashtags ("idPost", name) VALUES ($1, $2);
    `, [idPost, name])
    return result;
}
