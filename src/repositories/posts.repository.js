import { db } from "../database/database.connection.js";
import urlMetadata from "url-metadata";
import axios from "axios";

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

async function getUrlMetaData(url) {
  try {
    const meta = await axios.get(`https://jsonlink.io/api/extract?url=${url}`);
    return meta.data;
  } catch (error) {
    console.error("Erro ao obter metadados da URL:", error);
    return null;
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

        const urlData = await getUrlMetaData(post.link);

        return {
          ...post,
          likes: likesCount,
          ownerUsername: user.username,
          ownerImage: user.image,
          hashtags: hashtags,
          liked: liked,
          urlData: urlData,
        };
      })
    );

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

//! FUNÇÃO getPostsRefactor
//? PEGA OS POSTS E OS RE_POSTS
export async function getPostsRefactor(req, res) {
  const { userId } = req.query;

  try {
    const postsQuery = await db.query(
      `
      SELECT
      p.*,
      COALESCE(r."userId", p."userId") AS "ownerUserId",
      COALESCE(u.username, ru.username) AS "ownerUsername",
      COALESCE(u.image, ru.image) AS "ownerImage",
      COUNT(l.id) AS likes,
      ARRAY_AGG(h.name) AS hashtags,
      CASE WHEN EXISTS (
          SELECT 1
          FROM likes
          WHERE likes."postId" = p.id AND likes."userId" = $1
      ) THEN true ELSE false END AS liked,
      CASE WHEN EXISTS (
          SELECT 1
          FROM "rePosts"
          WHERE "rePosts"."postId" = p.id AND "rePosts"."userId" = $1
      ) THEN true ELSE false END AS reposted
      FROM posts p
      LEFT JOIN "rePosts" r ON p.id = r."postId"
      LEFT JOIN users u ON p."userId" = u.id
      LEFT JOIN users ru ON r."userId" = ru.id
      LEFT JOIN likes l ON p.id = l."postId"
      LEFT JOIN post_hashtags ph ON p.id = ph."postId"
      LEFT JOIN hashtags h ON ph."tagId" = h.id
      GROUP BY p.id, "ownerUserId", "ownerUsername", "ownerImage"
      ORDER BY "createdAt" DESC;
      `,
      [userId]
    );

    const posts = await Promise.all(
      postsQuery.rows.map(async (post) => {
        const urlData = await getUrlMetaData(post.link);

        return {
          ...post,
          urlData: urlData,
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
  try {
    const postsQuery = await db.query(
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
    const posts = await Promise.all(
      postsQuery.rows.map(async (post) => {
        const urlData = await getUrlMetaData(post.link);

        return {
          ...post,
          urlData: urlData,
        };
      })
    );
    return posts;
  } catch (err) {
    console.log(err.message);
  }
}

export async function deletePostsRepository(postId) {
  await db.query(`DELETE FROM posts WHERE "id" = $1;`, [postId]);
}

export async function updatePostRepository(postId, description) {
  await db.query('UPDATE posts SET description = $1 WHERE "id" = $2', [
    description,
    postId,
  ]);
}

export async function userPosts(userId) {
  const result = await db.query(`SELECT * FROM posts WHERE "userId" = $1;`, [
    userId,
  ]);
  return result;
}

export async function userInfo(id) {
  const result = await db.query(
    `SELECT username, image FROM users WHERE id = $1;`,
    [id]
  );
  return result;
}
