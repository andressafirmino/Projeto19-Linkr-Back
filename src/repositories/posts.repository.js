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

export async function getPostTags(postId) {
  const hashtagsQuery = await db.query(
    `SELECT h.name FROM hashtags h
     JOIN post_hashtags ph ON h.id = ph."tagId"
     WHERE ph."postId" = $1`,
    [postId]
  );
  return hashtagsQuery.rows.map((row) => row.name);
}

export async function getPosts(_, res) {
  try {
    const postsQuery = await db.query(
      `SELECT * FROM posts ORDER BY "createdAt" DESC`
    );

    const posts = await Promise.all(
      postsQuery.rows.map(async (post) => {
        const likesQuery = await db.query(
          `SELECT COUNT(*) FROM likes WHERE "postId" = $1`,
          [post.id]
        );
        const likesCount = parseInt(likesQuery.rows[0].count);

        const userQuery = await db.query(
          `SELECT username, image FROM users WHERE id = $1`,
          [post.userId]
        );
        const user = userQuery.rows[0];

        const hashtags = await getPostTags(post.id);

        return {
          ...post,
          likes: likesCount,
          ownerUsername: user.username,
          ownerImage: user.image,
          hashtags: hashtags,
        };
      })
    );

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function searchUserRepository(user) {
    const result = await db.query(`SELECT * FROM users WHERE username LIKE $1;`, [user + '%']);
    return result;
}