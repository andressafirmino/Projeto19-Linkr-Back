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
    try {
        await db.query(`
            DELETE FROM post_hashtags WHERE "postId" = $1;
        `, [postId]);

        await db.query(`
            DELETE FROM posts WHERE "id" = $1;
        `, [postId])
    } catch (err) {
        throw err;
    }
}

export async function updatePostsRepository(postId, link, description) {
    try {
        await db.query(`
            UPDATE posts SET link = $1, description = $2 WHERE "id" = $3
        `, [link, description, postId])
    } catch(err) {
        throw err;
    }
}