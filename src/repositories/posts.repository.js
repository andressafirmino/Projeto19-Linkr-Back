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

export async function checkUserLikedPost(userId, postId) {
  try {
    const result = await db.query(
      `SELECT COUNT(*) FROM likes WHERE "postId" = $1 AND "userId" = $2`,
      [postId, userId]
    );
    const likeCount = parseInt(result.rows[0].count);
    return likeCount > 0;
  } catch (err) {
    console.error("Error checking user like:", err);
    return false;
  }
}

export async function getPosts(req, res) {
  const { userId } = req.query;

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

        const liked = await checkUserLikedPost(userId, post.id);

        return {
          ...post,
          likes: likesCount,
          ownerUsername: user.username,
          ownerImage: user.image,
          hashtags: hashtags,
          liked: liked,
        };
      })
    );

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function likePost(req, res) {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    await db.query(`INSERT INTO likes ("postId", "userId") VALUES ($1, $2)`, [
      postId,
      userId,
    ]);
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function unlikePost(req, res) {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    await db.query(`DELETE FROM likes WHERE "postId" = $1 AND "userId" = $2`, [
      postId,
      userId,
    ]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function searchUserRepository(user) {
  const result = await db.query(`SELECT * FROM users WHERE username LIKE $1;`, [
    user + "%",
  ]);
  return result;
}

export async function getTagByName(id, hashtag) {
  const posts = db.query(
    `SELECT
      "p"."id",
      "p"."link",
      "p"."description",
      "p"."userId",
      "p"."createdAt",
    COUNT("l"."id") AS "likes",
      "u"."username" AS "ownerUsername",
      "u"."image" AS "ownerImage",
    ARRAY_AGG("h"."name") AS "hashtags",
    CASE
      WHEN EXISTS (SELECT 1 FROM "likes" WHERE "postId" = "p"."id" AND "userId" = $1) THEN TRUE
      ELSE FALSE
    END AS "liked"
    FROM
      "posts" "p"
    JOIN
      "users" "u" ON "p"."userId" = "u"."id"
    LEFT JOIN
      "likes" "l" ON "p"."id" = "l"."postId"
    JOIN
      "post_hashtags" "ph" ON "p"."id" = "ph"."postId"
    JOIN
      "hashtags" "h" ON "ph"."tagId" = "h"."id"
    WHERE
      "h"."name" = $2
    GROUP BY
      "p"."id", "p"."link", "p"."description", "p"."userId", "p"."createdAt", "u"."username", "u"."image"
    ORDER BY
      "p"."createdAt" DESC;
    `,
    [id, hashtag]
  );
  return posts;
}

//refactor
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













