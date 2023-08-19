import { db } from "../database/database.connection.js";

export async function getCountPostHashtags(hashtagId, postId){
  return await db.query( 
        `SELECT COUNT(*) AS count FROM post_hashtags WHERE "tagId" = $1 AND "postId" <> $2`,
        [hashtagId, postId]
      );
}

export async function deleteInPostHashtags(hashtagId, postId){
  await db.query(`DELETE FROM post_hashtags WHERE "tagId" = $1 AND "postId" = $2`, [hashtagId, postId]);
}

export async function getPostHashtags(postId) {
  const result = await db.query(
    `SELECT "tagId" FROM post_hashtags WHERE "postId" = $1;`,
    [postId]
  );
  return result.rows.map((row) => row.tagId);
}

export async function getAllPostHashtags(postId){
  return await db.query(
    `SELECT "tagId" FROM post_hashtags WHERE "postId" = $1;`,
    [postId]
  );
}

export async function deleteInPostHashtagById(postId){
  await db.query(`DELETE FROM likes WHERE "postId" = $1;`, [postId]);
  await db.query(`DELETE FROM post_hashtags WHERE "postId" = $1;`, [postId]);
}
