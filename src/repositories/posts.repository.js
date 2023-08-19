import { db } from "../database/database.connection.js";

export async function publicPost(link, description, userId) {
  const result = db.query(
    `
    INSERT INTO posts (link, description, "userId") VALUES ($1, $2, $3)
    RETURNING "id";
    `,
    [link, description, userId]
  );
  return result;
}

export async function publicHasthtag(name) {
  const result = db.query(
    `
    INSERT INTO hashtags (name) VALUES ($1) RETURNING "id";
    `,
    [name]
  );
  return result;
}

export async function postTags(postId, tagId) {
  const result = db.query(
    `
    INSERT INTO post_hashtags ("postId", "tagId") VALUES ($1, $2);
    `,
    [postId, tagId]
  );
  return result;
}

export async function getPosts(_, res) {
  try {
    const postsQuery = await db.query(
      `SELECT * FROM posts ORDER BY "createdAt" DESC`
    );

    const posts = postsQuery.rows.map(async (post) => {
      const likesQuery = await db.query(
        `SELECT COUNT(*) FROM likes WHERE "postId" = $1`,
        [post.id]
      );
      const likesCount = parseInt(likesQuery.rows[0].count);

      return {
        ...post,
        likes: likesCount,
      };
    });

    const postsWithLikes = await Promise.all(posts);

    res.status(200).json(postsWithLikes);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function searchUserRepository(user) {
    const result = await db.query(`SELECT * FROM users WHERE username LIKE $1;`, [user + '%']);
    return result;
}

export async function deletePostsRepository(postId) {
    const hashtagsToDelete = await db.query(
      `SELECT "tagId" FROM post_hashtags WHERE "postId" = $1;`,
      [postId]
    );

    await db.query(`DELETE FROM post_hashtags WHERE "postId" = $1;`, [postId]);
    await db.query(`DELETE FROM likes WHERE "postId" = $1;`, [postId]);

    for (const hashtag of hashtagsToDelete.rows) {
      const hashtagId = hashtag.tagId;
      const hashtagNameQuery = await db.query(
        `SELECT "name" FROM hashtags WHERE "id" = $1`,
        [hashtagId]
      );

      const hashtagName = hashtagNameQuery.rows[0].name;
      const countQuery = await db.query(
        `SELECT COUNT(*) AS count FROM hashtags WHERE "name" = $1`,
        [hashtagName]
      );
      if (countQuery.rows[0].count === "1") {
        await db.query(`DELETE FROM hashtags WHERE "id" = $1`, [hashtagId]);
      }
    }

    await db.query(`DELETE FROM posts WHERE "id" = $1;`, [postId]);
}

export async function updatePostRepository(postId, link, description) {
  // Atualizar informações do post
  await db.query(
    'UPDATE posts SET link = $1, description = $2 WHERE "id" = $3',
    [link, description, postId]
  );
}

export async function getPostHashtags(postId) {
  const result = await db.query(
    `SELECT "tagId" FROM post_hashtags WHERE "postId" = $1;`,
    [postId]
  );

  return result.rows.map((row) => row.tagId);
}

export async function getPostHashtagsNames(currentHashtagsId) {
  const hashtagsNames = [];

  for (const id of currentHashtagsId) {
    const result = await db.query(`SELECT "name" FROM hashtags WHERE "id" = $1;`, [id]);
    hashtagsNames.push(result.rows[0].name);
  }

  return hashtagsNames;
}

export async function deleteInPostHashtags(hashtagId, postId){
  await db.query(`DELETE FROM post_hashtags WHERE "tagId" = $1 AND "postId" = $2`, [hashtagId, postId]);
}

export async function deleteHashtags(hashtagId){
  await db.query(`DELETE FROM hashtags WHERE "id" = $1`, [hashtagId]);
}

export async function getHashtags(hashtagName){
  return await db.query(`SELECT "id" FROM hashtags WHERE "name" = $1`, [hashtagName]);
}

export async function getCountPostHashtags(hashtagId, postId){
  return await db.query( 
        `SELECT COUNT(*) AS count FROM post_hashtags WHERE "tagId" = $1 AND "postId" <> $2`,
        [hashtagId, postId]
      );
}

