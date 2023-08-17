import { db } from "../database/database.connection.js";

export async function publicPost(link, description, userId) {
    const result = db.query(`
    INSERT INTO posts (link, description, "userId") VALUES ($1, $2, $3)
    RETURNING "id";
    `, [link, description, userId]);
    return result;
}

export async function publicHasthtag(name) {
    const result = db.query(`
    INSERT INTO hashtags (name) VALUES ($1) RETURNING "id";
    `, [name]);
    return result;
}

export async function postTags(postId, tagId) {
    const result = db.query(`
    INSERT INTO post_hashtags ("postId", "tagId") VALUES ($1, $2);
    `, [postId, tagId]);
    return result;
}

export async function deletePost(postId, userId) {
    await db.query(`
    DELETE FROM post_hashtags WHERE "postId" = $1;
    `, [postId]);

    await db.query(`
    DELETE FROM posts WHERE "id" = $1;
    `, [postId])

}